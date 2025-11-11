// server/routes/incidents.js
const express = require("express");
const { poolPromise, sql } = require("../db");
const { authRequired } = require("../middlewares/auth");

const router = express.Router();

// GET /api/incidents
router.get("/", authRequired, async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .query("SELECT * FROM Incidents ORDER BY createdAt DESC");
    res.json(result.recordset);
  } catch (err) {
    console.error("Get incidents error:", err);
    res.status(500).json({ message: "Erro no servidor" });
  }
});

// POST /api/incidents
router.post("/", authRequired, async (req, res) => {
  const { title, description, category, priority } = req.body;
  if (!title || !description || !category)
    return res.status(400).json({ message: "Campos obrigatórios em falta" });

  const prio = priority || "Média";

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("title", sql.NVarChar, title)
      .input("description", sql.NVarChar, description)
      .input("category", sql.NVarChar, category)
      .input("priority", sql.NVarChar, prio)
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
    res.status(500).json({ message: "Erro no servidor" });
  }
});

// PATCH /api/incidents/:id
router.patch("/:id", authRequired, async (req, res) => {
  const { id } = req.params;
  const { status, priority, assignedTo } = req.body;

  if (!status && !priority && !assignedTo)
    return res.status(400).json({ message: "Nada para atualizar" });

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
      SELECT * FROM Incidents WHERE id = @id;
    `;

    const result = await request.query(query);
    const updated = result.recordset[result.recordset.length - 1];

    res.json(updated);
  } catch (err) {
    console.error("Update incident error:", err);
    res.status(500).json({ message: "Erro no servidor" });
  }
});

module.exports = router;
