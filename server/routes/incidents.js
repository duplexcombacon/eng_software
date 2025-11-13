// server/routes/incidents.js
import { Router } from "express";
import { poolPromise, sql } from "../db.js";
import { authRequired } from "../middlewares/auth.js";

const router = Router();

// GET /api/incidents
router.get("/", authRequired, async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .query(`
        SELECT 
          i.*,
          u1.name AS assignedToName,
          u2.name AS createdByName
        FROM Incidents i
        LEFT JOIN Users u1 ON i.assignedTo = u1.id
        LEFT JOIN Users u2 ON i.createdBy = u2.id
        ORDER BY i.createdAt DESC
      `);
    res.json(result.recordset);
  } catch (err) {
    console.error("Get incidents error:", err);
    res.status(500).json({ message: "Erro no servidor" });
  }
});

// GET /api/incidents/:id
router.get("/:id", authRequired, async (req, res) => {
  try {
    const { id } = req.params;
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("id", sql.Int, id)
      .query(`
        SELECT 
          i.*,
          u1.name AS assignedToName,
          u2.name AS createdByName
        FROM Incidents i
        LEFT JOIN Users u1 ON i.assignedTo = u1.id
        LEFT JOIN Users u2 ON i.createdBy = u2.id
        WHERE i.id = @id
      `);
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Incidente não encontrado" });
    }
    
    res.json(result.recordset[0]);
  } catch (err) {
    console.error("Get incident error:", err);
    res.status(500).json({ message: "Erro no servidor" });
  }
});

// POST /api/incidents
router.post("/", authRequired, async (req, res) => {
  const { title, description, category, priority, affectedUsers } = req.body;

  if (!title || !description || !category) {
    return res.status(400).json({ message: "Campos obrigatórios em falta" });
  }

  const prio = priority || "Média";
  const affected = Number.isInteger(affectedUsers) ? affectedUsers : 0;

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("title", sql.NVarChar, title)
      .input("description", sql.NVarChar, description)
      .input("category", sql.NVarChar, category)
      .input("priority", sql.NVarChar, prio)
      .input("status", sql.NVarChar, "Aberto")     // usa o mesmo em todo o lado
      .input("source", sql.NVarChar, "manual")
      .input("createdBy", sql.Int, req.user.id)
      .input("affectedUsers", sql.Int, affected)
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
    console.error("Create incident error:", err);
    res.status(500).json({ message: "Erro no servidor" });
  }
});

// PATCH /api/incidents/:id
router.patch("/:id", authRequired, async (req, res) => {
  const { id } = req.params;
  const { status, priority, assignedTo } = req.body;

  if (!status && !priority && !assignedTo) {
    return res.status(400).json({ message: "Nada para atualizar" });
  }

  try {
    const pool = await poolPromise;
    const request = pool.request().input("id", sql.Int, id);

    const sets = [];

    if (status) {
      sets.push("status = @status");
      request.input("status", sql.NVarChar, status);

      if (status === "Resolvido" || status === "Fechado") {
        sets.push("resolvedAt = GETDATE()");
      }
    }

    if (priority) {
      sets.push("priority = @priority");
      request.input("priority", sql.NVarChar, priority);
    }

    if (assignedTo) {
      sets.push("assignedTo = @assignedTo");
      request.input("assignedTo", sql.Int, assignedTo);
    }

    const query = `
      UPDATE Incidents
      SET ${sets.join(", ")}
      WHERE id = @id;
      SELECT 
        i.*,
        u1.name AS assignedToName,
        u2.name AS createdByName
      FROM Incidents i
      LEFT JOIN Users u1 ON i.assignedTo = u1.id
      LEFT JOIN Users u2 ON i.createdBy = u2.id
      WHERE i.id = @id;
    `;

    const result = await request.query(query);
    const updated =
      result.recordset[result.recordset.length - 1] || null;

    res.json(updated);
  } catch (err) {
    console.error("Update incident error:", err);
    res.status(500).json({ message: "Erro no servidor" });
  }
});

export default router;
