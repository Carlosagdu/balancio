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

//TODO Work on allowing users to select which users were involved in an expense
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
        with: {
          creditor: true,
          debtor: true
        }
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
      accent: outstandingTotal > 0 ? "text-amber-600 dark:text-amber-400" : "text-slate-900 dark:text-slate-100",
      icon: RefreshCcw
    },
    {
      title: "Members involved",
      value: String(distinctMembers.length),
      description: distinctMembers.length > 0 ? "People owing or owed" : "No members yet",
      icon: Users2
    },
    {
      title: "Group scope",
      value: group.name,
      description: "Balances from this group only",
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
      <section className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Button asChild variant="ghost" className="w-fit gap-2 text-slate-500 dark:text-slate-300">
            <Link href={`/groups/${groupId}`}>
              <ArrowLeft className="h-4 w-4" /> Back to group
            </Link>
          </Button>
        </div>
        <div>
          <p className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400">Ledger</p>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">{group.name} · Balance ledger</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Overview of who owes whom inside this group. All values are derived from the group&apos;s expenses.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
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

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ledger entries</CardTitle>
            <CardDescription>Every pending balance within {group.name}.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {ledgerEntries.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No balances have been logged yet.</p>
            ) : (
              ledgerEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {entry.debtor?.name ?? "Someone"} owes {entry.creditor?.name ?? "Someone"}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Calculated from shared expenses</p>
                    </div>
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {formatCurrency(asNumber(entry.amount))}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <Badge className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">Even split</Badge>
                    <span>Generated automatically.</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ledger analytics</CardTitle>
            <CardDescription>Insights for {group.name}.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Top balances</p>
              {biggestBalances.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">No outstanding balances.</p>
              ) : (
                biggestBalances.map((balance) => (
                  <div key={balance.id} className="mt-3">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {balance.debtor?.name ?? "Someone"} ➜ {balance.creditor?.name ?? "Someone"}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{formatCurrency(asNumber(balance.amount))}</p>
                  </div>
                ))
              )}
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
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
              More insights are coming soon—category exposure, settlement reminders, and more.
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
