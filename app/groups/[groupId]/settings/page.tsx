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
      <section className="space-y-4">
        <Button asChild variant="ghost" className="w-fit gap-2 text-slate-500 dark:text-slate-300">
          <Link href={`/groups/${groupId}`}>
            <ArrowLeft className="h-4 w-4" /> Back to group
          </Link>
        </Button>
        <div className="space-y-2">
          <p className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400">Settings</p>
          <h1 className="flex items-center gap-2 text-3xl font-semibold text-slate-900 dark:text-slate-100">
            <SlidersHorizontal className="h-6 w-6 text-slate-400" />
            {group.name}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Group-level preferences and upcoming features. This page will be the hub for custom rules.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Split mode</CardTitle>
            <CardDescription>Future setting to choose between even split, percentages, or custom weights.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Right now all expenses are split evenly. Soon you&apos;ll be able to pick other strategies or create templates.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Configure reminders and alerts per group.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              We&apos;re working on in-app and email reminders so no one forgets to log an expense or settle up.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Default payer</CardTitle>
            <CardDescription>Manage who is preselected when logging expenses.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              This will let you choose a default payer or rotate automatically. For now, it&apos;s just a placeholder.
            </p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
