import dotenv from "dotenv";
dotenv.config();

import "./db.js";       // Inicializa ligação BD
import app from "./app.js";

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 API running on http://localhost:${PORT}`);
});
