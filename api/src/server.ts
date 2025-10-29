import { fastify } from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
  jsonSchemaTransform,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { fastifySwagger } from "@fastify/swagger";
import { fastifyCors } from "@fastify/cors";
import ScalarApiReference from "@scalar/fastify-api-reference";
import { listWebhooks } from "./routes/list-webhooks";
import { env } from "./env";
import { getWebhook } from "./routes/get-webhook";
import { deleteWebhook } from "./routes/delete-webhook";

const app = fastify().withTypeProvider<ZodTypeProvider>();

// Compilers
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

// Plugins
app.register(fastifyCors, {
  origin: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true,
});

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: "Webhook Inspector API",
      description: "API for capture and inspecting webhook requests",
      version: "1.0.0",
    },
  },
  transform: jsonSchemaTransform,
});

app.register(ScalarApiReference, {
  routePrefix: "/docs",
});

// Routes
app.register(listWebhooks);
app.register(getWebhook);
app.register(deleteWebhook);

app
  .listen({
    port: env.PORT,
    host: "0.0.0.0",
  })
  .then(() => {
    console.log(`🚀 HTTP server running on http://localhost:${env.PORT}`);
    console.log(`📚 Docs available on http://localhost:${env.PORT}/docs`);
  });
