import Link from "next/link";
import { notFound } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { ArrowLeft, Layers, RefreshCcw, Users2 } from "lucide-react";
import { eq } from "drizzle-orm";
import { db } from "@/db/index";
import { groups } from "@/db/schema";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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

function asNumber(value: string | number | null | undefined) {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  return 0;
}

type GroupLedgerPageProps = {
  params: {
    groupId: string;
  };
};

export default async function GroupLedgerPage({ params }: GroupLedgerPageProps) {
  const { groupId } = params;

  const group = await db.query.groups.findFirst({
    where: eq(groups.id, groupId),
    with: {
      balances: {
        with: { creditor: true, debtor: true }
      }
    }
  });

  if (!group) {
    notFound();
  }

  const ledgerEntries = group.balances;
  const outstandingTotal = ledgerEntries.reduce((sum, entry) => sum + asNumber(entry.amount), 0);
  const distinctMembers = Array.from(
    new Set(
      ledgerEntries.flatMap((entry) => [entry.creditorId, entry.debtorId]).filter((value): value is string => Boolean(value))
    )
  );

  const summaryCards: SummaryCard[] = [
    {
      title: "Outstanding total",
      value: formatCurrency(outstandingTotal),
      description: ledgerEntries.length > 0 ? `${ledgerEntries.length} ledger item${ledgerEntries.length === 1 ? "" : "s"}` : "Nothing pending",
      accent: outstandingTotal > 0 ? "text-amber-600" : "text-slate-900",
      icon: RefreshCcw
    },
    {
      title: "Members involved",
      value: String(distinctMembers.length),
      description: distinctMembers.length > 0 ? "People owing or owed" : "No members yet",
      icon: Users2
    },
    {
      title: "Group",
      value: group.name,
      description: "Balances scoped to this group",
      icon: Layers
    }
  ];

  const biggestBalances = ledgerEntries
    .slice()
    .sort((a, b) => asNumber(b.amount) - asNumber(a.amount))
    .slice(0, 5);

  const perMemberTotals = ledgerEntries.reduce<Record<string, number>>((map, entry) => {
    const creditorKey = entry.creditorId ?? "creditor";
    const debtorKey = entry.debtorId ?? "debtor";
    map[creditorKey] = (map[creditorKey] ?? 0) + asNumber(entry.amount);
    map[debtorKey] = (map[debtorKey] ?? 0) + asNumber(entry.amount);
    return map;
  }, {});

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-8 sm:px-6 lg:py-10">
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <Button asChild variant="ghost" className="w-fit gap-2 text-slate-500 dark:text-slate-300">
            <Link href={`/groups/${groupId}`}>
              <ArrowLeft className="h-4 w-4" /> Back to group
            </Link>
          </Button>
        </div>
        <div className="rounded-[32px] bg-gradient-to-b from-indigo-600 via-indigo-600/90 to-indigo-700 p-6 text-white shadow-xl shadow-indigo-500/30">
          <p className="text-sm uppercase tracking-wide text-white/70">Ledger overview</p>
          <h1 className="mt-2 text-3xl font-semibold">{group.name}</h1>
          <p className="text-sm text-white/80">Balances generated from every expense logged in this group.</p>
          <div className="mt-6 flex flex-wrap gap-4 text-sm text-white/80">
            <div>
              <p className="text-xs uppercase">Outstanding</p>
              <p className="text-2xl font-semibold">{formatCurrency(outstandingTotal)}</p>
            </div>
            <div>
              <p className="text-xs uppercase">Members</p>
              <p className="text-2xl font-semibold">{distinctMembers.length}</p>
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
          <CardHeader>
            <CardTitle>Ledger entries</CardTitle>
            <CardDescription>Every pending amount inside {group.name}.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {ledgerEntries.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No balances logged yet.</p>
            ) : (
              ledgerEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-2xl border border-slate-100 px-4 py-3 dark:border-slate-800"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {entry.debtor?.name ?? "Someone"} ➜ {entry.creditor?.name ?? "Someone"}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Auto-created from expenses</p>
                    </div>
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {formatCurrency(asNumber(entry.amount))}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <Badge className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">Even split</Badge>
                    <span>Generated automatically</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-0 bg-white shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800">
          <CardHeader>
            <CardTitle>Ledger analytics</CardTitle>
            <CardDescription>Highlights and future settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-slate-100 p-4 dark:border-slate-800">
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Top balances</p>
              {biggestBalances.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">No outstanding balances.</p>
              ) : (
                biggestBalances.map((balance) => (
                  <div key={balance.id} className="mt-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {balance.debtor?.name ?? "Someone"} ➜ {balance.creditor?.name ?? "Someone"}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Needs settlement</p>
                    </div>
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{formatCurrency(asNumber(balance.amount))}</span>
                  </div>
                ))
              )}
            </div>
            <div className="rounded-2xl border border-slate-100 p-4 dark:border-slate-800">
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Member involvement</p>
              {distinctMembers.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">Add members to see engagement.</p>
              ) : (
                distinctMembers.slice(0, 5).map((memberId) => {
                  const memberName =
                    group.balances.find((entry) => entry.creditorId === memberId)?.creditor?.name ??
                    group.balances.find((entry) => entry.debtorId === memberId)?.debtor?.name ??
                    "Member";
                  return (
                    <div key={memberId} className="mt-3 flex items-center justify-between text-sm">
                      <span>{memberName}</span>
                      <span className="text-slate-500 dark:text-slate-400">{formatCurrency(perMemberTotals[memberId] ?? 0)}</span>
                    </div>
                  );
                })
              )}
            </div>
            <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
              Coming soon: reminders, auto-settlement suggestions, and custom balance rules.
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
