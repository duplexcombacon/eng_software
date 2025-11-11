import app from "./app.js";
import "./db.js"; // só para garantir ligação à DB ao iniciar

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 API running on http://localhost:${PORT}`);
});
