import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, SlidersHorizontal } from "lucide-react";
import { eq } from "drizzle-orm";
import { db } from "@/db/index";
import { groups } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type GroupSettingsPageProps = {
  params: {
    groupId: string;
  };
};

export default async function GroupSettingsPage({ params }: GroupSettingsPageProps) {
  const { groupId } = params;

  const group = await db.query.groups.findFirst({
    where: eq(groups.id, groupId)
  });

  if (!group) {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-8 sm:px-6 lg:py-10">
      <section className="space-y-6">
        <Button asChild variant="ghost" className="w-fit gap-2 text-slate-500 dark:text-slate-300">
          <Link href={`/groups/${groupId}`}>
            <ArrowLeft className="h-4 w-4" /> Back to group
          </Link>
        </Button>
        <div className="rounded-[32px] bg-gradient-to-b from-purple-500 via-purple-500/90 to-purple-600 p-6 text-white shadow-lg shadow-purple-400/30">
          <p className="text-sm uppercase tracking-wide text-white/70">Settings</p>
          <h1 className="mt-2 flex items-center gap-2 text-3xl font-semibold">
            <SlidersHorizontal className="h-6 w-6" />
            {group.name}
          </h1>
          <p className="text-sm text-white/80">Fine-tune how this group behaves. Features below are placeholders for upcoming controls.</p>
        </div>
      </section>

      <section className="space-y-4">
        <Card className="rounded-3xl border-0 bg-white shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800">
          <CardHeader>
            <CardTitle>Split mode</CardTitle>
            <CardDescription>Choose how expenses are divided.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Today every bill is split evenly. Soon you&apos;ll be able to switch to percentage-based splits, weights, or templates saved per group.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-0 bg-white shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800">
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Control reminders and alerts.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              We plan to add reminders for overdue balances, new expenses, and weekly summaries so everyone stays aligned without manual nudges.
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-0 bg-white shadow-sm ring-1 ring-slate-100 dark:bg-slate-900 dark:ring-slate-800">
          <CardHeader>
            <CardTitle>Default payer</CardTitle>
            <CardDescription>Set who is pre-selected in the expense form.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Pick a default payer or rotate automatically. Until this launches, the dialog simply falls back to the first member in the list.
            </p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
