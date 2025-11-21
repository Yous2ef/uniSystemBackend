import { Router } from "express";
import { AuthController } from "./auth.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { validateRequest } from "../../middlewares/validation.middleware";
import {
    registerSchema,
    loginSchema,
    refreshTokenSchema,
    changePasswordSchema,
} from "./auth.validator";

const router = Router();
const authController = new AuthController();

// Public routes
router.post(
    "/register",
    validateRequest(registerSchema),
    authController.register.bind(authController)
);

router.post(
    "/login",
    validateRequest(loginSchema),
    authController.login.bind(authController)
);

router.post(
    "/refresh",
    validateRequest(refreshTokenSchema),
    authController.refreshToken.bind(authController)
);

// Protected routes
router.use(authMiddleware);

router.post("/logout", authController.logout.bind(authController));

router.get("/me", authController.getCurrentUser.bind(authController));

router.put(
    "/change-password",
    validateRequest(changePasswordSchema),
    authController.changePassword.bind(authController)
);

export default router;
