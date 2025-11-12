import { Router } from "express";
import { login, me } from "../controllers/auth.controller.js";
import { auth } from "../middlewares/auth.js";

const router = Router();

router.post("/login", login); // público
router.get("/me", auth, me);  // autenticado

export default router;