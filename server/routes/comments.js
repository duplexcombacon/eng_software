// server/routes/comments.js
import { Router } from "express";
import { poolPromise, sql } from "../db.js";
import { authRequired } from "../middlewares/auth.js";

const router = Router();

// GET /api/incidents/:incidentId/comments
// Obter todos os comentários de um incidente
router.get("/:incidentId/comments", authRequired, async (req, res) => {
  try {
    const { incidentId } = req.params;

    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("incidentId", sql.Int, incidentId)
      .query(`
        SELECT 
          c.id,
          c.incidentId,
          c.userId,
          c.text,
          c.createdAt,
          u.name as userName
        FROM Comments c
        LEFT JOIN Users u ON c.userId = u.id
        WHERE c.incidentId = @incidentId
        ORDER BY c.createdAt DESC
      `);

    res.json(result.recordset);
  } catch (err) {
    console.error("Get comments error:", err);
    res.status(500).json({ message: "Erro ao carregar comentários" });
  }
});

// POST /api/incidents/:incidentId/comments
// Adicionar um novo comentário
router.post("/:incidentId/comments", authRequired, async (req, res) => {
  try {
    const { incidentId } = req.params;
    const { text } = req.body;
    const userId = req.user.id;

    // Validar campos obrigatórios
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: "Comentário não pode estar vazio" });
    }

    if (text.trim().length > 5000) {
      return res.status(400).json({ message: "Comentário muito longo (máximo 5000 caracteres)" });
    }

    // Verificar se o incidente existe
    const pool = await poolPromise;
    const incidentCheck = await pool
      .request()
      .input("id", sql.Int, incidentId)
      .query("SELECT id FROM Incidents WHERE id = @id");

    if (incidentCheck.recordset.length === 0) {
      return res.status(404).json({ message: "Incidente não encontrado" });
    }

    // Inserir comentário
    const result = await pool
      .request()
      .input("incidentId", sql.Int, incidentId)
      .input("userId", sql.Int, userId)
      .input("text", sql.NVarChar, text.trim())
      .query(`
        INSERT INTO Comments (incidentId, userId, text)
        OUTPUT INSERTED.*
        VALUES (@incidentId, @userId, @text)
      `);

    res.status(201).json(result.recordset[0]);
  } catch (err) {
    console.error("Create comment error:", err);
    res.status(500).json({ message: "Erro ao criar comentário" });
  }
});

// DELETE /api/incidents/:incidentId/comments/:commentId
// Eliminar um comentário (apenas o autor ou admin)
router.delete("/:incidentId/comments/:commentId", authRequired, async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const pool = await poolPromise;

    // Obter comentário para verificar se é o autor
    const commentCheck = await pool
      .request()
      .input("id", sql.Int, commentId)
      .query("SELECT userId FROM Comments WHERE id = @id");

    if (commentCheck.recordset.length === 0) {
      return res.status(404).json({ message: "Comentário não encontrado" });
    }

    const comment = commentCheck.recordset[0];

    // Verificar permissões (autor ou sysadmin)
    if (comment.userId !== userId && userRole !== "sysadmin") {
      return res.status(403).json({ message: "Sem permissão para eliminar este comentário" });
    }

    // Eliminar comentário
    await pool
      .request()
      .input("id", sql.Int, commentId)
      .query("DELETE FROM Comments WHERE id = @id");

    res.json({ message: "Comentário eliminado com sucesso" });
  } catch (err) {
    console.error("Delete comment error:", err);
    res.status(500).json({ message: "Erro ao eliminar comentário" });
  }
});

export default router;
