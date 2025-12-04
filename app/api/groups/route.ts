import { NextResponse } from "next/server";
import { db } from "@/db/index";
import { groups, members } from "@/db/schema";

function formatMemberName(email: string) {
  const localPart = email.split("@")[0] ?? "Friend";
  return localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ")
    .trim() || "Friend";
}

type CreateGroupPayload = {
  name?: unknown;
  invitees?: unknown;
};

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as CreateGroupPayload | null;

  if (!payload || typeof payload !== "object") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  const invitees = Array.isArray(payload.invitees)
    ? payload.invitees
        .map((value) => value?.toString().trim())
        .filter((value): value is string => Boolean(value))
    : [];

  const uniqueInvitees = Array.from(new Set(invitees));

  if (!name) {
    return NextResponse.json({ error: "Group name is required" }, { status: 400 });
  }

  if (uniqueInvitees.length === 0) {
    return NextResponse.json({ error: "Invite at least one member" }, { status: 400 });
  }

  const [group] = await db
    .insert(groups)
    .values({ name })
    .returning({ id: groups.id, name: groups.name, createdAt: groups.createdAt });

  await db.insert(members).values(
    uniqueInvitees.map((email) => ({
      name: formatMemberName(email),
      email,
      groupId: group.id
    }))
  );

  return NextResponse.json({ groupId: group.id, name: group.name });
}
