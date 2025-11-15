import prisma from "../db/prisma.js";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";


const DEFAULT_AVATAR_URL = "/uploads/avatars/default-avatar.png";

function parseDiaSemanaFromHorario(horario) {
  if (!horario) return null;

  const [diaRaw] = String(horario).trim().split(/\s+/);
  if (!diaRaw) return null;

  const diaNorm = diaRaw
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const map = {
    lunes: 1,
    martes: 2,
    miercoles: 3,
    jueves: 4,
    viernes: 5,
    sabado: 6,
    domingo: 0,
  };

  if (!(diaNorm in map)) return null;
  return map[diaNorm];
}

function todayInBuenosAiresDate() {
  const now = new Date();

  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = fmt.formatToParts(now);
  const year = parts.find((p) => p.type === "year").value;
  const month = parts.find((p) => p.type === "month").value;
  const day = parts.find((p) => p.type === "day").value;

  const isoDate = `${year}-${month}-${day}`; // YYYY-MM-DD
  return new Date(isoDate + "T00:00:00Z");
}

function formatDateLocal(date) {
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function resolveAvatarDiskPath(avatarUrl) {
  if (!avatarUrl) return null;
  const clean = avatarUrl.replace(/^\/+/, ""); // quita /
  return path.resolve(clean); // resuelve desde el cwd del contenedor (/app/server)
}

async function getPreceptorOr404(req, res) {
  const me = await prisma.preceptores.findFirst({
    where: { usuario_id: req.user.sub },
    select: { id: true, nombre: true, apellido: true, usuario_id: true },
  });

  if (!me) {
    res.status(404).json({ error: "Preceptor no encontrado" });
    return null;
  }
  return me;
}

// GET /api/preceptores/me/datos
export async function getPreceptorDatos(req, res, next) {
  try {
    const me = await getPreceptorOr404(req, res);
    if (!me) return;

    const user = await prisma.usuarios.findUnique({
      where: { id: me.usuario_id },
      select: {
        id: true,
        username: true,
        avatar_url: true,
      },
    });

    const avatarUrl = user?.avatar_url || DEFAULT_AVATAR_URL;

    res.json({
      id: me.id,
      nombre: me.nombre,
      apellido: me.apellido,
      usuarioId: me.usuario_id,
      username: user?.username || null,
      avatarUrl,
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/preceptores/me/comisiones
export async function getPreceptorComisiones(req, res, next) {
  try {
    const me = await getPreceptorOr404(req, res);
    if (!me) return;

    const vinculos = await prisma.preceptor_comision.findMany({
      where: { preceptor_id: me.id },
      select: {
        comisiones: {
          select: {
            id: true,
            codigo: true,
            letra: true,
            horario: true,
            cupo: true,
            sede: true,
            aula: true,
            materias: { select: { id: true, codigo: true, nombre: true } },
            docentes: { select: { id: true, nombre: true, apellido: true } },
          },
        },
      },
      orderBy: { comision_id: "asc" },
    });

    const out = (vinculos || []).map((v) => {
      const c = v.comisiones;
      return {
        id: c.id,
        materia: {
          id: c.materias?.id,
          codigo: c.materias?.codigo,
          nombre: c.materias?.nombre ?? "-",
        },
        comision: c.codigo,
        horario: c.horario || "-",
        sede: c.sede || "Central",
        aula: c.aula || "A confirmar",
        docente: c.docentes ? `${c.docentes.nombre} ${c.docentes.apellido}` : "-",
        estado: c.estado || "Activo",
        cupo: c.cupo ?? null,
      };
    });

    res.json(out);
  } catch (err) {
    next(err);
  }
}

// GET /api/preceptores/me/alumnos-metrics
export async function getPreceptorAlumnosMetrics(req, res, next) {
  try {
    const me = await getPreceptorOr404(req, res);
    if (!me) return;

    const rows = await prisma.$queryRaw`
      SELECT
        a.id AS alumnoId,
        CONCAT(a.apellido, ', ', a.nombre) AS alumno,
        a.email AS email,
        c.id AS comisionId,
        c.codigo AS comisionCodigo,
        COALESCE(SUM(CASE WHEN asis.estado = 'P' THEN 1 ELSE 0 END), 0) AS presentes,
        COALESCE(SUM(CASE WHEN asis.estado = 'T' THEN 1 ELSE 0 END), 0) AS tardes,
        COALESCE(COUNT(DISTINCT asis.fecha), 0) AS totalClases,
        COALESCE(COUNT(DISTINCT j.id), 0) AS justificaciones
      FROM inscripciones i
        INNER JOIN alumnos a ON a.id = i.alumno_id
        INNER JOIN comisiones c ON c.id = i.comision_id
        INNER JOIN preceptor_comision pc ON pc.comision_id = c.id
        LEFT JOIN asistencias asis
          ON asis.comision_id = c.id AND asis.alumno_id = a.id
        LEFT JOIN justificaciones j
          ON j.comision_id = c.id AND j.alumno_id = a.id
      WHERE pc.preceptor_id = ${me.id}
        AND i.estado = 'activa'
      GROUP BY
        a.id, a.apellido, a.nombre, a.email,
        c.id, c.codigo
      ORDER BY alumno, comisionCodigo;
    `;

    const toNum = (v) => (typeof v === "bigint" ? Number(v) : v ?? 0);

    const out = (rows || []).map((r) => ({
      alumnoId: Number(r.alumnoId),
      alumno: r.alumno,
      email: r.email,
      comisionId: Number(r.comisionId),
      comisionCodigo: r.comisionCodigo,
      presentes: toNum(r.presentes),
      tardes: toNum(r.tardes),
      totalClases: toNum(r.totalClases),
      justificaciones: toNum(r.justificaciones),
    }));

    res.json(out);
  } catch (err) {
    next(err);
  }
}

// GET /api/preceptores/me/asistencias/fechas?comisionId=1
export async function getPreceptorAsistenciasFechas(req, res, next) {
  try {
    const me = await getPreceptorOr404(req, res);
    if (!me) return;

    const comisionId = Number(req.query.comisionId);
    if (!comisionId || Number.isNaN(comisionId)) {
      return res.status(400).json({ error: "comisionId inválido" });
    }

    const vinculo = await prisma.preceptor_comision.findFirst({
      where: { preceptor_id: me.id, comision_id: comisionId },
      select: { comision_id: true },
    });

    if (!vinculo) {
      return res.status(403).json({ error: "No autorizado para esta comisión" });
    }

    const rows = await prisma.$queryRaw`
      SELECT DISTINCT fecha
      FROM asistencias
      WHERE comision_id = ${comisionId}
      ORDER BY fecha DESC;
    `;

    const fechas = (rows || []).map((r) => {
      const d = r.fecha instanceof Date ? r.fecha : new Date(r.fecha);
      return formatDateLocal(d) || "";
    });

    res.json(fechas);
  } catch (err) {
    next(err);
  }
}

// GET /api/preceptores/me/asistencias?comisionId=1&fecha=2025-09-19
export async function getPreceptorAsistenciasLista(req, res, next) {
  try {
    const me = await getPreceptorOr404(req, res);
    if (!me) return;

    const comisionId = Number(req.query.comisionId);
    const fecha = String(req.query.fecha || "");

    if (!comisionId || Number.isNaN(comisionId)) {
      return res.status(400).json({ error: "comisionId inválido" });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      return res
        .status(400)
        .json({ error: "fecha inválida, formato esperado YYYY-MM-DD" });
    }

    const vinculo = await prisma.preceptor_comision.findFirst({
      where: { preceptor_id: me.id, comision_id: comisionId },
      select: { comision_id: true },
    });

    if (!vinculo) {
      return res.status(403).json({ error: "No autorizado para esta comisión" });
    }

    const rows = await prisma.$queryRaw`
      SELECT
        a.id AS alumnoId,
        a.apellido,
        a.nombre,
        a.dni,
        asis.estado
      FROM inscripciones i
        INNER JOIN alumnos a ON a.id = i.alumno_id
        INNER JOIN preceptor_comision pc ON pc.comision_id = i.comision_id
        LEFT JOIN asistencias asis
          ON asis.alumno_id = i.alumno_id
         AND asis.comision_id = i.comision_id
         AND asis.fecha = ${fecha}
      WHERE i.comision_id = ${comisionId}
        AND i.estado = 'activa'
        AND pc.preceptor_id = ${me.id}
      ORDER BY a.apellido, a.nombre;
    `;

    const out = (rows || []).map((r) => ({
      alumnoId: Number(r.alumnoId),
      apellido: r.apellido,
      nombre: r.nombre,
      dni: r.dni,
      estado: r.estado || "",
    }));

    res.json(out);
  } catch (err) {
    next(err);
  }
}

// POST /api/preceptores/me/asistencias
export async function savePreceptorAsistencias(req, res, next) {
  try {
    const me = await getPreceptorOr404(req, res);
    if (!me) return;

    const { comisionId, fecha, items } = req.body || {};

    const comIdNum = Number(comisionId);
    if (!comIdNum || Number.isNaN(comIdNum)) {
      return res.status(400).json({ error: "comisionId inválido" });
    }
    if (!fecha || !/^\d{4}-\d{2}-\d{2}$/.test(String(fecha))) {
      return res
        .status(400)
        .json({ error: "fecha inválida, formato esperado YYYY-MM-DD" });
    }

    const vinculo = await prisma.preceptor_comision.findFirst({
      where: { preceptor_id: me.id, comision_id: comIdNum },
      select: { comision_id: true },
    });

    if (!vinculo) {
      return res.status(403).json({ error: "No autorizado para esta comisión" });
    }

    const comision = await prisma.comisiones.findUnique({
      where: { id: comIdNum },
      select: { horario: true, codigo: true },
    });

    if (comision && comision.horario) {
      const expectedDow = parseDiaSemanaFromHorario(comision.horario);
      if (expectedDow != null) {
        const fechaObj = new Date(`${fecha}T00:00:00`);
        const actualDow = fechaObj.getDay();

        if (actualDow !== expectedDow) {
          return res.status(400).json({
            error: `La fecha seleccionada (${fecha}) no coincide con el día de cursada de la comisión (${comision.horario}).`,
          });
        }
      }
    }

    const allowedEstados = new Set(["P", "A", "T", "J"]);

    const cleanItems = Array.isArray(items)
      ? items
          .map((it) => ({
            alumnoId: Number(it.alumnoId),
            estado: String(it.estado || "").trim().toUpperCase(),
          }))
          .filter((it) => it.alumnoId && allowedEstados.has(it.estado))
      : [];

    await prisma.$transaction(async (tx) => {
      await tx.$executeRaw`
        DELETE FROM asistencias
        WHERE comision_id = ${comIdNum}
          AND fecha = ${fecha};
      `;

      for (const it of cleanItems) {
        await tx.$executeRaw`
          INSERT INTO asistencias (fecha, alumno_id, comision_id, estado)
          VALUES (${fecha}, ${it.alumnoId}, ${comIdNum}, ${it.estado});
        `;
      }
    });

    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

// GET /api/preceptores/me/notificaciones
export async function getPreceptorNotificaciones(req, res, next) {
  try {
    const me = await getPreceptorOr404(req, res);
    if (!me) return;

    const userId = me.usuario_id;

    const rows = await prisma.notificaciones.findMany({
      where: {
        usuario_id: userId,
      },
      orderBy: [{ fecha: "desc" }, { id: "desc" }],
    });

    const out = (rows || []).map((n) => ({
      id: n.id,
      destino: n.destino,
      usuarioId: n.usuario_id,
      fecha: n.fecha ? formatDateLocal(n.fecha) : null,
      titulo: n.titulo,
      detalle: n.detalle || "",
      tipo: n.tipo || "info",
      leida: !!n.leida,
      favorito: !!n.favorito,
      link: n.link || null,
    }));

    res.json(out);
  } catch (err) {
    next(err);
  }
}

// PATCH /api/preceptores/me/notificaciones/:id
export async function updatePreceptorNotificacion(req, res, next) {
  try {
    const me = await getPreceptorOr404(req, res);
    if (!me) return;

    const userId = me.usuario_id;
    const id = Number(req.params.id);

    if (!id || Number.isNaN(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const notif = await prisma.notificaciones.findFirst({
      where: { id, usuario_id: userId },
    });

    if (!notif) {
      return res.status(404).json({ error: "Notificación no encontrada" });
    }

    const data = {};
    if (typeof req.body.leida === "boolean") {
      data.leida = req.body.leida;
    }
    if (typeof req.body.favorito === "boolean") {
      data.favorito = req.body.favorito;
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ error: "Nada para actualizar" });
    }

    const updated = await prisma.notificaciones.update({
      where: { id },
      data,
    });

    const out = {
      id: updated.id,
      destino: updated.destino,
      usuarioId: updated.usuario_id,
      fecha: updated.fecha ? formatDateLocal(updated.fecha) : null,
      titulo: updated.titulo,
      detalle: updated.detalle || "",
      tipo: updated.tipo || "info",
      leida: !!updated.leida,
      favorito: !!updated.favorito,
      link: updated.link || null,
    };

    res.json(out);
  } catch (err) {
    next(err);
  }
}

export async function deletePreceptorNotificacion(req, res, next) {
  try {
    const me = await getPreceptorOr404(req, res);
    if (!me) return;

    const userId = me.usuario_id;
    const id = Number(req.params.id);

    if (!id || Number.isNaN(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    const notif = await prisma.notificaciones.findFirst({
      where: {
        id,
        usuario_id: userId,
      },
    });

    if (!notif) {
      return res.status(404).json({ error: "Notificación no encontrada" });
    }

    await prisma.notificaciones.delete({
      where: { id },
    });

    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

// POST /api/preceptores/me/comunicaciones
export async function sendPreceptorComunicacion(req, res, next) {
  try {
    const me = await getPreceptorOr404(req, res);
    if (!me) return;

    const { asunto, mensaje, comisionIds, otrosEmails } = req.body || {};

    const subject = String(asunto || "").trim();
    const body = String(mensaje || "").trim();

    if (!subject) {
      return res.status(400).json({ error: "El asunto es obligatorio." });
    }
    if (!body) {
      return res.status(400).json({ error: "El mensaje es obligatorio." });
    }

    const comIds = Array.isArray(comisionIds)
      ? comisionIds
          .map((v) => Number(v))
          .filter((n) => Number.isFinite(n) && n > 0)
      : [];

    const emailList = Array.isArray(otrosEmails)
      ? otrosEmails
          .map((e) => String(e).trim().toLowerCase())
          .filter((e) => e.length > 0)
      : [];

    const uniqueEmails = Array.from(new Set(emailList));

    const destinatarios = new Map();
    const emailsSinUsuario = [];

    // Destinatarios por comisión (alumnos de esas comisiones)
    for (const comId of comIds) {
      const vinculo = await prisma.preceptor_comision.findFirst({
        where: { preceptor_id: me.id, comision_id: comId },
        select: { comision_id: true },
      });
      if (!vinculo) continue;

      const rows = await prisma.$queryRaw`
        SELECT DISTINCT
          u.id AS usuarioId
        FROM inscripciones i
          INNER JOIN alumnos a ON a.id = i.alumno_id
          INNER JOIN usuarios u ON u.id = a.usuario_id
        WHERE i.estado = 'activa'
          AND i.comision_id = ${comId}
          AND a.usuario_id IS NOT NULL;
      `;

      for (const r of rows || []) {
        const uid = Number(r.usuarioId);
        if (!uid || Number.isNaN(uid)) continue;
        if (!destinatarios.has(uid)) {
          destinatarios.set(uid, "alumno");
        }
      }
    }

    // Destinatarios por email (alumnos o docentes con usuario)
    for (const email of uniqueEmails) {
      let found = false;

      const rowsAlum = await prisma.$queryRaw`
        SELECT u.id AS usuarioId
        FROM alumnos a
          INNER JOIN usuarios u ON u.id = a.usuario_id
        WHERE a.usuario_id IS NOT NULL
          AND LOWER(a.email) = ${email}
        LIMIT 1;
      `;
      if (rowsAlum && rowsAlum.length > 0) {
        const uid = Number(rowsAlum[0].usuarioId);
        if (uid && !Number.isNaN(uid) && !destinatarios.has(uid)) {
          destinatarios.set(uid, "alumno");
        }
        found = true;
      }

      if (!found) {
        const rowsDoc = await prisma.$queryRaw`
          SELECT u.id AS usuarioId
          FROM docentes d
            INNER JOIN usuarios u ON u.id = d.usuario_id
          WHERE d.usuario_id IS NOT NULL
            AND LOWER(d.email) = ${email}
          LIMIT 1;
        `;
        if (rowsDoc && rowsDoc.length > 0) {
          const uid = Number(rowsDoc[0].usuarioId);
          if (uid && !Number.isNaN(uid) && !destinatarios.has(uid)) {
            destinatarios.set(uid, "docente");
          }
          found = true;
        }
      }

      if (!found) {
        emailsSinUsuario.push(email);
      }
    }

    if (destinatarios.size === 0) {
      return res.status(400).json({
        error:
          "No se encontraron destinatarios con usuario asociado para este comunicado.",
        emailsSinUsuario,
      });
    }

    const now = todayInBuenosAiresDate();

    const dataToInsert = Array.from(destinatarios.entries()).map(
      ([usuarioId, destino]) => ({
        destino,
        usuario_id: usuarioId,
        fecha: now,
        titulo: subject,
        detalle: body,
        tipo: "comunicacion",
        leida: false,
        favorito: false,
        link: null,
      })
    );

    const result = await prisma.notificaciones.createMany({
      data: dataToInsert,
    });

    res.status(201).json({
      totalDestinatarios: destinatarios.size,
      totalNotificaciones: result?.count ?? dataToInsert.length,
      emailsSinUsuario,
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/preceptores/me/avatar
export async function updatePreceptorAvatar(req, res, next) {
  try {
    const me = await getPreceptorOr404(req, res);
    if (!me) return;

    if (!req.file) {
      return res.status(400).json({ error: "No se recibió ningún archivo." });
    }

    const newAvatarUrl = `/uploads/avatars/${req.file.filename}`;

    const user = await prisma.usuarios.findUnique({
      where: { id: me.usuario_id },
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
      where: { id: me.usuario_id },
      data: { avatar_url: newAvatarUrl },
      select: { id: true, username: true, avatar_url: true },
    });

    res.json({
      ok: true,
      avatarUrl: updatedUser.avatar_url || DEFAULT_AVATAR_URL,
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/preceptores/me/password
export async function changePreceptorPassword(req, res, next) {
  try {
    const me = await getPreceptorOr404(req, res);
    if (!me) return;

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
      where: { id: me.usuario_id },
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
      return res
        .status(400)
        .json({ error: "La nueva contraseña no puede ser igual a la actual." });
    }

    const saltRounds = 10;
    const newHash = await bcrypt.hash(nueva, saltRounds);

    await prisma.usuarios.update({
      where: { id: me.usuario_id },
      data: { password_hash: newHash },
    });

    res.json({
      ok: true,
      message: "Contraseña actualizada correctamente.",
    });
  } catch (err) {
    next(err);
  }
}