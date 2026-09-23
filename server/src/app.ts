import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./config/env";

/*
 * =========================================================
 * ROUTES
 * =========================================================
 */

import financialReviewRoutes from "./routes/financialReview.routes";
import calendarRoutes from "./routes/calendar.routes";
import profileRoutes from "./routes/profile.routes";
import technicalReviewRoutes from "./routes/technicalReview.routes";
import chatRoutes from "./routes/chat.routes";
import companyRoutes from "./routes/company.routes";
import pipelineRoutes from "./routes/pipeline.routes";
import contactRoutes from "./routes/contact.routes";
import dashboardPipelineRoutes from "./routes/dashboard-pipeline.routes";
import leadRoutes from "./routes/lead.routes";
import approvedLeadBoardRoutes from "./routes/approvedLeadBoard.routes";
import teamAllocationRoutes from "./routes/teamAllocation.routes";
import teamProgressRoutes from "./routes/teamProgress.routes";
import projectCompletionRoutes from "./routes/projectCompletion.routes";

/*
 * =========================================================
 * CREATE EXPRESS APP
 * =========================================================
 */

const app = express();

/*
 * =========================================================
 * CORS
 * =========================================================
 *
 * 5173 = Vite development
 * 4173 = Vite preview
 * env.clientUrl = configured frontend URL
 * =========================================================
 */

const configuredOrigins = String(env.clientUrl ?? "")
  .split(",")
  .map((url) => url.trim())
  .filter(Boolean);

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:4173",
  ...configuredOrigins,
]
  .map((url) => url.replace(/\/+$/, ""))
  .filter(
    (value, index, array) =>
      value.length > 0 && array.indexOf(value) === index
  );

app.use(
  cors({
    origin: (origin, callback) => {
      /*
       * Allow requests without an Origin.
       * Examples:
       * Postman
       * curl
       * server-to-server requests
       * health checks
       */
      if (!origin) {
        return callback(null, true);
      }

      // Remove trailing slash before comparison.
      const normalizedOrigin = origin.replace(/\/+$/, "");

      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      console.error(
        "CORS BLOCKED ORIGIN:",
        origin
      );

      return callback(
        new Error(
          `Origin ${origin} is not allowed by CORS`
        )
      );
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

/*
 * =========================================================
 * BODY PARSERS
 *
 * These must come before API routes.
 * =========================================================
 */

app.use(
  express.json({
    limit: "2mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "2mb",
  })
);

/*
 * =========================================================
 * SECURITY
 * =========================================================
 */

app.use(helmet());

/*
 * =========================================================
 * REQUEST LOGGING
 * =========================================================
 */

app.use(morgan("dev"));

/*
 * =========================================================
 * TEMPORARY BODY DEBUGGER
 *
 * Keep this until contact creation works.
 * =========================================================
 */

app.use(
  (
    req,
    _res,
    next
  ) => {
    if (
      req.method === "POST" ||
      req.method === "PUT" ||
      req.method === "PATCH"
    ) {
      console.log(
        "=============================="
      );

      console.log(
        "REQUEST METHOD:",
        req.method
      );

      console.log(
        "REQUEST URL:",
        req.originalUrl
      );

      console.log(
        "CONTENT TYPE:",
        req.headers["content-type"]
      );

      console.log(
        "BODY AFTER express.json():",
        req.body
      );

      console.log(
        "=============================="
      );
    }

    next();
  }
);

/*
 * =========================================================
 * HEALTH CHECK
 * =========================================================
 */

app.get(
  "/api/health",
  (
    _req,
    res
  ) => {
    return res
      .status(200)
      .json({
        success: true,
        message:
          "Altrium CRM API is running",
      });
  }
);

/*
 * =========================================================
 * API ROUTES
 * =========================================================
 */

app.use(
  "/api",
  profileRoutes
);

app.use(
  "/api",
  companyRoutes
);

app.use(
  "/api",
  contactRoutes
);

app.use(
  "/api",
  leadRoutes
);

app.use(
  "/api",
  financialReviewRoutes
);

app.use(
  "/api",
  technicalReviewRoutes
);

app.use(
  "/api",
  approvedLeadBoardRoutes
);

app.use(
  "/api",
  teamAllocationRoutes
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
  calendarRoutes
);

app.use(
  "/api",
  chatRoutes
);

app.use(
  "/api",
  pipelineRoutes
);

app.use(
  "/api",
  dashboardPipelineRoutes
);

/*
 * =========================================================
 * 404 HANDLER
 * =========================================================
 */

app.use(
  (
    req,
    res
  ) => {
    return res
      .status(404)
      .json({
        success: false,
        message:
          `Route not found: ${req.method} ${req.originalUrl}`,
      });
  }
);

/*
 * =========================================================
 * GLOBAL ERROR HANDLER
 * =========================================================
 */

app.use(
  (
    error: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(
      "GLOBAL SERVER ERROR:",
      error
    );

    return res
      .status(500)
      .json({
        success: false,
        message:
          error.message ||
          "Internal server error",
      });
  }
);

export default app;