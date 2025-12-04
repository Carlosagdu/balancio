import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/index";
import { expenses, expenseShares, members } from "@/db/schema";

export async function POST(request: Request) {
  const formData = await request.formData();
  const description = formData.get("description")?.toString() ?? "";
  const amount = Number(formData.get("amount"));
  const date = formData.get("date")?.toString() ?? "";
  const paidById = formData.get("paidById")?.toString() ?? "";
  const groupId = formData.get("groupId")?.toString() ?? "";

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

  const cents = Math.round(amount * 100);
  const baseShare = Math.floor(cents / groupMembers.length);
  const sharesInCents = groupMembers.map((_, index) => {
    if (index === groupMembers.length - 1) {
      const distributed = baseShare * (groupMembers.length - 1);
      return cents - distributed;
    }
    return baseShare;
  });

  const [expense] = await db
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

  await db.insert(expenseShares).values(
    sharesInCents.map((shareCents, index) => ({
      expenseId: expense.id,
      memberId: groupMembers[index].id,
      amount: (shareCents / 100).toFixed(2)
    }))
  );

  return NextResponse.json({ message: "Expense stored", expenseId: expense.id });
}

export async function GET() {
  const allExpenses = await db.query.expenses.findMany();
  return NextResponse.json({ data: allExpenses });
}
