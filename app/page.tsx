import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, ChevronRight, Plus, RefreshCcw, UsersRound, Wallet } from "lucide-react";
import { db } from "@/db/index";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ThemeToggle } from "@/components/theme-toggle";

type QuickStat = {
  label: string;
  amount: string;
  sublabel: string;
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
      expenses: { with: { shares: true } },
      balances: true
    }
  });

  const activeGroup = groupsWithRelations[0];
  const members = activeGroup?.members ?? [];
  const expenses = activeGroup?.expenses ?? [];
  const balances = activeGroup?.balances ?? [];
  const memberMap = new Map(members.map((member) => [member.id, member]));

  const totalGroupSpend = expenses.reduce((sum, expense) => sum + asNumber(expense.amount), 0);
  const outstandingTotal = balances.reduce((sum, balance) => sum + asNumber(balance.amount), 0);
  const savingsGoal = 11500;
  const simulatedSavings = 8230;
  const budgetCap = 6500;

  const quickStats: QuickStat[] = [
    {
      label: "Group spend",
      amount: formatCurrency(totalGroupSpend),
      sublabel: `${expenses.length} logged expenses`,
      icon: Wallet
    },
    {
      label: "Outstanding ledger",
      amount: formatCurrency(outstandingTotal),
      sublabel: balances.length > 0 ? `${balances.length} active items` : "No balances",
      accent: outstandingTotal > 0 ? "text-amber-600" : "text-slate-900",
      icon: RefreshCcw
    }
  ];

  const recentExpenses = expenses.slice(0, 6);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6 lg:py-10">
      <section className="space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Welcome back</p>
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">Your shared wallet</h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild className="gap-2 rounded-full px-5">
              <Link href="/groups/new">
                <UsersRound className="h-4 w-4" /> New group
              </Link>
            </Button>
          </div>
        </header>

        <div className="rounded-[32px] bg-gradient-to-b from-blue-500 via-blue-500/90 to-blue-600 p-6 text-white shadow-lg shadow-blue-500/20">
          <div className="flex items-center justify-between text-sm text-blue-100">
            <span>Tap to see more groups</span>
            <ChevronRight className="h-4 w-4" />
          </div>
          <div className="mt-6 space-y-2">
            <p className="text-sm uppercase tracking-wide text-blue-100">Total balance</p>
            <p className="text-4xl font-bold">{formatCurrency(totalGroupSpend)}</p>
            <p className="text-xs text-blue-100">Across all active groups</p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="default" className="rounded-full bg-white/20 px-4 text-white hover:bg-white/30">
              Hide balance
            </Button>
            <Button variant="default" className="rounded-full bg-white px-4 text-blue-600 hover:bg-white/90">
              <Plus className="mr-2 h-4 w-4" /> Add money
            </Button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <Card className="rounded-3xl border-0 bg-white shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800">
          <CardHeader className="space-y-1">
            <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">This month</CardTitle>
            <CardDescription className="text-sm text-slate-500 dark:text-slate-400">Spent out of {formatCurrency(budgetCap)}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(totalGroupSpend)}</p>
            <Progress value={Math.min((totalGroupSpend / budgetCap) * 100, 100)} className="h-2 rounded-full" />
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Budget</span>
              <span>{formatCurrency(budgetCap)}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-3xl border-0 bg-white shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800">
          <CardHeader className="space-y-1">
            <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">Shared savings</CardTitle>
            <CardDescription className="text-sm text-slate-500 dark:text-slate-400">Saved out of {formatCurrency(savingsGoal)}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(simulatedSavings)}</p>
            <div className="relative h-28 w-28">
              <svg viewBox="0 0 100 100" className="h-full w-full">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="10" />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#2563eb"
                  strokeWidth="10"
                  strokeDasharray={`${(simulatedSavings / savingsGoal) * 283} 283`}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-xs text-slate-600 dark:text-slate-300">
                <span className="font-semibold">{Math.round((simulatedSavings / savingsGoal) * 100)}%</span>
                <span>Saved</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {quickStats.map((stat) => (
          <Card key={stat.label} className="rounded-3xl border-0 bg-white shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800">
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base">{stat.label}</CardTitle>
                <CardDescription>{stat.sublabel}</CardDescription>
              </div>
              {stat.icon && (
                <div className="rounded-full bg-slate-100 p-3 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <stat.icon className="h-4 w-4" />
                </div>
              )}
            </CardHeader>
            <CardContent>
              <p className={`text-3xl font-semibold ${stat.accent ?? "text-slate-900 dark:text-slate-100"}`}>{stat.amount}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Transactions</h2>
          <Button variant="ghost" asChild className="text-sm text-slate-500 dark:text-slate-400">
            <Link href={activeGroup ? `/groups/${activeGroup.id}` : "/"} className="flex items-center gap-1">
              See group
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <Card className="rounded-3xl border-0 bg-white shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800">
          <CardContent className="divide-y divide-slate-100 px-0 dark:divide-slate-800">
            {recentExpenses.length === 0 ? (
              <p className="px-4 py-6 text-sm text-slate-500 dark:text-slate-400">No expenses yet.</p>
            ) : (
              recentExpenses.map((expense) => (
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
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Groups</h2>
          <Button variant="ghost" asChild className="text-sm text-slate-500 dark:text-slate-400">
            <Link href="/groups/new">Create new</Link>
          </Button>
        </div>
        <Card className="rounded-3xl border-0 bg-white shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800">
          <CardContent className="space-y-4">
            {groupsWithRelations.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center dark:border-slate-800">
                <p className="text-sm text-slate-500 dark:text-slate-400">You don&apos;t have any groups yet. Create one to get started.</p>
                <Button asChild className="mt-4 rounded-full px-6">
                  <Link href="/groups/new">Create group</Link>
                </Button>
              </div>
            ) : (
              groupsWithRelations.map((group) => (
                <div key={group.id} className="flex items-center justify-between rounded-2xl border border-slate-100 p-3 dark:border-slate-800">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{group.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{group.members.length} members</p>
                  </div>
                  <Button asChild variant="outline" className="rounded-full px-4 text-sm">
                    <Link href={`/groups/${group.id}`}>Open</Link>
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
