import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, CopyCheck, RefreshCcw, UsersRound, Wallet } from "lucide-react";
import { db } from "@/db/index";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ThemeToggle } from "@/components/theme-toggle";

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

export default async function DashboardPage() {
  const groupsWithRelations = await db.query.groups.findMany({
    with: {
      members: true,
      expenses: {
        with: { shares: true }
      },
      balances: true
    }
  });

  const activeGroup = groupsWithRelations[0];
  const members = activeGroup?.members ?? [];
  const expenses = activeGroup?.expenses ?? [];
  const balances = activeGroup?.balances ?? [];
  const memberMap = new Map(members.map((member) => [member.id, member]));
  const currentMemberId = members[0]?.id ?? null;

  const totalGroupSpend = expenses.reduce((sum, expense) => sum + asNumber(expense.amount), 0);
  const friendsOweYouTotal = currentMemberId
    ? balances
        .filter((balance) => balance.creditorId === currentMemberId)
        .reduce((sum, balance) => sum + asNumber(balance.amount), 0)
    : 0;
  const youOweTotal = currentMemberId
    ? balances
        .filter((balance) => balance.debtorId === currentMemberId)
        .reduce((sum, balance) => sum + asNumber(balance.amount), 0)
    : 0;

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

  const summaryCards: SummaryCard[] = [
    {
      title: "Group spend",
      value: formatCurrency(totalGroupSpend),
      description: `${expenses.length} logged expenses`,
      icon: Wallet
    },
    {
      title: "Friends owe you",
      value: formatCurrency(friendsOweYouTotal),
      description: friendsOweYouTotal > 0 ? "Collect when ready" : currentMemberId ? "All settled" : "Add yourself to a group",
      accent: "text-emerald-600 dark:text-emerald-400",
      icon: CopyCheck
    },
    {
      title: "You owe",
      value: formatCurrency(youOweTotal),
      description: youOweTotal > 0 ? "Send a quick payback" : currentMemberId ? "Nothing pending" : "Add yourself to a group",
      accent: youOweTotal > 0 ? "text-amber-600 dark:text-amber-400" : "text-slate-900 dark:text-slate-100",
      icon: RefreshCcw
    }
  ];

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10 lg:py-12">
      <section className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400">Dashboard</p>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">Shared expenses</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Keep every split tidy and transparent. Light visuals only, no gradients.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <ThemeToggle />
          <Button asChild className="w-full sm:w-auto">
            <Link href="/groups/new">
              <UsersRound className="mr-2 h-4 w-4" /> New group
            </Link>
          </Button>
          <Button variant="outline" className="w-full sm:w-auto">
            Settle up
          </Button>
        </div>
      </section>

      <section>
        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Your groups</CardTitle>
              <CardDescription>Pick a group to join, invite friends, or log expenses.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {groupsWithRelations.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center dark:border-slate-700">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  You don&apos;t have any groups yet. Create one to get started.
                </p>
                <Button asChild className="mt-4">
                  <Link href="/groups/new">Create group</Link>
                </Button>
              </div>
            ) : (
              groupsWithRelations.map((group) => (
                <div
                  key={group.id}
                  className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{group.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {group.members.length} member{group.members.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                    <Button asChild variant="outline" className="w-full sm:w-auto">
                      <Link href={`/groups/${group.id}`}>Open group</Link>
                    </Button>
                    <Button asChild variant="ghost" className="w-full justify-center sm:w-auto">
                      <Link href={`/groups/${group.id}`}>View details</Link>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-6 xl:grid-cols-3">
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
        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>{activeGroup ? activeGroup.name : "No group selected"}</CardTitle>
              <CardDescription>Manage members and quick invites.</CardDescription>
            </div>
            <Badge className="w-max border-none bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {members.length} members
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {members.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">Add members to start tracking expenses.</p>
            ) : (
              members.map((member) => (
                <div key={member.id} className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{member.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{member.email ?? "Invite pending"}</p>
                  </div>
                </div>
              ))
            )}
            <Button variant="ghost" className="w-full justify-center border border-dashed border-slate-200 dark:border-slate-700">
              Invite member
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Logged expenses</CardTitle>
              <CardDescription>Mirror of the current expense log.</CardDescription>
            </div>
            <Button variant="ghost" className="w-full justify-between text-slate-500 dark:text-slate-300 sm:w-auto">
              View all
              <ArrowUpRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {expenses.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No expenses added to this group.</p>
            ) : (
              expenses.map((expense) => (
                <div key={expense.id} className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{expense.description ?? "Untitled expense"}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {formatDate(expense.date)} · Paid by {memberMap.get(expense.paidById)?.name ?? "Unknown"}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {formatCurrency(asNumber(expense.amount), expense.currency ?? "USD")}
                  </p>
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
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Even split balance inside {activeGroup?.name ?? "this group"}
                        </p>
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
              <CardTitle>Expense breakdown</CardTitle>
              <CardDescription>Each expense is evenly split between members.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {expenses.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">Log an expense to see the breakdown.</p>
            ) : (
              expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
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
                        <Badge
                          key={`${expense.id}-${share.memberId}`}
                          className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                        >
                          {shareName.split(" ")[0]} · {formatCurrency(asNumber(share.amount), expense.currency ?? "USD")}
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
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Member settlement status</CardTitle>
              <CardDescription>Compare paid amount versus even share.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {memberSummaries.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No members available for this view.</p>
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
      </section>
    </main>
  );
}
