import { Router } from "express";
import { poolPromise, sql } from "../db.js";
import { authRequired, requireRole } from "../middlewares/auth.js";

const router = Router();

// GET /api/metrics  (apenas Gestor, por ex.)
router.get("/", authRequired, requireRole("GESTOR"), async (req, res) => {
  try {
    const pool = await poolPromise;

    const total = await pool.request()
      .query("SELECT COUNT(*) AS total FROM Incidents");

    const byPriority = await pool.request()
      .query("SELECT priority, COUNT(*) AS count FROM Incidents GROUP BY priority");

    const byCategory = await pool.request()
      .query("SELECT category, COUNT(*) AS count FROM Incidents GROUP BY category");

    const mttr = await pool.request()
      .query(`
        SELECT AVG(DATEDIFF(HOUR, createdAt, resolvedAt)) AS mttrHours
        FROM Incidents
        WHERE resolvedAt IS NOT NULL
      `);

    res.json({
      total: total.recordset[0].total,
      byPriority: byPriority.recordset,
      byCategory: byCategory.recordset,
      mttrHours: mttr.recordset[0].mttrHours || 0
    });
  } catch (err) {
    console.error("Metrics error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
