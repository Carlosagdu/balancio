"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Copy, Share2, UserPlus } from "lucide-react";

const defaultMembers = ["maya@crew.com", "leo@crew.com"];

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function CreateGroupCard() {
  const [groupName, setGroupName] = useState("City picnic");
  const [memberInput, setMemberInput] = useState("");
  const [members, setMembers] = useState<string[]>(defaultMembers);
  const [shareLink, setShareLink] = useState("");
  const [feedback, setFeedback] = useState("");
  const [copied, setCopied] = useState(false);

  const generatedLink = useMemo(() => {
    if (!groupName) return "";
    const slug = slugify(groupName) || "new-group";
    return `https://sharebill.app/${slug}-${members.length}`;
  }, [groupName, members.length]);

  const handleAddMember = () => {
    if (!memberInput.trim()) {
      setFeedback("Add a friend's email to invite them.");
      return;
    }
    if (members.includes(memberInput.trim())) {
      setFeedback("Already on the invite list.");
      return;
    }
    setMembers((prev) => [...prev, memberInput.trim()]);
    setMemberInput("");
    setFeedback("");
  };

  const handleCreateGroup = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!groupName.trim()) {
      setFeedback("Give the group a friendly name first.");
      return;
    }
    if (members.length === 0) {
      setFeedback("Invite at least one friend to start the split.");
      return;
    }
    setShareLink(generatedLink);
    setCopied(false);
    setFeedback("Group saved. Share the invite link below.");
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
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200" htmlFor="friend-email">
              Invite friends
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                id="friend-email"
                placeholder="friend@email.com"
                value={memberInput}
                onChange={(event) => setMemberInput(event.target.value)}
              />
              <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={handleAddMember}>
                <UserPlus className="mr-2 h-4 w-4" />
                Add
              </Button>
            </div>
          </div>

          {members.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {members.map((member) => (
                <Badge key={member} className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {member}
                </Badge>
              ))}
            </div>
          )}

          {feedback && <p className="text-sm text-slate-500 dark:text-slate-400">{feedback}</p>}

          <Button type="submit" className="w-full sm:w-auto">
            <Share2 className="mr-2 h-4 w-4" />
            Create group
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
