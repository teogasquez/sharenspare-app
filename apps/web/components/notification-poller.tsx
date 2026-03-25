"use client";

import { useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/lib/toast-context";
import { reservations } from "@/lib/api";

const POLL_INTERVAL = 30_000;
const STORAGE_KEY = "sns_notif_seen";

interface SeenState {
  ownerPending: string[];
  acceptedReqs: string[];
}

function getSeenState(): SeenState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return { ownerPending: [], acceptedReqs: [] };
}

function saveSeenState(state: SeenState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function NotificationPoller() {
  const { user } = useAuth();
  const { addToast } = useToast();

  // Use a ref so the interval always calls the latest version of poll
  const pollRef = useRef<(() => Promise<void>) | null>(null);

  const poll = useCallback(async () => {
    if (!user) return;
    try {
      const [ownerRes, requesterRes] = await Promise.all([
        reservations.list("owner"),
        reservations.list("requester"),
      ]);

      const seen = getSeenState();

      const newPending = ownerRes.filter(
        r => r.status === "Pending" && !seen.ownerPending.includes(r.id)
      );
      for (const r of newPending) {
        addToast(`Nouvelle demande de réservation pour « ${r.equipment.name} »`, "info");
        seen.ownerPending.push(r.id);
      }

      const newAccepted = requesterRes.filter(
        r => r.status === "Accepted" && !seen.acceptedReqs.includes(r.id)
      );
      for (const r of newAccepted) {
        addToast(`Votre réservation pour « ${r.equipment.name} » a été acceptée !`, "success");
        seen.acceptedReqs.push(r.id);
      }

      seen.ownerPending = seen.ownerPending.slice(-200);
      seen.acceptedReqs = seen.acceptedReqs.slice(-200);
      saveSeenState(seen);
    } catch {
      // Ignore polling errors silently
    }
  }, [user, addToast]);

  // Keep ref up to date so the interval always calls the latest poll
  useEffect(() => {
    pollRef.current = poll;
  }, [poll]);

  useEffect(() => {
    if (!user) return;

    // Fire immediately on login/mount, then every 30s
    poll();

    const id = setInterval(() => pollRef.current?.(), POLL_INTERVAL);
    return () => clearInterval(id);
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
