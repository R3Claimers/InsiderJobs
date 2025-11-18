// Import with `import * as Sentry from "@sentry/node"` if you are using ESM
import * as Sentry from "@sentry/node"

Sentry.init({
  dsn: "https://81699e4cebbe101da7c6a6dfd0f85dc1@o4509543823441920.ingest.us.sentry.io/4509543831306240",
  integrations: [

    Sentry.mongoIntegration(),
  ],
  // Setting this option to true will send default PII data to Sentry.
  // For example, automatic IP address collection on events
  sendDefaultPii: true,
});

