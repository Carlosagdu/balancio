'use client';

import { FormEvent, useState } from "react";
import { Plus, X } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Member = {
  id: string;
  name: string;
};

type LogExpenseDialogProps = {
  members: Member[];
  groupId: string;
};

export function LogExpenseDialog({ members, groupId }: LogExpenseDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusVariant, setStatusVariant] = useState<"success" | "error" | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setIsLoading(true);
    setStatusMessage(null);
    setStatusVariant(null);
    try {
      const response = await fetch("/api/expenses", {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error ?? "Unable to save expense");
      }

      form.reset();
      setStatusMessage("Expense saved successfully.");
      setStatusVariant("success");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Failed to save expense");
      setStatusVariant("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full justify-center sm:w-auto sm:justify-normal">
          {open ? <X className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />} Add expense
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle className="text-xl font-semibold text-slate-900 dark:text-slate-50">Log a new expense</DialogTitle>
        <DialogDescription className="text-sm text-slate-500 dark:text-slate-400">
          Describe the bill, amount, date, and who covered it. Splits stay even.
        </DialogDescription>
        <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
          <input type="hidden" name="groupId" value={groupId} />
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="dialog-expense-description">
              Description
            </label>
            <Input id="dialog-expense-description" name="description" placeholder="Sunset dinner" required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="dialog-expense-amount">
                Amount (USD)
              </label>
              <Input id="dialog-expense-amount" name="amount" type="number" min="0" step="0.01" placeholder="0.00" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="dialog-expense-date">
                Date
              </label>
              <Input
                id="dialog-expense-date"
                name="date"
                type="date"
                defaultValue={new Date().toISOString().split("T")[0]}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="dialog-expense-paid-by">
              Who paid?
            </label>
            <select
              id="dialog-expense-paid-by"
              name="paidById"
              className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading} aria-busy={isLoading}>
            {isLoading ? "Saving..." : "Save expense"}
          </Button>
        </form>
        <div className="mt-4 flex flex-col gap-2 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">Even split</Badge>
            <span>We split evenly across the group.</span>
          </div>
          {statusMessage && (
            <p className={statusVariant === "error" ? "text-red-600" : "text-emerald-600"}>{statusMessage}</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
