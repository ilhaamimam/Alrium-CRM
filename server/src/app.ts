import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./config/env";
import contactRoutes from "./routes/contact.routes";
import profileRoutes from "./routes/profile.routes";
import companyRoutes from "./routes/company.routes";
import leadRoutes from "./routes/lead.routes";
const app = express();


// CORS
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  })
);

app.use(
  "/api",
  contactRoutes
);


// Security headers
app.use(helmet());


// VERY IMPORTANT:
// These must come BEFORE your routes.
app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);


// Logging
app.use(morgan("dev"));


// Health test
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Altrium CRM API is running",
  });
});


// ROUTES MUST COME AFTER express.json()
app.use("/api", profileRoutes);
app.use("/api", companyRoutes);

app.use(
  "/api",
  leadRoutes
);

export default app;