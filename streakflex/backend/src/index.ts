import "dotenv/config";
import cors from "cors";
import express from "express";
import habitsRouter from "./routes/habits.js";
import webhookRouter from "./routes/webhook.js";

const app = express();
const port = Number(process.env.PORT || 4000);

const corsOrigin = process.env.CORS_ORIGIN?.split(",").map((item) => item.trim()) ?? "*";
app.use(cors({ origin: corsOrigin }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));
app.get("/api/user/status", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/user/me", (req, res) => {
  res.json({ id: 1, name: "Test User" });
})
app.use("/api/webhook", webhookRouter);
app.use("/api/habits", habitsRouter);

app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});
