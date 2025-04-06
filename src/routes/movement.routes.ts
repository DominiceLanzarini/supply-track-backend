import { Router } from "express";
import verifyToken from "../middlewares/auth";
import { UserProfile } from "../entities/User";
import { createMovement, finishMovement, listAllMovements, startMovement } from "../controllers/movementController";

const movementRouter = Router();

movementRouter.post("/", verifyToken([UserProfile.BRANCH]), createMovement);
movementRouter.get("/", verifyToken([UserProfile.BRANCH, UserProfile.DRIVER]), listAllMovements);
movementRouter.patch("/:id/start", verifyToken([UserProfile.DRIVER]), startMovement);
movementRouter.patch("/:id/end", verifyToken([UserProfile.DRIVER]), finishMovement);

export default movementRouter;