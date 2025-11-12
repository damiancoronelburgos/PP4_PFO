import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "devsecret";

// Autenticación: exige JWT y lo decodifica
export function auth(req, res, next) {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : "";
  if (!token) return res.status(401).json({ error: "Token requerido" });

  try {
    req.user = jwt.verify(token, JWT_SECRET); // { sub, role, iat, exp }
    return next();
  } catch {
    return res.status(401).json({ error: "Token inválido" });
  }
}

// Autorización: permite solo ciertos roles
export function allowRoles(...roles) {
  return (req, res, next) => {
    if (!roles.length) return next();
    if (roles.includes(req.user?.role)) return next();
    return res.status(403).json({ error: "No autorizado" });
  };
}