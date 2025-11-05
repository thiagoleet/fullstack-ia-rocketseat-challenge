import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { webhooks } from "@/db/schema";
import { db } from "@/db";
import { eq, inArray } from "drizzle-orm";

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

      return reply.status(201).send({
        code: webhooksBodies,
      });
    }
  );
};
