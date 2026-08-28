import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./config/env";
import contactRoutes from "./routes/contact.routes";
import profileRoutes from "./routes/profile.routes";
import teamAllocationRoutes
  from "./routes/teamAllocation.routes";
import teamProgressRoutes
  from "./routes/teamProgress.routes";
  import companyRoutes from "./routes/company.routes";

import projectCompletionRoutes
  from "./routes/projectCompletion.routes";


  import approvedLeadBoardRoutes
  from "./routes/approvedLeadBoard.routes";
import leadRoutes from "./routes/lead.routes";
const app = express();


// CORS
const allowedOrigins = env.clientUrl
  .split(",")
  .map((url) => url.trim().replace(/\/+$/, ""))
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // allow non-browser requests (curl, health checks) with no Origin
      if (!origin) return callback(null, true);

      const normalized = origin.replace(/\/+$/, "");
      if (allowedOrigins.includes(normalized)) {
        return callback(null, true);
      }
      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
  })
);

app.use(
  "/api",
  teamProgressRoutes
);

app.use(
  "/api",
  projectCompletionRoutes
);

app.use(
  "/api",
  contactRoutes
);

app.use(
  "/api",
  teamAllocationRoutes
);



// Security headers
app.use(helmet());


// VERY IMPORTANT:
// These must come BEFORE your routes.
app.use(express.json());

app.use(
  "/api",
  approvedLeadBoardRoutes
);

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