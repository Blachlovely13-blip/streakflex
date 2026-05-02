import "dotenv/config";
import cors from "cors";
import express from "express";
import habitsRouter from "./routes/habits.js";

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api/habits", habitsRouter);

app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});
