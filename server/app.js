import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import incidentRoutes from "./routes/incidents.js";
import alertRoutes from "./routes/alerts.js";
import metricsRoutes from "./routes/metrics.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Rotas
app.use("/api/auth", authRoutes);
app.use("/api/incidents", incidentRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/metrics", metricsRoutes);

// Fallback simples
app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

export default app;
