import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, CheckCircle2, Plus, Wallet } from "lucide-react";
import { CreateGroupCard } from "@/components/create-group-card";
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

const summaryCards: SummaryCard[] = [
  {
    title: "Shared this month",
    value: "$1,280",
    description: "Across 12 expenses",
    icon: Wallet
  },
  {
    title: "Friends owe you",
    value: "$540",
    description: "3 open balances",
    accent: "text-emerald-600"
  },
  {
    title: "You owe",
    value: "$310",
    description: "2 pending invites",
    accent: "text-amber-600"
  }
];

const activeSplits = [
  {
    id: "lisbon-trip",
    name: "Lisbon trip",
    members: ["You", "Maya", "Leo", "Ana"],
    progress: 72,
    youOwe: "$80",
    due: "Due in 3 days"
  },
  {
    id: "flat-utilities",
    name: "Flat utilities",
    members: ["You", "Ben", "Victoria"],
    progress: 54,
    youOwe: "$120",
    due: "Auto-settle on 28th"
  },
  {
    id: "Brunch club",
    name: "Saturday brunch club",
    members: ["You", "Cam", "Isabela"],
    progress: 38,
    youOwe: "$45",
    due: "Next meetup Sunday"
  }
];

const recentActivity = [
  {
    id: "1",
    title: "Maya covered groceries",
    detail: "Split four ways",
    amount: "$64",
    type: "credit"
  },
  {
    id: "2",
    title: "You logged ride shares",
    detail: "Weekend hangouts group",
    amount: "$48",
    type: "debit"
  },
  {
    id: "3",
    title: "Ben settled rent top-up",
    detail: "Utilities split",
    amount: "$220",
    type: "credit"
  }
];

export default function DashboardPage() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 sm:py-10 lg:py-12">
      <section className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-wide text-slate-500">Dashboard</p>
          <h1 className="text-3xl font-semibold text-slate-900">Shared expenses</h1>
          <p className="text-sm text-slate-500">
            Keep every split tidy and transparent. Light visuals only, no gradients.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" className="w-full sm:w-auto">
            Settle up
          </Button>
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" /> Add expense
          </Button>
        </div>
      </section>

      <section>
        <CreateGroupCard />
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
              <p className={`text-3xl font-semibold ${card.accent ?? "text-slate-900"}`}>
                {card.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>Active splits</CardTitle>
              <CardDescription>Minimal overview across your current groups.</CardDescription>
            </div>
            <Badge className="w-max border-none bg-slate-100 text-slate-600">3 groups</Badge>
          </CardHeader>
          <CardContent className="space-y-5">
            {activeSplits.map((split) => (
              <div
                key={split.id}
                className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-slate-900">{split.name}</p>
                    <p className="text-sm text-slate-500">{split.members.join(" • ")}</p>
                  </div>
                  <Badge className="bg-slate-100 text-slate-600">{split.due}</Badge>
                </div>
                <div className="mt-4 space-y-3">
                  <Progress value={split.progress} />
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-slate-500">Completion</p>
                      <p className="font-semibold text-slate-900">{split.progress}%</p>
                    </div>
                    <div>
                      <p className="text-slate-500">You owe</p>
                      <p className="font-semibold text-slate-900">{split.youOwe}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Recent activity</CardTitle>
                <CardDescription>Simple list of what changed.</CardDescription>
              </div>
              <Button variant="ghost" className="w-full justify-between text-slate-500 sm:w-auto">
                View all
                <ArrowUpRight className="ml-1 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">{activity.title}</p>
                    <p className="text-xs text-slate-500">{activity.detail}</p>
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      activity.type === "credit" ? "text-emerald-600" : "text-amber-600"
                    }`}
                  >
                    {activity.type === "credit" ? "+" : "-"}
                    {activity.amount}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Ready to settle</CardTitle>
                <CardDescription>Two balances are green and ready.</CardDescription>
              </div>
              <Badge className="border-none bg-emerald-50 text-emerald-700">Auto-pay enabled</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-slate-900">Ben - utilities</p>
                  <p className="text-xs text-slate-500">$140 will clear tonight</p>
                </div>
                <Button size="sm" variant="outline" className="w-full sm:w-auto">
                  Review
                </Button>
              </div>
              <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-slate-900">Maya - brunch club</p>
                  <p className="text-xs text-slate-500">$65 ready to payout</p>
                </div>
                <Button size="sm" variant="outline" className="w-full sm:w-auto">
                  Review
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
