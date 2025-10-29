import { faker } from "@faker-js/faker";
import { db } from "./index";
import { webhooks } from "./schema";

// Tipos de eventos do Stripe mais comuns
const stripeEvents = [
  "payment_intent.succeeded",
  "payment_intent.payment_failed",
  "payment_intent.created",
  "invoice.payment_succeeded",
  "invoice.payment_failed",
  "invoice.created",
  "customer.created",
  "customer.updated",
  "customer.deleted",
  "subscription.created",
  "subscription.updated",
  "subscription.deleted",
  "charge.succeeded",
  "charge.failed",
  "charge.dispute.created",
  "payout.created",
  "payout.paid",
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
  "setup_intent.succeeded",
];

function generateStripeWebhookBody(eventType: string) {
  const baseEvent = {
    id: `evt_${faker.string.alphanumeric(24)}`,
    object: "event",
    api_version: "2023-10-16",
    created: Math.floor(faker.date.recent({ days: 30 }).getTime() / 1000),
    type: eventType,
    livemode: faker.datatype.boolean(),
    pending_webhooks: faker.number.int({ min: 1, max: 3 }),
    request: {
      id: `req_${faker.string.alphanumeric(24)}`,
      idempotency_key: faker.string.uuid(),
    },
  };

  // Gerar dados específicos baseado no tipo de evento
  let data: any = {};

  if (eventType.startsWith("payment_intent")) {
    data = {
      id: `pi_${faker.string.alphanumeric(24)}`,
      object: "payment_intent",
      amount: faker.number.int({ min: 1000, max: 50000 }), // em centavos
      currency: faker.helpers.arrayElement(["usd", "brl", "eur"]),
      status: eventType.includes("succeeded")
        ? "succeeded"
        : eventType.includes("failed")
        ? "failed"
        : "requires_payment_method",
      customer: `cus_${faker.string.alphanumeric(14)}`,
      description: faker.commerce.productDescription(),
      metadata: {
        order_id: faker.string.alphanumeric(10),
        customer_name: faker.person.fullName(),
      },
    };
  } else if (eventType.startsWith("invoice")) {
    data = {
      id: `in_${faker.string.alphanumeric(24)}`,
      object: "invoice",
      amount_due: faker.number.int({ min: 1000, max: 50000 }),
      amount_paid: eventType.includes("succeeded")
        ? faker.number.int({ min: 1000, max: 50000 })
        : 0,
      currency: faker.helpers.arrayElement(["usd", "brl", "eur"]),
      customer: `cus_${faker.string.alphanumeric(14)}`,
      status: eventType.includes("succeeded")
        ? "paid"
        : eventType.includes("failed")
        ? "open"
        : "draft",
      subscription: `sub_${faker.string.alphanumeric(14)}`,
    };
  } else if (eventType.startsWith("customer")) {
    data = {
      id: `cus_${faker.string.alphanumeric(14)}`,
      object: "customer",
      email: faker.internet.email(),
      name: faker.person.fullName(),
      phone: faker.phone.number(),
      created: Math.floor(faker.date.past().getTime() / 1000),
      metadata: {
        user_id: faker.string.uuid(),
      },
    };
  } else if (eventType.startsWith("subscription")) {
    data = {
      id: `sub_${faker.string.alphanumeric(14)}`,
      object: "subscription",
      customer: `cus_${faker.string.alphanumeric(14)}`,
      status: faker.helpers.arrayElement([
        "active",
        "canceled",
        "incomplete",
        "trialing",
      ]),
      current_period_start: Math.floor(faker.date.past().getTime() / 1000),
      current_period_end: Math.floor(faker.date.future().getTime() / 1000),
      plan: {
        id: `plan_${faker.string.alphanumeric(14)}`,
        amount: faker.number.int({ min: 999, max: 9999 }),
        currency: "usd",
        interval: faker.helpers.arrayElement(["month", "year"]),
      },
    };
  } else if (eventType.startsWith("charge")) {
    data = {
      id: `ch_${faker.string.alphanumeric(24)}`,
      object: "charge",
      amount: faker.number.int({ min: 1000, max: 50000 }),
      currency: faker.helpers.arrayElement(["usd", "brl", "eur"]),
      customer: `cus_${faker.string.alphanumeric(14)}`,
      status: eventType.includes("succeeded") ? "succeeded" : "failed",
      payment_method: `pm_${faker.string.alphanumeric(24)}`,
      receipt_url: faker.internet.url(),
    };
  } else if (eventType.startsWith("payout")) {
    data = {
      id: `po_${faker.string.alphanumeric(24)}`,
      object: "payout",
      amount: faker.number.int({ min: 10000, max: 100000 }),
      currency: faker.helpers.arrayElement(["usd", "brl", "eur"]),
      status: eventType.includes("paid") ? "paid" : "pending",
      arrival_date: Math.floor(faker.date.future().getTime() / 1000),
    };
  } else if (eventType.startsWith("checkout")) {
    data = {
      id: `cs_${faker.string.alphanumeric(24)}`,
      object: "checkout.session",
      amount_total: faker.number.int({ min: 1000, max: 50000 }),
      currency: faker.helpers.arrayElement(["usd", "brl", "eur"]),
      customer: `cus_${faker.string.alphanumeric(14)}`,
      payment_status: eventType.includes("completed") ? "paid" : "unpaid",
      mode: faker.helpers.arrayElement(["payment", "subscription", "setup"]),
      success_url: faker.internet.url(),
      cancel_url: faker.internet.url(),
    };
  } else if (eventType.startsWith("setup_intent")) {
    data = {
      id: `seti_${faker.string.alphanumeric(24)}`,
      object: "setup_intent",
      customer: `cus_${faker.string.alphanumeric(14)}`,
      status: "succeeded",
      usage: "off_session",
      payment_method: `pm_${faker.string.alphanumeric(24)}`,
    };
  }

  return {
    ...baseEvent,
    data: {
      object: data,
    },
  };
}

