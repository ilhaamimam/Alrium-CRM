import type { AuthenticatedUser } from "./auth";

declare global {
  namespace Express {
    interface Request {
      accessToken?: string;
      user?: AuthenticatedUser;
    }
  }
}

export {};