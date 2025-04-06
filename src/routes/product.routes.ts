import Router from "express";
import { createProduct, listAllProducts } from "../controllers/productController";
import verifyToken from "../middlewares/auth";
import { UserProfile } from "../entities/User";

const productRouter = Router();

productRouter.post('/', verifyToken([UserProfile.BRANCH]), createProduct);
productRouter.get('/', verifyToken([UserProfile.BRANCH]), listAllProducts);

export default productRouter;
