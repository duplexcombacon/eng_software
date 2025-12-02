// server/routes/nagios-webhook.js
/**
 * Webhook para receber alertas do Nagios
 * Converte alertas em incidentes automaticamente
 */

import { Router } from "express";
import { poolPromise, sql } from "../db.js";

const router = Router();

/**
 * POST /api/nagios/webhook
 * 
 * Recebe alertas do Nagios e cria incidentes automaticamente
 * 
 * Payload esperado:
 * {
 *   "host": "SERVER-01",
 *   "service": "CPU Load",
 *   "status": "CRITICAL|WARNING|OK",
 *   "output": "CPU: 95%",
 *   "timestamp": "2025-12-02 12:00:00"
 * }
 */
router.post("/webhook", async (req, res) => {
  try {
    const { host, service, status, output, timestamp } = req.body;

    // Validar payload
    if (!host || !service || !status) {
      return res.status(400).json({
        message: "Missing required fields: host, service, status"
      });
    }

    const pool = await poolPromise;

    // Mapear status Nagios para prioridade
    const priorityMap = {
      "CRITICAL": "Crítica",
      "WARNING": "Alta",
      "UNKNOWN": "Média",
      "OK": "Baixa"
    };

    const priority = priorityMap[status] || "Média";

    // Se OK, não criar incidente (ou marcar como resolvido)
    if (status === "OK") {
      // Procurar incidente aberto relacionado
      const existingIncident = await pool
        .request()
        .input("title", sql.NVarChar, `${service} - ${host}`)
        .query(`
          SELECT TOP 1 id FROM Incidents 
          WHERE title LIKE @title 
          AND status IN ('Aberto', 'Em Progresso')
          ORDER BY createdAt DESC
        `);

      if (existingIncident.recordset.length > 0) {
        await pool
          .request()
          .input("id", sql.Int, existingIncident.recordset[0].id)
          .query(`
            UPDATE Incidents 
            SET status = 'Resolvido', resolvedAt = GETDATE()
            WHERE id = @id
          `);
      }

      return res.json({
        message: "Status OK - Incidente resolvido",
        action: "resolved"
      });
    }

    // Verificar se já existe incidente aberto para este serviço
    const existingIncident = await pool
      .request()
      .input("title", sql.NVarChar, `${service} - ${host}`)
      .query(`
        SELECT id FROM Incidents 
        WHERE title LIKE @title 
        AND status IN ('Aberto', 'Em Progresso', 'Escalado')
      `);

    if (existingIncident.recordset.length > 0) {
      return res.json({
        message: "Incidente já existe para este serviço",
        incidentId: existingIncident.recordset[0].id,
        action: "skipped"
      });
    }

    // Criar novo incidente
    const result = await pool
      .request()
      .input("title", sql.NVarChar, `${service} - ${host}`)
      .input("description", sql.NVarChar, `
Nagios Alert:
Host: ${host}
Service: ${service}
Status: ${status}
Output: ${output}
Timestamp: ${timestamp || new Date().toISOString()}

Ação: Este incidente foi criado automaticamente pelo Nagios.
      `)
      .input("category", sql.NVarChar, "Infraestrutura")
      .input("priority", sql.NVarChar, priority)
      .input("affectedUsers", sql.Int, 100)
      .input("createdBy", sql.Int, 1) // System user
      .query(`
        INSERT INTO Incidents (title, description, category, priority, affectedUsers, status, createdBy, createdAt)
        OUTPUT INSERTED.id
        VALUES (@title, @description, @category, @priority, @affectedUsers, 'Aberto', @createdBy, GETDATE())
      `);

    const incidentId = result.recordset[0].id;

    // Atribuir ao SysAdmin se for crítico
    if (priority === "Crítica") {
      // Encontrar SysAdmin
      const sysadmin = await pool
        .request()
        .input("role", sql.NVarChar, "sysadmin")
        .query(`
          SELECT TOP 1 id FROM Users WHERE role = @role
        `);

      if (sysadmin.recordset.length > 0) {
        await pool
          .request()
          .input("id", sql.Int, incidentId)
          .input("assignedTo", sql.Int, sysadmin.recordset[0].id)
          .query(`
            UPDATE Incidents SET assignedTo = @assignedTo WHERE id = @id
          `);
      }
    }

    // Log do evento
    console.log(`[Nagios] Novo incidente criado: #${incidentId} - ${service} (${status})`);

    res.json({
      message: "Incidente criado com sucesso",
      incidentId: incidentId,
      priority: priority,
      action: "created"
    });

  } catch (err) {
    console.error("Nagios webhook error:", err);
    res.status(500).json({
      message: "Erro ao processar alerta Nagios",
      error: err.message
    });
  }
});

export default router;
