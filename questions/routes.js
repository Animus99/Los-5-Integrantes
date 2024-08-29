import { getQuestion } from "./controller.js";
import { Router } from "express";

const router = Router();
router.get("/questions/:id", getQuestion);  // Ruta para `id_pregunta`
export default router;