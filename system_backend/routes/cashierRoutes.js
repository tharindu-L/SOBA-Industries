import express from "express";
import { loginCashier, registerCashier, getAllCashiers, testCashierEndpoint } from "../controllers/cashiersController.js";
import authMiddleware from "../middleware/auth.js";

const cashierRouter = express.Router();

// Define cashier routes
cashierRouter.post("/register", registerCashier);
cashierRouter.post("/login", loginCashier);
cashierRouter.get("/all", getAllCashiers); // New endpoint to get all cashiers
cashierRouter.get("/test", testCashierEndpoint); // Make sure it's imported above

export default cashierRouter;