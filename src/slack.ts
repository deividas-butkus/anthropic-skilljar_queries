interface SlackPostOptions {
  webhookUrl: string;
  channel: string;
  text: string;
}

export async function postToSlack({
  webhookUrl,
  channel,
  text,
}: SlackPostOptions): Promise<void> {
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ channel, text }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Slack webhook failed: ${response.status} ${response.statusText} - ${body}`
    );
  }
}

interface StalePendingOrder {
  order_id: number;
  customer_name: string;
  phone: string | null;
  days_since_created: number;
}

export function formatStalePendingOrdersAlert(
  orders: StalePendingOrder[]
): string {
  const header = `:warning: ${orders.length} order(s) have been pending for more than 3 days. Please follow up:`;
  const lines = orders.map((o) => {
    const days = Math.floor(o.days_since_created);
    const phone = o.phone ?? "no phone on file";
    return `• Order #${o.order_id} — ${o.customer_name} (${phone}) — pending ${days} days`;
  });
  return [header, ...lines].join("\n");
}
