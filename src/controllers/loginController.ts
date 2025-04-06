import { LoginRequest } from "../classes/LoginRequest";
import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import AppError from "../utils/AppError";

const secretKey = process.env.JWT_SECRET ?? "";
const userRepository = AppDataSource.getRepository(User);

export const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userBody = req.body as LoginRequest;

    if (!userBody.email || !userBody.password) {
        throw new AppError("Email e password obrigatórios", 400);
    }

    const foundUser = await userRepository.findOne({
      where: {
        email: userBody.email
      },
    });

    if (foundUser && await bcrypt.compare(userBody.password, foundUser.password_hash)) {
      const payload = {
        userId: foundUser.id,
        profile: foundUser.profile,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // expira em 24h
      };

      // Gera o token
      const token = jwt.sign(payload, secretKey);

      res.status(200).json({
        access_token: token,
      });
    } else {
        throw new AppError("Usuário não autorizado", 403);
    }
  } catch (error) {
    if (error instanceof Error) {
        next(error);
    } else {
        next(new AppError("Não foi possível executar a solicitação!", 500));
    }
  }
};
