"use client";

import { useCallback, useSyncExternalStore } from "react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const out = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    out[i] = rawData.charCodeAt(i);
  }
  return out;
}

function pushEnvSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

function notificationPermission(): NotificationPermission {
  return typeof window !== "undefined" && "Notification" in window
    ? Notification.permission
    : "default";
}

export function useNotifications() {
  const supported = useSyncExternalStore(
    () => () => {},
    pushEnvSupported,
    () => false,
  );

  const permission = useSyncExternalStore(
    () => () => {},
    notificationPermission,
    () => "default" as NotificationPermission,
  );

  const subscribePush = useCallback(async () => {
    const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
    if (!supported || !vapid) {
      throw new Error(
        vapid
          ? "Push is not supported in this browser."
          : "VAPID public key is not configured (NEXT_PUBLIC_VAPID_PUBLIC_KEY).",
      );
    }

    const reg = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });
    if (Notification.permission === "default") {
      const p = await Notification.requestPermission();
      if (p !== "granted") {
        throw new Error("Notification permission was not granted.");
      }
    } else if (Notification.permission !== "granted") {
      throw new Error("Notifications are blocked for this site.");
    }

    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapid),
    });

    const json = sub.toJSON();
    if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
      throw new Error("Could not read push subscription.");
    }

    const res = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        endpoint: json.endpoint,
        keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
        expirationTime: json.expirationTime ?? null,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error((err as { error?: string }).error ?? "Subscribe failed");
    }
  }, [supported]);

  return { supported, permission, subscribePush };
}
