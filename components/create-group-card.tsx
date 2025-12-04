"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Copy, Share2, UserPlus, X } from "lucide-react";

const defaultMembers = ["maya", "leo", "charles"];
const initialParticipantFields = 3;
const minParticipants = 1;

export function CreateGroupCard() {
  const router = useRouter();
  const [groupName, setGroupName] = useState("City picnic");
  const [participants, setParticipants] = useState<string[]>(() => {
    if (defaultMembers.length >= initialParticipantFields) return defaultMembers;
    const padded = [...defaultMembers];
    while (padded.length < initialParticipantFields) {
      padded.push("");
    }
    return padded;
  });
  const [shareLink, setShareLink] = useState("");
  const [feedback, setFeedback] = useState("");
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [defaultPayer, setDefaultPayer] = useState("");

  const activeParticipants = useMemo(
    () =>
      participants
        .map((email) => email.trim())
        .filter(Boolean)
        .filter((value, index, self) => self.indexOf(value) === index),
    [participants]
  );

  useEffect(() => {
    if (activeParticipants.length === 0) {
      if (defaultPayer) {
        setDefaultPayer("");
      }
      return;
    }
    if (!defaultPayer || !activeParticipants.includes(defaultPayer)) {
      setDefaultPayer(activeParticipants[0]);
    }
  }, [activeParticipants, defaultPayer]);

  const handleParticipantChange = (index: number, value: string) => {
    setParticipants((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const handleAddParticipantField = () => {
    setParticipants((prev) => [...prev, ""]);
  };

  const handleRemoveParticipantField = (index: number) => {
    setParticipants((prev) => {
      if (prev.length <= minParticipants) return prev;
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleCreateGroup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!groupName.trim()) {
      setFeedback("Give the group a friendly name first.");
      setStatus("error");
      return;
    }
    const invites = participants.map((email) => email.trim()).filter(Boolean);
    const uniqueInvites = Array.from(new Set(invites));
    if (uniqueInvites.length === 0) {
      setFeedback("Invite at least one friend to start the split.");
      setStatus("error");
      return;
    }
    setIsSubmitting(true);
    setFeedback("");
    setStatus("idle");
    try {
      const response = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: groupName, invitees: uniqueInvites, defaultPayer: defaultPayer || null })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error ?? "Unable to create group");
      }

      const payload = await response.json();
      const createdLink =
        typeof window !== "undefined" ? `${window.location.origin}/groups/${payload.groupId}` : `/groups/${payload.groupId}`;

      setShareLink(createdLink);
      setCopied(false);
      setFeedback("Group saved. Share the invite link or head back to your dashboard.");
      setStatus("success");
      router.prefetch("/");
      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 600);
    } catch (error) {
      setStatus("error");
      setFeedback(error instanceof Error ? error.message : "Failed to create group");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = async () => {
    if (!shareLink || typeof navigator === "undefined" || !navigator.clipboard) return;
    try {
      await navigator.clipboard?.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a group</CardTitle>
        <CardDescription>Gather your friends, assign a name, and share the invite link.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form className="space-y-5" onSubmit={handleCreateGroup}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="group-name">
              Group name
            </label>
            <Input
              id="group-name"
              placeholder="Weekend escape"
              value={groupName}
              onChange={(event) => setGroupName(event.target.value)}
            />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="participant-0">
                Participants
              </label>
              <Button type="button" variant="ghost" size="sm" className="gap-1 text-xs" onClick={handleAddParticipantField}>
                <UserPlus className="h-3.5 w-3.5" />
                Add participant
              </Button>
            </div>
            <div className="space-y-2">
              {participants.map((email, index) => (
                <div key={`participant-${index}`} className="flex gap-2">
                  <Input
                    id={`participant-${index}`}
                    placeholder="friend@email.com"
                    value={email}
                    onChange={(event) => handleParticipantChange(index, event.target.value)}
                  />
                  {participants.length > minParticipants && (
                    <Button
                      type="button"
                      variant="outline"
                      className="px-3"
                      onClick={() => handleRemoveParticipantField(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
                  <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="default-payer">
              Default payer
            </label>
            <select
              id="default-payer"
              name="default-payer"
              value={defaultPayer}
              onChange={(event) => setDefaultPayer(event.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              <option value="">Select a member</option>
              {activeParticipants.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              This member will be preselected in the expense dialog. You can change it later.
            </p>
          </div>
          {feedback && (
            <p
              className={`text-sm ${
                status === "error" ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"
              }`}
            >
              {feedback}
            </p>
          )}

          <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
            <Share2 className="mr-2 h-4 w-4" />
            {isSubmitting ? "Creating..." : "Create group"}
          </Button>
        </form>

        {shareLink && (
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Invite link ready</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{shareLink}</p>
              </div>
              <Button variant="outline" size="sm" className="w-full sm:w-auto" type="button" onClick={handleCopy}>
                <Copy className="mr-2 h-4 w-4" />
                {copied ? "Copied" : "Copy link"}
              </Button>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
              Auto-splitting will start once everyone joins.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
