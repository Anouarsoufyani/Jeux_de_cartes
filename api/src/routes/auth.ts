import express from "express";
import passport from "passport";
import { AuthController } from "../controllers/auth/authController";

const router = express.Router();

router.route("/").get(AuthController.getAllUsers);
router.route("/register").post(AuthController.registerUser);
router.route("/login").post(AuthController.loginUser);
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  AuthController.currentUser
);

router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  AuthController.getAllUsers
);

export default router;
