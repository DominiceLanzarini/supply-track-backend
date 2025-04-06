import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Branch } from "../entities/Branch";
import { Product } from "../entities/Product";
import AppError from "../utils/AppError"; 
import { AuthRequest } from "../middlewares/auth";
import { ProductRequest } from "../classes/ProductRequest";

const branchRepository = AppDataSource.getRepository(Branch);
const productRepository = AppDataSource.getRepository(Product);

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const loggedUser = (req as AuthRequest).loggedUser;

    console.log(loggedUser)

    const currentBranch = await branchRepository.findOneBy({
        user: {
          id: loggedUser.userId
        },
    });

    console.log(currentBranch)

    if (!currentBranch) {
      throw new AppError("Filial não encontrada", 404);
    }

    const productBody = req.body as ProductRequest;

    if (!productBody.name) {
      throw new AppError("O nome é obrigatório", 400);
    }
    if (!productBody.amount) {
      throw new AppError("A quantidade é obrigatória", 400);
    }
    if (!productBody.description) {
      throw new AppError("A descrição é obrigatória", 400);
    }

    const product = await productRepository.save({
      branch: {
        id: currentBranch.id
      },
      ...req.body,
    });

    res.status(201).json(product);
  } catch (error) {
    if (error instanceof Error) {
      next(error);
    } else {
      next(new AppError("Não foi possível executar a solicitação!", 500));
    }
  }
};


export const listAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const products = await productRepository.find({
      relations: ["branch", "branch.user"]
    });

    res.status(200).json(products.map((product) => ({
      id: product.id,
      name: product.name,
      amount: product.amount,
      description: product.description,
      branch: {
        ...product.branch,
        user: {
          ...product.branch.user,
          password_hash: undefined
        }
      }
    })))

  } catch (error) {
    if (error instanceof Error) {
      next(error);
    } else {
      next(new AppError("Não foi possível executar a solicitação!", 500));
    }
  }
  
}

