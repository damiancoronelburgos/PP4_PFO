import prisma from "../db/prisma.js";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

export const DEFAULT_AVATAR_URL = "/uploads/avatars/default-avatar.png";

function resolveAvatarDiskPath(avatarUrl) {
  if (!avatarUrl) return null;
  const clean = avatarUrl.replace(/^\/+/, "");
  return path.resolve(clean);
}

// POST /.../me/avatar (cualquier rol)
export async function updateUserAvatar(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No se recibió ningún archivo." });
    }

    const userId = req.user.sub;
    const newAvatarUrl = `/uploads/avatars/${req.file.filename}`;

    const user = await prisma.usuarios.findUnique({
      where: { id: userId },
      select: { avatar_url: true },
    });

    if (user?.avatar_url && user.avatar_url !== DEFAULT_AVATAR_URL) {
      const oldPath = resolveAvatarDiskPath(user.avatar_url);
      if (oldPath) {
        fs.unlink(oldPath, (err) => {
          if (err) {
            console.error("Error al borrar avatar anterior:", err.message);
          }
        });
      }
    }

    const updatedUser = await prisma.usuarios.update({
      where: { id: userId },
      data: { avatar_url: newAvatarUrl },
      select: { avatar_url: true },
    });

    return res.json({
      ok: true,
      avatarUrl: updatedUser.avatar_url || DEFAULT_AVATAR_URL,
    });
  } catch (err) {
    console.error("updateUserAvatar error", err);
    next(err);
  }
}

// POST /.../me/password (cualquier rol)
export async function changeUserPassword(req, res, next) {
  try {
    const userId = req.user.sub;
    const { currentPassword, newPassword, confirmPassword } = req.body || {};

    const current = String(currentPassword || "");
    const nueva = String(newPassword || "");
    const confirm = String(confirmPassword || "");

    if (!current || !nueva || !confirm) {
      return res
        .status(400)
        .json({ error: "Todos los campos son obligatorios." });
    }

    if (nueva.length < 8) {
      return res
        .status(400)
        .json({ error: "La nueva contraseña debe tener al menos 8 caracteres." });
    }

    if (nueva !== confirm) {
      return res
        .status(400)
        .json({ error: "La nueva contraseña y la confirmación no coinciden." });
    }

    const user = await prisma.usuarios.findUnique({
      where: { id: userId },
      select: { password_hash: true },
    });

    if (!user) {
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    const ok = await bcrypt.compare(current, user.password_hash);
    if (!ok) {
      return res
        .status(400)
        .json({ error: "La contraseña actual no es correcta." });
    }

    const sameAsOld = await bcrypt.compare(nueva, user.password_hash);
    if (sameAsOld) {
      return res.status(400).json({
        error: "La nueva contraseña no puede ser igual a la actual.",
      });
    }

    const saltRounds = 10;
    const newHash = await bcrypt.hash(nueva, saltRounds);

    await prisma.usuarios.update({
      where: { id: userId },
      data: { password_hash: newHash },
    });

    return res.json({
      ok: true,
      message: "Contraseña actualizada correctamente.",
    });
  } catch (err) {
    console.error("changeUserPassword error", err);
    next(err);
  }
}