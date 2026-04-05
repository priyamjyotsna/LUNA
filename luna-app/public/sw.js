/* global self */
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: "Luna", body: event.data?.text() ?? "Update" };
  }
  const title = typeof data.title === "string" ? data.title : "Luna";
  const body =
    typeof data.body === "string"
      ? data.body
      : "You have a cycle update. Open Luna for details.";
  event.waitUntil(self.registration.showNotification(title, { body }));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(self.clients.openWindow("/"));
});
