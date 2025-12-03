import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const description = formData.get("description")?.toString() ?? "";
  const amount = Number(formData.get("amount"));
  const date = formData.get("date")?.toString() ?? "";
  const paidById = formData.get("paidById")?.toString() ?? "";

  if (!description || Number.isNaN(amount) || amount <= 0 || !date || !paidById) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  // TODO: Persist with Prisma when backend is ready.
  return NextResponse.json({ message: "Expense received", payload: { description, amount, date, paidById } });
}
