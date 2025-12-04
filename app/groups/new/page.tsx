'use client';

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, UsersRound } from "lucide-react";
import { CreateGroupCard } from "@/components/create-group-card";
import { Button } from "@/components/ui/button";

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
        <Button asChild variant="ghost" className="w-fit gap-2 text-slate-500 dark:text-slate-300">
          <Link href="/">
            <ArrowLeft className="h-4 w-4" /> Back to dashboard
          </Link>
        </Button>
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">Create your shared group</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Every shared ledger starts with a group. Name it, invite your people, and Balancio will handle
            even splits for you.
          </p>
        </div>
      </div>

      <section className="space-y-6">
        <CreateGroupCard />
        <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          <UsersRound className="h-5 w-5 text-slate-400 dark:text-slate-500" />
          Everyone you invite becomes a member automatically. They can add expenses immediately—no email/password
          setup yet.
        </div>
      </section>
    </main>
  );
}
