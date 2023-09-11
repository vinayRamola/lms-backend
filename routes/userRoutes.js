import { Router  } from "express";
import { forgotPassword, getProfile, login, logout, register, resetPassword } from "../controllers/userController.js";
import { isLoggedIn } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/multerMiddleware.js";

const router = Router();

router.post('/register',upload.single("avatar"), register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/me', isLoggedIn, getProfile);
router.post('/reset',forgotPassword);
router.post('/reset/:resetToken', resetPassword);

export default router;