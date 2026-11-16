// Device Guard's service worker. Its only job is notifications: it shows the
// push the server sends when the laptop raises an alert, even while the phone
// app is closed, and opens the app when the notification is tapped. It caches
// nothing, so the site always loads fresh.

self.addEventListener("push", (event) => {
  let alert = {};
  try {
    alert = event.data ? event.data.json() : {};
  } catch {
    // An unreadable message still shows the notification (iPhone requires one).
  }
  const when =
    typeof alert.alertedAt === "string"
      ? new Date(alert.alertedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
      : null;
  event.waitUntil(
    self.registration.showNotification(alert.title || "ALERT: someone has taken or moved your laptop", {
      body: when === null ? "Tap to see the video." : `At ${when}. Tap to see the video.`,
      tag: alert.alertId || "device-guard-alert",
      icon: "icon-192.png",
      data: { url: new URL("./?view=phone", self.registration.scope).href },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    (async () => {
      const open = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      if (open.length > 0) {
        return open[0].focus();
      }
      return self.clients.openWindow(event.notification.data.url);
    })(),
  );
});
