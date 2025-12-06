import Link from "next/link";
import { notFound } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { ArrowLeft, ArrowUpRight, RefreshCcw, Wallet } from "lucide-react";
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
      expenses: {
        with: { shares: true }
      },
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
  const currentMemberId = members[0]?.id ?? null;

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
      title: "Avg. per expense",
      value: formatCurrency(averageExpense),
      description: "Even split across all members",
      icon: ArrowUpRight
    },
    {
      title: "Outstanding balance",
      value: formatCurrency(outstandingTotal),
      description: balances.length > 0 ? `${balances.length} ledger item${balances.length === 1 ? "" : "s"}` : "Nothing pending",
      accent: outstandingTotal > 0 ? "text-amber-600 dark:text-amber-400" : "text-slate-900 dark:text-slate-100",
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
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Button asChild variant="ghost" className="w-fit gap-2 text-slate-500 dark:text-slate-300">
            <Link href="/">
              <ArrowLeft className="h-4 w-4" /> Back to dashboard
            </Link>
          </Button>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href={`/groups/${group.id}/ledger`}>Balance ledger</Link>
            </Button>
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href={`/groups/${group.id}/settings`}>Settings</Link>
            </Button>
            {members.length > 0 ? (
              <LogExpenseDialog members={members} groupId={group.id} />
            ) : (
              <Button variant="ghost" disabled>
                Add members to log expenses
              </Button>
            )}
          </div>
        </div>
        <div>
          <p className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400">Group detail</p>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">{group.name}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Specific overview for {group.name}. Review expenses, balances, and settlement guidance for this exact crew.
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle>{card.title}</CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </div>
              {card.icon && (
                <div className="rounded-2xl bg-slate-100 p-3 text-slate-500 dark:bg-slate-800/60">
                  <card.icon className="h-5 w-5" />
                </div>
              )}
            </CardHeader>
            <CardContent>
              <p className={`text-3xl font-semibold ${card.accent ?? "text-slate-900 dark:text-slate-100"}`}>{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Expense log</CardTitle>
              <CardDescription>Every expense saved for this group along with who paid.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {expenses.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No expenses have been recorded yet.</p>
            ) : (
              expenses.map((expense) => (
                <div key={expense.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {expense.description ?? "Untitled expense"}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {formatDate(expense.date)} · Paid by {memberMap.get(expense.paidById)?.name ?? "Unknown"}
                      </p>
                    </div>
                    <span className="text-base font-semibold text-slate-900 dark:text-slate-100">
                      {formatCurrency(asNumber(expense.amount), expense.currency ?? "USD")}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(expense.shares ?? []).map((share) => {
                      const shareName = memberMap.get(share.memberId)?.name ?? "Member";
                      return (
                        <Badge key={`${expense.id}-${share.memberId}`} className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {shareName.split(" ")[0]} · {formatCurrency(asNumber(share.amount))}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Balance ledger</CardTitle>
            <CardDescription>Track who owes whom right now.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {balances.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">All balances are settled.</p>
            ) : (
              balances.map((balance) => {
                const creditor = memberMap.get(balance.creditorId);
                const debtor = memberMap.get(balance.debtorId);
                const isYouCreditor = currentMemberId ? balance.creditorId === currentMemberId : false;
                const isYouDebtor = currentMemberId ? balance.debtorId === currentMemberId : false;
                return (
                  <div
                    key={balance.id}
                    className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {debtor?.name ?? "Someone"} owes {creditor?.name ?? "Someone"}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Even split balance inside {group.name}</p>
                      </div>
                      <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {formatCurrency(asNumber(balance.amount))}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      {isYouCreditor && (
                        <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">You receive</Badge>
                      )}
                      {isYouDebtor && (
                        <Badge className="bg-amber-50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200">You owe</Badge>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Group balances</CardTitle>
              <CardDescription>Everyone&apos;s current position inside this group.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {memberBalanceSummaries.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">Add members to see balances.</p>
            ) : (
              memberBalanceSummaries.map(({ member, balance }) => (
                <div
                  key={member.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{member.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{member.email ?? "Invite pending"}</p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-semibold ${
                        balance > 0
                          ? "text-emerald-600 dark:text-emerald-400"
                          : balance < 0
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-slate-600 dark:text-slate-300"
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

        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Member settlement status</CardTitle>
              <CardDescription>Compare paid amount versus even share.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {memberSummaries.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">Add members to see settlement stats.</p>
            ) : (
              memberSummaries.map(({ member, paid, share, owes, owed, settledRatio, net }) => (
                <div
                  key={member.id}
                  className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
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

        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Analytics</CardTitle>
              <CardDescription>Quick insights for this group.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Most generous</p>
              {memberSummaries.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">No contributors yet.</p>
              ) : (
                memberSummaries
                  .slice()
                  .sort((a, b) => b.paid - a.paid)
                  .slice(0, 1)
                  .map(({ member, paid }) => (
                    <div key={member.id} className="mt-2">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{member.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Logged {formatCurrency(paid)}</p>
                    </div>
                  ))
              )}
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Largest balance</p>
              {balances.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">No outstanding balances.</p>
              ) : (
                balances
                  .slice()
                  .sort((a, b) => asNumber(b.amount) - asNumber(a.amount))
                  .slice(0, 1)
                  .map((balance) => {
                    const creditor = memberMap.get(balance.creditorId)?.name ?? "Friend";
                    const debtor = memberMap.get(balance.debtorId)?.name ?? "Friend";
                    return (
                      <div key={balance.id} className="mt-2">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {debtor} ➜ {creditor}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{formatCurrency(asNumber(balance.amount))}</p>
                      </div>
                    );
                  })
              )}
            </div>
            <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
              Keep logging expenses to unlock more trends like category split and timeline.
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
