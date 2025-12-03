'use client';

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, UsersRound } from "lucide-react";
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
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = steps.length;

  const handleBack = () => setCurrentStep((prev) => Math.max(prev - 1, 1));
  const handleNext = () => setCurrentStep((prev) => Math.min(prev + 1, totalSteps));

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-4 py-10 sm:px-6 lg:py-12">
      <div className="flex flex-col gap-4">
        <Button asChild variant="ghost" className="w-fit gap-2 text-slate-500 dark:text-slate-300">
          <Link href="/">
            <ArrowLeft className="h-4 w-4" /> Back to dashboard
          </Link>
        </Button>
        <div className="space-y-3">
          <Badge className="bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200">
            Step {currentStep} of {totalSteps}
          </Badge>
          <h1 className="text-3xl font-semibold text-slate-900 dark:text-slate-100">Create your shared group</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Every shared ledger starts with a group. Name it, invite your people, and Balancio will handle
            even splits for you.
          </p>
        </div>
        <Card>
          <CardContent className="grid gap-4 p-4 sm:grid-cols-3">
            {steps.map((step, index) => {
              const stepNumber = index + 1;
              const isActive = stepNumber === currentStep;
              const isCompleted = stepNumber < currentStep;

              return (
                <button
                  key={step.title}
                  type="button"
                  className={`rounded-2xl border p-4 text-left transition ${
                    isActive
                      ? "border-blue-200 bg-blue-50 dark:border-blue-500/40 dark:bg-blue-500/10"
                      : isCompleted
                        ? "border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10"
                        : "border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
                  }`}
                  onClick={() => setCurrentStep(stepNumber)}
                >
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide">
                    {isCompleted ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Done</span>
                      </>
                    ) : (
                      <span className={isActive ? "text-blue-600" : "text-slate-400 dark:text-slate-500"}>
                        Step {stepNumber}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">{step.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{step.detail}</p>
                </button>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <section className="space-y-6">
        <div className="flex flex-col gap-2">
          <p className="text-sm uppercase tracking-wide text-slate-500 dark:text-slate-400">Group builder</p>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Invite your friends</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            We generate a shareable link once you add a name and at least one invitee.
          </p>
        </div>
        <CreateGroupCard />
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>
            Back
          </Button>
          <Button onClick={handleNext} disabled={currentStep === totalSteps}>
            Next step
          </Button>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
          <UsersRound className="h-5 w-5 text-slate-400 dark:text-slate-500" />
          Everyone you invite becomes a member automatically. They can add expenses immediately—no email/password
          setup yet.
        </div>
      </section>
    </main>
  );
}
