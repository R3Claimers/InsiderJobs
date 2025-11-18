import "./config/instrument.js";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import "dotenv/config";
import connectDB from "./config/db.js";
import * as Sentry from "@sentry/node";
import { clerkWebhooks } from "./controllers/webhooks.js";
import companyRoutes from "./routes/companyRoutes.js";
import connectCloudinary from "./config/cloudinary.js";
import jobRoutes from "./routes/jobRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import viewRoutes from "./routes/viewRoutes.js";
import { clerkMiddleware } from "@clerk/express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Connect to database
await connectDB();
await connectCloudinary();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Add security headers for EJS pages
app.use((req, res, next) => {
  if (req.path.startsWith("/ssr/")) {
    res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  }
  next();
});

app.use(express.static(path.join(__dirname, "public")));

app.use(morgan("dev"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(clerkMiddleware());

app.get("/api", (req, res) => res.status(200).send("API working"));
app.post("/webhooks", clerkWebhooks);
app.use("/api/company", companyRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/users", userRoutes);

app.get("/ssr/apply-job/:id", viewRoutes);

// Port
const PORT = process.env.PORT || 5000;
Sentry.setupExpressErrorHandler(app);
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
