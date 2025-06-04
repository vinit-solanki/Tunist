import { NextFunction, RequestHandler, Request, Response } from "express";

// tryCatch.ts
export default function tryCatch(handler: (req: Request, res: Response, next: NextFunction) => any) {
    return (req: Request, res: Response, next: NextFunction) => {
      Promise.resolve(handler(req, res, next)).catch(next);
    };
  }