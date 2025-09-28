import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  user?: { id: string; email?: string };
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const header = req.header("Authorization") || "";
  const token = header.replace("Bearer ", "").trim();
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const secret = process.env.JWT_SECRET || "";
    const decoded = jwt.verify(token, secret) as any;
    req.user = { id: decoded.id, email: decoded.email };
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
