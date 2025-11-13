// server/routes/options.js
import { Router } from "express";
import { poolPromise } from "../db.js";
import { authRequired } from "../middlewares/auth.js";

const router = Router();

// GET /api/options
// Retorna as opções disponíveis para categorias, prioridades e status
router.get("/", authRequired, async (req, res) => {
  try {
    const pool = await poolPromise;

    // Obter categorias únicas dos incidentes existentes
    const categoriesResult = await pool
      .request()
      .query(`
        SELECT DISTINCT category 
        FROM Incidents 
        WHERE category IS NOT NULL AND category != ''
        ORDER BY category
      `);

    // Categorias padrão (caso não existam incidentes ainda)
    const defaultCategories = [
      "Email/Comunicações",
      "Hardware/Impressoras",
      "Software/CRM",
      "Infraestrutura/Base de Dados",
      "Redes/Conectividade",
      "Software/Armazenamento"
    ];

    // Combinar categorias da BD com as padrão
    const dbCategories = categoriesResult.recordset.map(r => r.category);
    const allCategories = [...new Set([...defaultCategories, ...dbCategories])].sort();

    // Prioridades fixas (são sempre as mesmas)
    const priorities = ["Baixa", "Média", "Alta", "Crítica"];

    // Status fixos (são sempre os mesmos)
    const statuses = ["Aberto", "Em Progresso", "Escalado", "Resolvido"];

    res.json({
      categories: allCategories,
      priorities: priorities,
      statuses: statuses
    });
  } catch (err) {
    console.error("Get options error:", err);
    res.status(500).json({ message: "Erro no servidor" });
  }
});

export default router;

