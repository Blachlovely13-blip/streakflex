import { Router } from "express";

const router = Router();

router.post("/tribute", (req, res) => {
  console.log("[Tribute webhook] payload:", req.body);
  return res.status(200).json({ ok: true });
});

export default router;
