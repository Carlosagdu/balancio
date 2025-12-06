import Link from "next/link";
import { notFound } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { ArrowLeft, ArrowUpRight, Cog, RefreshCcw, Wallet } from "lucide-react";
import { eq } from "drizzle-orm";
import { db } from "@/db/index";
import { groups } from "@/db/schema";
import { LogExpenseDialog } from "@/components/log-expense-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type SummaryCard = {
  title: string;
  value: string;
  description: string;
  accent?: string;
  icon?: LucideIcon;
};

function formatCurrency(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency
  }).format(value);
}

function formatDate(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric"
  }).format(date);
}

function asNumber(value: string | number | null | undefined) {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  return 0;
}

type GroupDetailPageProps = {
  params: {
    groupId: string;
  };
};

export default async function GroupDetailPage({ params }: GroupDetailPageProps) {
  const { groupId } = params;

  const group = await db.query.groups.findFirst({
    where: eq(groups.id, groupId),
    with: {
      members: true,
      expenses: { with: { shares: true } },
      balances: true
    }
  });

  if (!group) {
    notFound();
  }

  const members = group.members;
  const expenses = group.expenses;
  const balances = group.balances;
  const memberMap = new Map(members.map((member) => [member.id, member]));

  const totalGroupSpend = expenses.reduce((sum, expense) => sum + asNumber(expense.amount), 0);
  const averageExpense = expenses.length > 0 ? totalGroupSpend / expenses.length : 0;
  const outstandingTotal = balances.reduce((sum, balance) => sum + asNumber(balance.amount), 0);

  const summaryCards: SummaryCard[] = [
    {
      title: "Total spend",
      value: formatCurrency(totalGroupSpend),
      description: `${expenses.length} logged expenses`,
      icon: Wallet
    },
    {
      title: "Avg. expense",
      value: formatCurrency(averageExpense),
      description: "Even split across members",
      icon: ArrowUpRight
    },
    {
      title: "Ledger pending",
      value: formatCurrency(outstandingTotal),
      description: balances.length > 0 ? `${balances.length} active items` : "Nothing pending",
      accent: outstandingTotal > 0 ? "text-amber-600" : "text-slate-900",
      icon: RefreshCcw
    }
  ];

  const memberSummaries = members.map((member) => {
    const paid = expenses
      .filter((expense) => expense.paidById === member.id)
      .reduce((sum, expense) => sum + asNumber(expense.amount), 0);
    const share = expenses.reduce((sum, expense) => {
      const shareRow = (expense.shares ?? []).find((row) => row.memberId === member.id);
      return shareRow ? sum + asNumber(shareRow.amount) : sum;
    }, 0);
    const owes = balances
      .filter((balance) => balance.debtorId === member.id)
      .reduce((sum, balance) => sum + asNumber(balance.amount), 0);
    const owed = balances
      .filter((balance) => balance.creditorId === member.id)
      .reduce((sum, balance) => sum + asNumber(balance.amount), 0);
    const settledRatio = share ? Math.min((paid / share) * 100, 100) : 100;
    return {
      member,
      paid,
      share,
      owes,
      owed,
      settledRatio,
      net: paid - share
    };
  });

  const memberBalanceSummaries = memberSummaries.map((summary) => ({
    member: summary.member,
    balance: summary.owed - summary.owes
  }));

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6 lg:py-10">
      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Button asChild variant="ghost" className="w-fit gap-2 text-slate-500 dark:text-slate-300">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" /> Back
            </Link>
          </Button>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" className="rounded-full px-4 text-sm">
              <Link href={`/groups/${group.id}/ledger`}>Ledger</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full px-4 text-sm">
              <Link href={`/groups/${group.id}/settings`}>Settings</Link>
            </Button>
            {members.length > 0 ? (
              <LogExpenseDialog members={members} groupId={group.id} />
            ) : (
              <Button variant="ghost" disabled>
                Invite members
              </Button>
            )}
          </div>
        </div>
        <div className="rounded-[32px] bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-900/80 p-6 text-white shadow-xl shadow-slate-900/30">
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-white/70">
            <span>{members.length} member{members.length === 1 ? "" : "s"}</span>
            <Button asChild variant="default" className="rounded-full bg-white/10 px-4 text-white">
              <Link href={`/groups/${group.id}/settings`}>
                <Cog className="mr-2 h-4 w-4" /> Manage group
              </Link>
            </Button>
          </div>
          <div className="mt-6 space-y-2">
            <p className="text-sm uppercase tracking-wide text-white/70">Total balance</p>
            <p className="text-4xl font-bold">{formatCurrency(totalGroupSpend)}</p>
            <p className="text-xs text-white/70">Active ledger: {formatCurrency(outstandingTotal)}</p>
          </div>
          <div className="mt-6 flex flex-wrap gap-4 text-sm text-white/80">
            <div>
              <p className="font-semibold">{formatCurrency(totalGroupSpend)}</p>
              <p>Total spend</p>
            </div>
            <div>
              <p className="font-semibold">{formatCurrency(outstandingTotal)}</p>
              <p>Ledger pending</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {summaryCards.map((card) => (
          <Card key={card.title} className="rounded-3xl border-0 bg-white shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800">
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base">{card.title}</CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </div>
              {card.icon && (
                <div className="rounded-full bg-slate-100 p-3 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <card.icon className="h-4 w-4" />
                </div>
              )}
            </CardHeader>
            <CardContent>
              <p className={`text-3xl font-semibold ${card.accent ?? "text-slate-900 dark:text-slate-100"}`}>{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-3xl border-0 bg-white shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Expense log</CardTitle>
              <CardDescription>Recent transactions and who covered them.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="divide-y divide-slate-100 px-0 dark:divide-slate-800">
            {expenses.length === 0 ? (
              <p className="px-4 py-6 text-sm text-slate-500 dark:text-slate-400">No expenses yet.</p>
            ) : (
              expenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between px-4 py-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{expense.description ?? "Untitled expense"}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {formatDate(expense.date)} · Paid by {memberMap.get(expense.paidById)?.name ?? "Unknown"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {formatCurrency(asNumber(expense.amount), expense.currency ?? "USD")}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Even split</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-0 bg-white shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800">
          <CardHeader>
            <CardTitle>Group balances</CardTitle>
            <CardDescription>Everyone&apos;s current position.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {memberBalanceSummaries.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">Add members to see balances.</p>
            ) : (
              memberBalanceSummaries.map(({ member, balance }) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-100 px-4 py-3 dark:border-slate-800"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{member.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{member.email ?? "Invite pending"}</p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-semibold ${
                        balance > 0 ? "text-emerald-600 dark:text-emerald-400" : balance < 0 ? "text-amber-600 dark:text-amber-400" : "text-slate-900 dark:text-slate-100"
                      }`}
                    >
                      {balance === 0 ? "Settled" : formatCurrency(Math.abs(balance))}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {balance > 0 ? "To collect" : balance < 0 ? "To pay" : "Even split"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-3xl border-0 bg-white shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800">
          <CardHeader>
            <CardTitle>Member settlement</CardTitle>
            <CardDescription>Paid vs. share comparison.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {memberSummaries.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No members available.</p>
            ) : (
              memberSummaries.map(({ member, paid, share, owes, owed, settledRatio, net }) => (
                <div key={member.id} className="rounded-2xl border border-slate-100 p-4 dark:border-slate-800">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{member.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Paid {formatCurrency(paid)} · Share {formatCurrency(share)}
                      </p>
                    </div>
                    <Badge
                      className={
                        net >= 0
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                          : "bg-amber-50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200"
                      }
                    >
                      {net >= 0 ? "Ahead" : "Needs to settle"}
                    </Badge>
                  </div>
                  <div className="mt-3 space-y-2">
                    <Progress value={settledRatio} />
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>{owed > 0 ? `${formatCurrency(owed)} to collect` : "No credits"}</span>
                      <span>{owes > 0 ? `${formatCurrency(owes)} to send` : "Settled"}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-0 bg-white shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800">
          <CardHeader>
            <CardTitle>Ledger highlights</CardTitle>
            <CardDescription>Top outstanding balances.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {balances.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">All settled.</p>
            ) : (
              balances
                .slice()
                .sort((a, b) => asNumber(b.amount) - asNumber(a.amount))
                .slice(0, 5)
                .map((balance) => {
                  const creditor = memberMap.get(balance.creditorId);
                  const debtor = memberMap.get(balance.debtorId);
                  return (
                    <div key={balance.id} className="rounded-2xl border border-slate-100 p-4 dark:border-slate-800">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {debtor?.name ?? "Someone"} ➜ {creditor?.name ?? "Someone"}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Even split balance</p>
                        </div>
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(asNumber(balance.amount))}</span>
                      </div>
                    </div>
                  );
                })
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
