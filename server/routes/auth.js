// server/routes/auth.js
import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { poolPromise, sql } from "../db.js";
import dotenv from "dotenv";

dotenv.config();

const router = Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email e password obrigatórios" });
  }

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("email", sql.NVarChar, email)
      .query("SELECT TOP 1 * FROM Users WHERE email = @email");

    const user = result.recordset[0];

    if (!user) {
      return res.status(401).json({ message: "Credenciais inválidas" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: "Credenciais inválidas" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        role: user.role,   // 'gestor', 'tecnico', 'sysadmin'
        title: user.title
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES || "8h" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        title: user.title
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Erro no servidor" });
  }
});

export default router;
