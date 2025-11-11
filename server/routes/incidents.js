import { Router } from "express";
import { poolPromise, sql } from "../db.js";
import { authRequired } from "../middlewares/auth.js";

const router = Router();

// GET /api/incidents  (lista simples, com filtros opcionais)
router.get("/", authRequired, async (req, res) => {
  const { status, priority } = req.query;

  let query = "SELECT * FROM Incidents WHERE 1=1";
  const request = (await poolPromise).request();

  if (status) {
    query += " AND status = @status";
    request.input("status", sql.NVarChar, status);
  }
  if (priority) {
    query += " AND priority = @priority";
    request.input("priority", sql.NVarChar, priority);
  }

  try {
    const result = await request.query(query + " ORDER BY createdAt DESC");
    res.json(result.recordset);
  } catch (err) {
    console.error("Get incidents error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/incidents  (logging manual + categorização + prioridade)
router.post("/", authRequired, async (req, res) => {
  const { title, description, category, priority } = req.body;
  if (!title || !description || !category)
    return res.status(400).json({ message: "Missing required fields" });

  // Se não vier prioridade, definimos uma default
  const finalPriority = priority || "Média";

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("title", sql.NVarChar, title)
      .input("description", sql.NVarChar, description)
      .input("category", sql.NVarChar, category)
      .input("priority", sql.NVarChar, finalPriority)
      .input("status", sql.NVarChar, "Novo")
      .input("source", sql.NVarChar, "manual")
      .input("createdBy", sql.Int, req.user.id)
      .query(`
        INSERT INTO Incidents (title, description, category, priority, status, source, createdBy)
        OUTPUT INSERTED.*
        VALUES (@title, @description, @category, @priority, @status, @source, @createdBy)
      `);

    res.status(201).json(result.recordset[0]);
  } catch (err) {
    console.error("Create incident error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// PATCH /api/incidents/:id (estado, prioridade, assignedTo)
router.patch("/:id", authRequired, async (req, res) => {
  const { id } = req.params;
  const { status, priority, assignedTo } = req.body;

  if (!status && !priority && !assignedTo) {
    return res.status(400).json({ message: "Nothing to update" });
  }

  try {
    const pool = await poolPromise;
    const request = pool.request().input("id", sql.Int, id);

    let setClauses = [];

    if (status) {
      setClauses.push("status = @status");
      request.input("status", sql.NVarChar, status);
      if (status === "Resolvido" || status === "Fechado") {
        setClauses.push("resolvedAt = GETDATE()");
      }
    }
    if (priority) {
      setClauses.push("priority = @priority");
      request.input("priority", sql.NVarChar, priority);
    }
    if (assignedTo) {
      setClauses.push("assignedTo = @assignedTo");
      request.input("assignedTo", sql.Int, assignedTo);
    }

    const query = `
      UPDATE Incidents
      SET ${setClauses.join(", ")}
      WHERE id = @id;

      SELECT * FROM Incidents WHERE id = @id;
    `;

    const result = await request.query(query);
    res.json(result.recordset[result.recordset.length - 1]);
  } catch (err) {
    console.error("Update incident error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
