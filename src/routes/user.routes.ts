import { Router } from "express";
import { createUser, findAllUsers, findUserById, updateStatus, updateUser } from '../controllers/userController';
import verifyToken from "../middlewares/auth";
import { UserProfile } from "../entities/User";

const userRouter = Router();

userRouter.post('/', verifyToken([UserProfile.ADMIN]), createUser );
userRouter.get('/', verifyToken([UserProfile.ADMIN]), findAllUsers);
userRouter.get('/:id', verifyToken([UserProfile.ADMIN, UserProfile.DRIVER]), findUserById);
userRouter.put('/:id', verifyToken([UserProfile.ADMIN, UserProfile.DRIVER]), updateUser);
userRouter.patch('/:id/status', verifyToken([UserProfile.ADMIN]), updateStatus);


export default userRouter;


