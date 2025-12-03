'use client';

import { useState } from "react";
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
};

export function LogExpenseDialog({ members }: LogExpenseDialogProps) {
  const [open, setOpen] = useState(false);

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
        <form className="mt-4 space-y-4" action="/api/expenses" method="post">
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
          <Button type="submit" className="w-full">
            Save expense
          </Button>
        </form>
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Badge className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">Even split</Badge>
          <span>Form posts to /api/expenses when backend is ready.</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
