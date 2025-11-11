// server/routes/alerts.js
import { Router } from "express";
import { poolPromise, sql } from "../db.js";
import { authRequired } from "../middlewares/auth.js";

const router = Router();

// POST /api/alerts
// Simula chamada de um sistema de monitorização (Nagios, etc.)
router.post("/", authRequired, async (req, res) => {
  const { source, host, service, message } = req.body;

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input(
        "title",
        sql.NVarChar,
        `Alerta ${service || "Sistema"} em ${host || "desconhecido"}`
      )
      .input(
        "description",
        sql.NVarChar,
        message || "Alerta crítico de monitorização"
      )
      .input("category", sql.NVarChar, "Infraestrutura")
      .input("priority", sql.NVarChar, "Crítica")
      .input("status", sql.NVarChar, "Aberto")
      .input("source", sql.NVarChar, source || "monitoring")
      .input("createdBy", sql.Int, 1) // utilizador "sistema"
      .input("affectedUsers", sql.Int, 0)
      .query(`
        INSERT INTO Incidents (
          title, description, category, priority, status,
          source, createdBy, affectedUsers
        )
        OUTPUT INSERTED.*
        VALUES (
          @title, @description, @category, @priority, @status,
          @source, @createdBy, @affectedUsers
        )
      `);

    res.status(201).json(result.recordset[0]);
  } catch (err) {
    console.error("Alert -> incident error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
