import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Product } from "../entities/Product";
import AppError from "../utils/AppError";
import { Movement, MovementStatus } from "../entities/Movement";
import { MovementRequest } from "../classes/MovementRequest";
import { AuthRequest } from "../middlewares/auth";
import { Driver } from "../entities/Driver";

const productRepository = AppDataSource.getRepository(Product);
const movementRepository = AppDataSource.getRepository(Movement);
const driverRepository = AppDataSource.getRepository(Driver);

export const createMovement = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const movementBody = req.body as MovementRequest;

    if (!movementBody.destination_branch_id) {
      throw new AppError(
        "O id da filial de destino precisa ser preenchido",
        400
      );
    }

    if (!movementBody.product_id) {
      throw new AppError("O id do produto precisa ser preenchido", 400);
    }

    if (!movementBody.quantity) {
      throw new AppError("Quantidade é obrigatória", 400);
    }

    const product = await productRepository.findOne({
      where: {
        id: movementBody.product_id,
      },
      relations: ["branch"],
    });

    if (!product) {
      throw new AppError("Produto não existe", 400);
    }

    if (
      !(movementBody.quantity > 0 && movementBody.quantity <= product.amount)
    ) {
      throw new AppError(
        "A quantidade deve ser inferior ou igual ao estoque disponível da filial de origem",
        400
      );
    }

    if (movementBody.destination_branch_id === product.branch.id) {
      throw new AppError(
        "A filial de origem não pode sera a mesma que a filial de destino",
        400
      );
    }

    product.amount = product.amount - movementBody.quantity;

    await productRepository.save(product);

    const result = await movementRepository.save({
      destinationBranch: {
        id: movementBody.destination_branch_id,
      },
      product: {
        id: product.id,
      },
      quantity: movementBody.quantity,
    });

    res.status(201).json(result);
  } catch (error) {
    if (error instanceof Error) {
      next(error);
    } else {
      next(new AppError("Não foi possível executar a solicitação!", 500));
    }
  }
};

export const listAllMovements = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const movements = await movementRepository.find({
      relations: ["destinationBranch", "product", "destinationBranch.user"],
    });

    res.status(200).json(
      movements.map((mov) => ({
        ...mov,
        destinationBranch: {
          ...mov.destinationBranch,
          user: {
            ...mov.destinationBranch.user,
            password_hash: undefined,
          },
        },
      }))
    );
  } catch (error) {
    if (error instanceof Error) {
      next(error);
    } else {
      next(new AppError("Não foi possível executar a solicitação!", 500));
    }
  }
};

export const startMovement = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const movementId = parseInt(req.params.id);

    const movement = await movementRepository.findOne({
      where: {
        id: movementId,
        status: MovementStatus.PENDING,
      },
    });

    if (!movement) {
      throw new AppError("Movimentação não encontrada", 404);
    }

    const loggedUser = (req as AuthRequest).loggedUser;

    const driver = await driverRepository.findOne({
      where: {
        user: {
          id: loggedUser.userId,
        },
      },
    });

    if (!driver) {
      throw new AppError("Driver não encontrado", 404);
    }

    movement.driver = driver;
    movement.status = MovementStatus.IN_PROGRESS;

    await movementRepository.save(movement);

    res.status(200).json(movement);
  } catch (error) {
    if (error instanceof Error) {
      next(error);
    } else {
      next(new AppError("Não foi possível executar a solicitação!", 500));
    }
  }
};

export const finishMovement = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const movementId = parseInt(req.params.id);

    const movement = await movementRepository.findOne({
      where: {
        id: movementId,
        status: MovementStatus.IN_PROGRESS,
      },
      relations: ["driver", "product", "destinationBranch"],
    });

    if (!movement) {
      throw new AppError("Movimentação não encontrada", 404);
    }

    const loggedUser = (req as AuthRequest).loggedUser;

    const driver = await driverRepository.findOne({
      where: {
        user: {
          id: loggedUser.userId,
        },
      },
    });

    if (!driver) {
      throw new AppError("Driver não encontrado", 404);
    }

    if (driver.id !== movement.driver.id) {
      throw new AppError(
        "Somente o motorista que iniciou esta movimentação pode finalizá-la",
        400
      );
    }

    movement.status = MovementStatus.FINISHED;

    await movementRepository.save(movement);

    await productRepository.save({
      ...movement.product,
      branch: movement.destinationBranch,
      amount: movement.quantity,
    });

    res.status(200).json(movement);
  } catch (error) {
    if (error instanceof Error) {
      next(error);
    } else {
      next(new AppError("Não foi possível executar a solicitação!", 500));
    }
  }
};
