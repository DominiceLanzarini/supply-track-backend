import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import AppError from "../utils/AppError";
import { UserProfile } from "../entities/User";

type dataJwt = JwtPayload & { userId: number; profile: UserProfile };

export interface AuthRequest extends Request {
  loggedUser: {
    userId: number;
    profile: string;
  }
}

export const verifyToken = (profiles: UserProfile[]) => {
  return (
    req: Request,
    _res: Response,
    next: NextFunction
  ) => {
    try {
      const token = req.headers.authorization?.split(" ")[1] ?? "";

      if (!token) {
        throw new AppError("Token não informado", 401);
      }

      const jwtPayload = jwt.verify(
        token,
        process.env.JWT_SECRET ?? ""
      ) as dataJwt;

      if (profiles.includes(jwtPayload.profile)) {
        (req as AuthRequest).loggedUser = {
          userId: jwtPayload.userId,
          profile: jwtPayload.profile
        }
        next();
      } else {
        throw new AppError("Token não autorizado", 403);
      }
    } catch (error) {
      if ((error as any).statusCode) {
        next(error);
      } else {
        next(new AppError("Unknown error", 401));
      }
    }
  };
};

export default verifyToken;
