"use client";

import { useTransition } from "react";
import { setMemberStatus } from "@/server/actions/members";
import { Button } from "@/components/ui/Button";

export function MemberStatusButton({ id, status }: { id: string; status: "ACTIVE" | "SUSPENDED" }) {
  const [pending, start] = useTransition();
  const suspended = status === "SUSPENDED";
  return (
    <Button
      size="sm"
      variant={suspended ? "secondary" : "danger"}
      pending={pending}
      onClick={() => start(() => setMemberStatus(id, suspended ? "ACTIVE" : "SUSPENDED"))}
    >
      {suspended ? "Reactivar cuenta" : "Suspender"}
    </Button>
  );
}
