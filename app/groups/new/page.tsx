'use client';

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, SlidersHorizontal, UsersRound } from "lucide-react";
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
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-8 sm:px-6 lg:py-10">
      <section className="space-y-6">
        <Button asChild variant="ghost" className="w-fit gap-2 text-slate-500 dark:text-slate-300">
          <Link href="/">
            <ArrowLeft className="h-4 w-4" /> Back to dashboard
          </Link>
        </Button>
        <div className="rounded-[32px] bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-900/80 p-6 text-white shadow-xl shadow-slate-900/30">
          <p className="text-sm uppercase tracking-wide text-white/70">Group builder</p>
          <h1 className="mt-2 text-3xl font-semibold">Create your shared hub</h1>
          <p className="text-sm text-white/80">
            Name your space, add participants, and we&apos;ll create an invite link so everyone can start logging expenses instantly.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.title} className="rounded-2xl border border-white/20 p-3 text-sm">
                <p className="text-xs text-white/70">Step {index + 1}</p>
                <p className="font-semibold">{step.title}</p>
                <p className="text-white/70">{step.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <CreateGroupCard />
        <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          <UsersRound className="h-5 w-5 text-slate-400 dark:text-slate-500" />
          Everyone you invite becomes a member immediately—no email/password flow yet.
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          <SlidersHorizontal className="h-5 w-5" />
          Upcoming: custom split templates, per-expense tags, and reminders.
        </div>
      </section>
    </main>
  );
}
