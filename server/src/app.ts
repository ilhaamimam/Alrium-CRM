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
import financialReviewRoutes
  from "./routes/financialReview.routes";

import calendarRoutes
  from "./routes/calendar.routes";

import profileRoutes
  from "./routes/profile.routes";

import technicalReviewRoutes
  from "./routes/technicalReview.routes";
import chatRoutes
  from "./routes/chat.routes";

import companyRoutes
  from "./routes/company.routes";

import pipelineRoutes
  from "./routes/pipeline.routes";

import contactRoutes
  from "./routes/contact.routes";

import dashboardPipelineRoutes
  from "./routes/dashboard-pipeline.routes";

import leadRoutes
  from "./routes/lead.routes";

import approvedLeadBoardRoutes
  from "./routes/approvedLeadBoard.routes";

import teamAllocationRoutes
  from "./routes/teamAllocation.routes";

import teamProgressRoutes
  from "./routes/teamProgress.routes";

import projectCompletionRoutes
  from "./routes/projectCompletion.routes";


/*
 * =========================================================
 * CREATE EXPRESS APP
 * =========================================================
 */

const app =
  express();


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

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:4173",
  env.clientUrl,
]
  .filter(
    (
      value,
      index,
      array
    ) =>
      Boolean(value) &&
      array.indexOf(value) ===
        index
  );


app.use(
  cors({
    origin: (
      origin,
      callback
    ) => {
      /*
       * Allow requests without Origin,
       * for example Postman/curl.
       */
      if (!origin) {
        callback(
          null,
          true
        );

        return;
      }


      if (
        allowedOrigins.includes(
          origin
        )
      ) {
        callback(
          null,
          true
        );

        return;
      }


      console.error(
        "CORS BLOCKED ORIGIN:",
        origin
      );


      callback(
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
 * VERY IMPORTANT:
 * THESE MUST BE BEFORE EVERY API ROUTE.
 * =========================================================
 */

app.use(
  express.json({
    limit: "2mb",
  })
);

app.use(
  "/api",
  financialReviewRoutes
);

app.use(
  "/api",
  calendarRoutes
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "2mb",
  })
);
app.use(
  "/api",
  chatRoutes
);

app.use(
  "/api",
  financialReviewRoutes
);


app.use(
  "/api",
  technicalReviewRoutes
);

/*
 * =========================================================
 * SECURITY
 * =========================================================
 */

app.use(
  helmet()
);


/*
 * =========================================================
 * REQUEST LOGGING
 * =========================================================
 */

app.use(
  morgan("dev")
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
        req.headers[
          "content-type"
        ]
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
 *
 * ALL ROUTES MUST COME AFTER:
 *
 * express.json()
 * express.urlencoded()
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
    _req:
      express.Request,
    res:
      express.Response,
    _next:
      express.NextFunction
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