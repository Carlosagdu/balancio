import Link from "next/link";
import { ArrowLeft, UsersRound } from "lucide-react";
import { CreateGroupCard } from "@/components/create-group-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const steps = [
  {
    title: "Name your group",
    detail: "Pick something everyone recognizes"
  },
  {
    title: "Invite friends",
    detail: "Send the link via chat or email"
  },
  {
    title: "Log the first expense",
    detail: "Splits stay even and transparent"
  }
];

export default function NewGroupPage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-4 py-10 sm:px-6 lg:py-12">
      <div className="flex flex-col gap-4">
        <Button asChild variant="ghost" className="w-fit gap-2 text-slate-500">
          <Link href="/">
            <ArrowLeft className="h-4 w-4" /> Back to dashboard
          </Link>
        </Button>
        <div className="space-y-3">
          <Badge className="bg-blue-50 text-blue-700">Step 1 of 3</Badge>
          <h1 className="text-3xl font-semibold text-slate-900">Create your shared group</h1>
          <p className="text-sm text-slate-500">
            Every shared ledger starts with a group. Name it, invite your people, and Balancio will handle
            even splits for you.
          </p>
        </div>
        <Card>
          <CardContent className="grid gap-4 p-4 sm:grid-cols-3">
            {steps.map((step) => (
              <div key={step.title} className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">{step.title}</p>
                <p className="text-xs text-slate-500">{step.detail}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <section className="space-y-6">
        <div className="flex flex-col gap-2">
          <p className="text-sm uppercase tracking-wide text-slate-500">Group builder</p>
          <h2 className="text-2xl font-semibold text-slate-900">Invite your friends</h2>
          <p className="text-sm text-slate-500">
            We generate a shareable link once you add a name and at least one invitee.
          </p>
        </div>
        <CreateGroupCard />
        <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 text-sm text-slate-600 shadow-sm">
          <UsersRound className="h-5 w-5 text-slate-400" />
          Everyone you invite becomes a member automatically. They can add expenses immediately—no email/password
          setup yet.
        </div>
      </section>
    </main>
  );
}
