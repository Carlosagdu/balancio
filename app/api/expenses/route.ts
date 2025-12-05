import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { db } from "@/db/index";
import { balances, expenses, expenseShares, members } from "@/db/schema";

async function adjustBalance(
  tx: any,
  options: { groupId: string; creditorId: string; debtorId: string; delta: number }
) {
  const { groupId, creditorId, debtorId, delta } = options;
  if (delta <= 0 || creditorId === debtorId) {
    return;
  }

  let remaining = delta;

  const reverse = await tx.query.balances.findFirst({
    where: and(
      eq(balances.groupId, groupId),
      eq(balances.creditorId, debtorId),
      eq(balances.debtorId, creditorId)
    )
  });

  if (reverse) {
    const reverseAmount = Number(reverse.amount);
    if (reverseAmount > remaining) {
      const newAmount = reverseAmount - remaining;
      await tx
        .update(balances)
        .set({ amount: newAmount.toFixed(2), updatedAt: new Date() })
        .where(eq(balances.id, reverse.id));
      return;
    }
    await tx.delete(balances).where(eq(balances.id, reverse.id));
    remaining -= reverseAmount;
  }

  if (remaining <= 0) {
    return;
  }

  const existing = await tx.query.balances.findFirst({
    where: and(
      eq(balances.groupId, groupId),
      eq(balances.creditorId, creditorId),
      eq(balances.debtorId, debtorId)
    )
  });

  if (existing) {
    const newAmount = Number(existing.amount) + remaining;
    await tx
      .update(balances)
      .set({ amount: newAmount.toFixed(2), updatedAt: new Date() })
      .where(eq(balances.id, existing.id));
  } else {
    await tx.insert(balances).values({
      groupId,
      creditorId,
      debtorId,
      amount: remaining.toFixed(2)
    });
  }
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const description = formData.get("description")?.toString() ?? "";
  const amount = Number(formData.get("amount"));
  const date = formData.get("date")?.toString() ?? "";
  const paidById = formData.get("paidById")?.toString() ?? "";
  const groupId = formData.get("groupId")?.toString() ?? "";
  const participantIds = formData
    .getAll("participantIds")
    .map((value) => value.toString())
    .filter((value) => Boolean(value));

  if (!description || Number.isNaN(amount) || amount <= 0 || !date || !paidById || !groupId) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const groupMembers = await db
    .select({ id: members.id })
    .from(members)
    .where(eq(members.groupId, groupId));

  if (groupMembers.length === 0) {
    return NextResponse.json({ error: "Group not found or has no members" }, { status: 404 });
  }

  if (!groupMembers.some((member) => member.id === paidById)) {
    return NextResponse.json({ error: "Payer must belong to the group" }, { status: 400 });
  }

  const uniqueParticipantIds = Array.from(new Set(participantIds.length > 0 ? participantIds : groupMembers.map((member) => member.id)));

  const groupMemberSet = new Set(groupMembers.map((member) => member.id));
  if (!uniqueParticipantIds.every((memberId) => groupMemberSet.has(memberId))) {
    return NextResponse.json({ error: "Participants must belong to the group" }, { status: 400 });
  }

  if (!uniqueParticipantIds.includes(paidById)) {
    return NextResponse.json({ error: "Payer must be part of the expense participants" }, { status: 400 });
  }

  if (uniqueParticipantIds.length === 0) {
    return NextResponse.json({ error: "Select at least one participant" }, { status: 400 });
  }

  const participantMembers = uniqueParticipantIds.map((memberId) => ({ id: memberId }));

  const cents = Math.round(amount * 100);
  const baseShare = Math.floor(cents / participantMembers.length);
  const sharesInCents = participantMembers.map((_, index) => {
    if (index === participantMembers.length - 1) {
      const distributed = baseShare * (participantMembers.length - 1);
      return cents - distributed;
    }
    return baseShare;
  });

  const shareAmounts = sharesInCents.map((value) => value / 100);

  const expenseId = await db.transaction(async (tx) => {
    const [expense] = await tx
      .insert(expenses)
      .values({
        description,
        amount: amount.toFixed(2),
        date: new Date(date),
        groupId,
        paidById,
        currency: "USD"
      })
      .returning({ id: expenses.id });

    await tx.insert(expenseShares).values(
      shareAmounts.map((share, index) => ({
        expenseId: expense.id,
        memberId: participantMembers[index].id,
        amount: share.toFixed(2)
      }))
    );

    for (let index = 0; index < participantMembers.length; index += 1) {
      const memberId = participantMembers[index].id;
      if (memberId === paidById) continue;
      await adjustBalance(tx, {
        groupId,
        creditorId: paidById,
        debtorId: memberId,
        delta: shareAmounts[index]
      });
    }

    return expense.id;
  });

  return NextResponse.json({ message: "Expense stored", expenseId });
}

export async function GET() {
  const allExpenses = await db.query.expenses.findMany();
  return NextResponse.json({ data: allExpenses });
}
