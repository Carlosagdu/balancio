import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, CopyCheck, Plus, RefreshCcw, UsersRound, Wallet } from "lucide-react";
import { LogExpenseDialog } from "@/components/log-expense-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ThemeToggle } from "@/components/theme-toggle";

const currentMemberId = "member-you";

type SummaryCard = {
  title: string;
  value: string;
  description: string;
  accent?: string;
  icon?: LucideIcon;
};

type Member = {
  id: string;
  name: string;
  email?: string;
  role?: "Organizer" | "Guest";
};

type ExpenseShareRow = {
  memberId: string;
  amount: number;
};

type Expense = {
  id: string;
  description: string;
  date: string;
  amount: number;
  currency: string;
  paidById: string;
  shares: ExpenseShareRow[];
};

type BalanceRow = {
  id: string;
  creditorId: string;
  debtorId: string;
  amount: number;
};

const group = {
  id: "group-lisbon",
  name: "Lisbon Getaway",
  createdAt: "2024-07-01"
};

const members: Member[] = [
  { id: currentMemberId, name: "Nico Vega", email: "you@balancio.app", role: "Organizer" },
  { id: "member-maya", name: "Maya Estevez", email: "maya@balancio.app" },
  { id: "member-leo", name: "Leo Jensen", email: "leo@balancio.app" },
  { id: "member-ana", name: "Ana Viera", email: "ana@balancio.app" }
];

const memberMap = members.reduce<Record<string, Member>>((map, member) => {
  map[member.id] = member;
  return map;
}, {});

const expenses: Expense[] = [
  {
    id: "expense-1",
    description: "Alfama loft weekend",
    date: "2024-07-02",
    amount: 720,
    currency: "USD",
    paidById: "member-maya",
    shares: members.map((member) => ({
      memberId: member.id,
      amount: 180
    }))
  },
  {
    id: "expense-2",
    description: "Surf lessons",
    date: "2024-07-04",
    amount: 260,
    currency: "USD",
    paidById: currentMemberId,
    shares: members.map((member) => ({
      memberId: member.id,
      amount: 65
    }))
  },
  {
    id: "expense-3",
    description: "Barrio Alto dinner",
    date: "2024-07-05",
    amount: 148,
    currency: "USD",
    paidById: "member-leo",
    shares: members.map((member) => ({
      memberId: member.id,
      amount: 37
    }))
  }
];

const balances: BalanceRow[] = [
  {
    id: "balance-1",
    creditorId: "member-maya",
    debtorId: currentMemberId,
    amount: 115
  },
  {
    id: "balance-2",
    creditorId: "member-maya",
    debtorId: "member-leo",
    amount: 115
  },
  {
    id: "balance-3",
    creditorId: currentMemberId,
    debtorId: "member-ana",
    amount: 65
  }
];

function formatCurrency(value: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency
  }).format(value);
}

function formatDate(isoDate: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric"
  }).format(new Date(isoDate));
}

const totalGroupSpend = expenses.reduce((sum, expense) => sum + expense.amount, 0);
const friendsOweYouTotal = balances
  .filter((balance) => balance.creditorId === currentMemberId)
  .reduce((sum, balance) => sum + balance.amount, 0);
const youOweTotal = balances
  .filter((balance) => balance.debtorId === currentMemberId)
  .reduce((sum, balance) => sum + balance.amount, 0);

const memberSummaries = members.map((member) => {
  const paid = expenses
    .filter((expense) => expense.paidById === member.id)
    .reduce((sum, expense) => sum + expense.amount, 0);
  const share = expenses.reduce((sum, expense) => {
    const shareRow = expense.shares.find((row) => row.memberId === member.id);
    return shareRow ? sum + shareRow.amount : sum;
  }, 0);
  const owes = balances
    .filter((balance) => balance.debtorId === member.id)
    .reduce((sum, balance) => sum + balance.amount, 0);
  const owed = balances
    .filter((balance) => balance.creditorId === member.id)
    .reduce((sum, balance) => sum + balance.amount, 0);
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
    description: friendsOweYouTotal > 0 ? "Collect when ready" : "All settled",
    accent: "text-emerald-600 dark:text-emerald-400",
    icon: CopyCheck
  },
  {
    title: "You owe",
    value: formatCurrency(youOweTotal),
    description: youOweTotal > 0 ? "Send a quick payback" : "Nothing pending",
    accent: youOweTotal > 0 ? "text-amber-600 dark:text-amber-400" : "text-slate-900 dark:text-slate-100",
    icon: RefreshCcw
  }
];

export default function DashboardPage() {

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
          <LogExpenseDialog members={members} groupId={group.id} />
        </div>
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
                <div className="rounded-2xl bg-slate-100 p-3 text-slate-500">
                  <card.icon className="h-5 w-5" />
                </div>
              )}
            </CardHeader>
            <CardContent>
              <p className={`text-3xl font-semibold ${card.accent ?? "text-slate-900 dark:text-slate-100"}`}>
                {card.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>{group.name}</CardTitle>
              <CardDescription>Manage members and quick invites.</CardDescription>
            </div>
            <Badge className="w-max border-none bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {members.length} members
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {members.map((member) => (
              <div key={member.id} className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{member.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{member.email ?? "Invite pending"}</p>
                </div>
                {member.role && (
                  <Badge className="bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200">{member.role}</Badge>
                )}
              </div>
            ))}
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
            {expenses.map((expense) => (
              <div key={expense.id} className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{expense.description}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {formatDate(expense.date)} · Paid by {memberMap[expense.paidById]?.name ?? "Unknown"}
                  </p>
                </div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {formatCurrency(expense.amount, expense.currency)}
                </p>
              </div>
            ))}
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
                const creditor = memberMap[balance.creditorId];
                const debtor = memberMap[balance.debtorId];
                const isYouCreditor = balance.creditorId === currentMemberId;
                const isYouDebtor = balance.debtorId === currentMemberId;
                return (
                  <div key={balance.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {debtor?.name} owes {creditor?.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Even split balance inside {group.name}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {formatCurrency(balance.amount)}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      {isYouCreditor && <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">You receive</Badge>}
                      {isYouDebtor && <Badge className="bg-amber-50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200">You owe</Badge>}
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
            {expenses.map((expense) => (
              <div key={expense.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{expense.description}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {formatDate(expense.date)} · Paid by {memberMap[expense.paidById]?.name}
                    </p>
                  </div>
                  <span className="text-base font-semibold text-slate-900 dark:text-slate-100">
                    {formatCurrency(expense.amount, expense.currency)}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {expense.shares.map((share) => {
                    const shareName = memberMap[share.memberId]?.name ?? "Member";
                    return (
                      <Badge
                        key={`${expense.id}-${share.memberId}`}
                        className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                      >
                        {shareName.split(" ")[0]} · {formatCurrency(share.amount, expense.currency)}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            ))}
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
            {memberSummaries.map(({ member, paid, share, owes, owed, settledRatio, net }) => (
              <div key={member.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
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
            ))}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