function generateStripeHeaders() {
  return {
    "stripe-signature": `t=${Math.floor(
      Date.now() / 1000
    )},v1=${faker.string.alphanumeric(64)}`,
    "content-type": "application/json",
    "user-agent": "Stripe/1.0 (+https://stripe.com/docs/webhooks)",
    "stripe-version": "2023-10-16",
    "x-forwarded-for": faker.internet.ip(),
    "x-forwarded-proto": "https",
    accept: "*/*",
    "accept-encoding": "gzip",
  };
}

async function seed() {
  console.log("🌱 Iniciando seed do banco de dados...");

  try {
    // Limpar registros existentes (opcional)
    await db.delete(webhooks);
    console.log("🗑️  Registros existentes removidos");

    // Gerar 60 webhooks
    const webhookData = [];

    for (let i = 0; i < 60; i++) {
      const eventType = faker.helpers.arrayElement(stripeEvents);
      const body = generateStripeWebhookBody(eventType);
      const headers = generateStripeHeaders();

      webhookData.push({
        method: "POST",
        pathname: "/webhook/stripe",
        ip: faker.internet.ip(),
        statusCode: faker.helpers.weightedArrayElement([
          { weight: 85, value: 200 }, // 85% success
          { weight: 10, value: 400 }, // 10% bad request
          { weight: 3, value: 500 }, // 3% server error
          { weight: 2, value: 422 }, // 2% unprocessable entity
        ]),
        contentType: "application/json",
        contentLength: JSON.stringify(body).length,
        queryParams: faker.datatype.boolean()
          ? {
              test: faker.datatype.boolean().toString(),
              version: "2023-10-16",
            }
          : null,
        headers,
        body: JSON.stringify(body),
        createdAt: faker.date.recent({ days: 30 }),
      });
    }

    // Inserir os dados no banco
    await db.insert(webhooks).values(webhookData);

    console.log(
      `✅ Seed concluído! ${webhookData.length} webhooks foram criados`
    );
    console.log("📊 Tipos de eventos incluídos:");

    const eventCounts = webhookData.reduce((acc, webhook) => {
      const body = JSON.parse(webhook.body);
      const eventType = body.type;
      acc[eventType] = (acc[eventType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(eventCounts).forEach(([event, count]) => {
      console.log(`   ${event}: ${count}`);
    });
  } catch (error) {
    console.error("❌ Erro durante o seed:", error);
    throw error;
  }
}

seed();
