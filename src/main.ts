import { open } from "sqlite";
import sqlite3 from "sqlite3";

import { createSchema } from "./schema";
import { getPendingOrdersOlderThanDays } from "./queries/order_queries";
import { postToSlack, formatStalePendingOrdersAlert } from "./slack";

const ORDER_ALERTS_CHANNEL = "#order-alerts";
const STALE_PENDING_DAYS = 3;

async function main() {
  const db = await open({
    filename: "ecommerce.db",
    driver: sqlite3.Database,
  });

  await createSchema(db, false);

  const stalePending = await getPendingOrdersOlderThanDays(
    db,
    STALE_PENDING_DAYS
  );

  if (stalePending.length === 0) {
    return;
  }

  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) {
    throw new Error("SLACK_WEBHOOK_URL is not set");
  }

  await postToSlack({
    webhookUrl,
    channel: ORDER_ALERTS_CHANNEL,
    text: formatStalePendingOrdersAlert(stalePending),
  });
}

main();
