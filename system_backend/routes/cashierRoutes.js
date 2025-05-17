import express from "express";
import { loginCashier, registerCashier } from "../controllers/cashiersController.js";
import authMiddleware from "../middleware/auth.js";

const cashierRouter = express.Router();

// Define cashier routes
cashierRouter.post("/register", registerCashier);
cashierRouter.post("/login", loginCashier);

export default cashierRouter;