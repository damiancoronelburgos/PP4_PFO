import jwt from "jsonwebtoken";

export default function auth(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ error: "Falta token" });

    const token = header.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Token inválido" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // acá quedan { id, role, email }
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    res.status(401).json({ error: "Token inválido o expirado" });
  }
}
