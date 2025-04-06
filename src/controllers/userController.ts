import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { UserCreateRequest } from "../classes/UserCreateRequest";
import { cnpj, cpf } from "cpf-cnpj-validator";
import { Driver } from "../entities/Driver";
import { Branch } from "../entities/Branch";
import { User, UserProfile } from "../entities/User";
import bcrypt from "bcrypt";
import AppError from "../utils/AppError";
import logger from "../config/winston";
import { AuthRequest } from "../middlewares/auth";
import { UserUpdateRequest } from "../classes/UserUpdateRequest";

const userRepository = AppDataSource.getRepository(User);
const driverRepository = AppDataSource.getRepository(Driver);
const branchRepository = AppDataSource.getRepository(Branch);

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userBody = req.body as UserCreateRequest;

    if (!userBody.name) {
      throw new AppError("O nome é obrigatório", 400);
    }

    if (
      !userBody.profile ||
      !["DRIVER", "BRANCH", "ADMIN"].includes(userBody.profile)
    ) {
      throw new AppError("Perfil inválido", 400);
    }

    if (!userBody.email || !/\S+@\S+\.\S+/.test(userBody.email)) {
      throw new AppError("Email inválido", 400);
    }

    const foundEmail = await userRepository.findOne({
      where: {
        email: userBody.email,
      },
    });
    if (foundEmail) {
      throw new AppError("Email inválido", 400);
    }

    if (
      !userBody.password ||
      userBody.password.length < 6 ||
      userBody.password.length > 20
    ) {
      throw new AppError("A senha deve ter entre 6 e 20 caracteres", 400);
    }

    if (!userBody.document) {
      throw new AppError("O documento é obrigatório", 400);
    }

    if (
      (userBody.profile === "DRIVER" || userBody.profile === "ADMIN") &&
      !cpf.isValid(userBody.document)
    ) {
      throw new AppError("CPF inválido", 400);
    }

    if (userBody.profile === "BRANCH" && !cnpj.isValid(userBody.document)) {
      throw new AppError("CNPJ inválido", 400);
    }

    const salt = await bcrypt.genSalt(10);
    const encryptedPassword = await bcrypt.hash(userBody.password, salt);

    const userCreated = await userRepository.save({
      ...userBody,
      password_hash: encryptedPassword,
    });

    if (userBody.profile === "DRIVER") {
      await driverRepository.save({
        full_address: userBody.full_address,
        document: userBody.document,
        user: {
          id: userCreated.id
        },
      });
    } else if (userBody.profile === "BRANCH") {
      await branchRepository.save({
        full_address: userBody.full_address,
        document: userBody.document,
        user: {
          id: userCreated.id
        },
      });
    }

    res.status(201).json(userBody);
  } catch (error) {
    if ((error as any).statusCode) {
      next(error);
    } else {
      logger.error(error);
      next(new AppError("Não foi possível executar a solicitação!", 500));
    }
  }
};

export const findAllUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const profile = req.query.profile as UserProfile;

    const users = await userRepository.find({
      where: {
        profile: profile,
      },
    });

    res.status(200).json(
      users.map((user) => ({
        id: user.id,
        name: user.name,
        status: user.status,
        profile: user.profile,
      }))
    );
  } catch (error) {
    if ((error as any).statusCode) {
      next(error);
    } else {
      logger.error(error);
      next(new AppError("Não foi possível executar a solicitação!", 500));
    }
  }
};

export const findUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const inputUserId = parseInt(req.params.id);

    const loggedUser = (req as AuthRequest).loggedUser;
    if (
      loggedUser.profile === UserProfile.DRIVER &&
      loggedUser.userId !== inputUserId
    ) {
      throw new AppError("Sem permissão para acessar dados", 401);
    }

    const user = await userRepository.findOne({
      where: {
        id: inputUserId,
      },
      relations: ["driver", "branch"],
    });

    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }

    res.status(200).json({
      id: user.id,
      name: user.name,
      status: user.status,
      profile: user.profile,
      full_address: user.driver?.full_address ?? user.branch?.full_address,
    });
  } catch (error) {
    if ((error as any).statusCode) {
      next(error);
    } else {
      logger.error(error);
      next(new AppError("Não foi possível executar a solicitação!", 500));
    }
  }
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (
      req.body.id ||
      req.body.created_at ||
      req.body.updated_at ||
      req.body.status ||
      req.body.profile
    ) {
      throw new AppError("Sem permissão para alterar estes dados", 401);
    }

    const inputUserId = parseInt(req.params.id);

    const loggedUser = (req as AuthRequest).loggedUser;
    if (
      loggedUser.profile === UserProfile.DRIVER &&
      loggedUser.userId !== inputUserId
    ) {
      throw new AppError("Sem permissão para acessar dados", 401);
    }

    const user = await userRepository.findOne({
      where: {
        id: inputUserId,
      },
      relations: ["driver", "branch"],
    });

    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }

    const userBody = req.body as UserUpdateRequest;

    if (userBody.email) {
      if (!/\S+@\S+\.\S+/.test(userBody.email)) {
        throw new AppError("Email inválido", 400);
      }
      const foundEmail = await userRepository.findOne({
        where: {
          email: userBody.email,
        },
      });
      if (foundEmail && foundEmail.id !== inputUserId) {
        throw new AppError("Email inválido", 400);
      }
    }

    if (
      userBody.password &&
      (userBody.password.length < 6 ||
      userBody.password.length > 20)
    ) {
      throw new AppError("A senha deve ter entre 6 e 20 caracteres", 400);
    }

    if (userBody.name) {
      user.name = userBody.name;
    }
    if (userBody.email) {
      user.email = userBody.email;
    }
    if (userBody.password) {
      const salt = await bcrypt.genSalt(10);
      const encryptedPassword = await bcrypt.hash(userBody.password, salt);
      user.password_hash = encryptedPassword;
    }
    if (userBody.full_address) {
      if (user.profile === "DRIVER") {
        user.driver.full_address = userBody.full_address;
        await driverRepository.save(user.driver);
      }
      if (user.profile === "BRANCH") {
        user.branch.full_address = userBody.full_address;
        await driverRepository.save(user.branch);
      }
    }

    await userRepository.save(user);

    res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      full_address: user.driver?.full_address ?? user.branch?.full_address,
    });
    
  } catch (error) {
    if ((error as any).statusCode) {
      next(error);
    } else {
      logger.error(error);
      next(new AppError("Não foi possível executar a solicitação!", 500));
    }
  }
};


export const updateStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    const inputUserId = parseInt(req.params.id);
    const user = await userRepository.findOne({
      where: {
        id: inputUserId,
      }
    });

    if (!user) {
      throw new AppError("Usuário não encontrado", 404);
    }

    user.status = !user.status;

    await userRepository.save(user);

    res.status(200).json({ message: "Status do usuário atualizado com sucesso", statusUpdatedTo: user.status });

  } catch (error) {
    if ((error as any).statusCode) {
      next(error);
    } else {
      logger.error(error);
      next(new AppError("Não foi possível executar a solicitação!", 500));
    }
  }
};