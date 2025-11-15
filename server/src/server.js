import app from "./app.js";
import { config } from "./config/env.js";

const port = config.port || 3000; // puerto por defecto

app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});