import Router from "express";
import { loginUser } from "../controllers/loginController";

const authRouter = Router();

authRouter.post('/', loginUser as any);

export default authRouter;
