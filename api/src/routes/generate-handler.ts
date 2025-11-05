import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { webhooks } from "@/db/schema";
import { db } from "@/db";
import { inArray } from "drizzle-orm";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

export const generateHandler: FastifyPluginAsyncZod = async (app) => {
  app.post(
    "/api/generate",
    {
      schema: {
        summary: "Generate a TypeScript handler",
        tags: ["Webhooks"],
        body: z.object({
          webhooksIds: z.array(z.string()),
        }),
        response: {
          201: z.object({
            code: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { webhooksIds } = request.body;

      const result = await db
        .select({ body: webhooks.body })
        .from(webhooks)
        .where(inArray(webhooks.id, webhooksIds));

      const webhooksBodies = result.map((row) => row.body).join("\n\n");

      const { text } = await generateText({
        model: google("gemini-2.5-flash"),
        prompt:
          `You will receive the raw JSON body from multiple webhook events. Based on the payloads, generate a TypeScript handler function that uses Zod for schema validation.
          The TypeScript code must:
          - Define a Zod schema (or a Zod discriminated union) that matches all possible webhook event structures.
          - Include type inference from the Zod schema.
          - Parse and validate the incoming webhook JSON body using this schema.
          - Include a 'handleWebhook' function that takes the request body, identifies the event type, and executes the appropriate logic for each event.
          - Use descriptive TypeScript types and make it easy to extend with new events later.
          - Add comments explaining each step briefly.
          
          Example structure:
          import { z } from "zod";

          const webhookSchema = z.discriminatedUnion("event", [
            z.object({
              event: z.literal("user.created"),
              data: z.object({ id: z.string(), email: z.string().email() }),
            }),
            z.object({
              event: z.literal("order.completed"),
              data: z.object({ orderId: z.string(), amount: z.number() }),
            }),
          ]);

          type WebhookEvent = z.infer<typeof webhookSchema>;

          export function handleWebhook(body: unknown) {
          const result = webhookSchema.parse(body);

          switch (result.event) {
            case "user.created":
              // Handle user creation
              break;
            case "order.completed":
              // Handle order completion
              break;
            default:
              throw new Error("Unhandled event type");
            }
          }

          Make sure the generated code is production-ready, type-safe, and properly validated using Zod.

          Here are the webhook event bodies to consider:
          """
          ${webhooksBodies}
          """


          Return only the code and do not return  \'\'\'typescript or any other markdown symbols, do not include any introduction or text before or after the code.

          `.trim(),
      });

      return reply.status(201).send({
        code: text,
      });
    }
  );
};
