import express from "express";
import morgan from "morgan";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";

const app = express();

const ORIGINS = (process.env.CORS_ORIGIN?.split(",") ?? ["http://localhost:5173"]);

app.use(cors({
  origin: ORIGINS,
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"],
  credentials: false,
  optionsSuccessStatus: 204,
}));
app.options("*", cors());

app.use(express.json());
app.use(morgan("dev"));

app.use("/api/auth", authRoutes);

app.get("/api/health", (_,res)=>res.json({ ok:true }));

export default app;