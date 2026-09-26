"use client";

import { VENDOR_QUEUE_KEY } from "@/lib/hooks/use-vendor";
import { connectRealtimeSocket } from "@/lib/realtime/socket-client";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

/* The order notifications the server sends on a vendor's own channel. */
const ORDER_NOTIFICATIONS = new Set([
  "vendor.order.new",
  "vendor.order.ready",
  "vendor.order.cancelled",
]);

interface NotificationPayload {
  notification?: { type?: string };
}

/**
 * Keeps the order queue current without polling.
 *
 * The server already emits `notification:new` on each user's own socket room
 * when an order changes, so the board listens for that and refetches instead
 * of asking every fifteen seconds whether anything happened. A stall that
 * loses its connection still has refetch-on-focus underneath.
 */
export const useVendorOrderRealtime = (enabled = true) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let listening = true;
    let stopListening = () => {};

    const handleNotification = (payload: NotificationPayload) => {
      if (!ORDER_NOTIFICATIONS.has(payload?.notification?.type ?? "")) {
        return;
      }

      /* One key covers the board and the per-event counts, so an order
         lands wherever it happens to be on screen. */
      void queryClient.invalidateQueries({ queryKey: VENDOR_QUEUE_KEY });
    };

    void connectRealtimeSocket().then((socket) => {
      if (!socket || !listening) {
        return;
      }

      socket.on("notification:new", handleNotification);
      stopListening = () => socket.off("notification:new", handleNotification);
    });

    return () => {
      listening = false;
      stopListening();
    };
  }, [enabled, queryClient]);
};
