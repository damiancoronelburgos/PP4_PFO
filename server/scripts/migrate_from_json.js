import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import mysql from 'mysql2/promise';
import { fileURLToPath } from 'url';

// __dirname en ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

// raíz del repo (carpeta que contiene a /server y /src)
const root = path.resolve(__dirname, '..', '..');

// helper para leer JSON desde /src/data
const read = (p) => JSON.parse(fs.readFileSync(path.join(root, 'src', 'data', p), 'utf8'));

// datasets
const roles           = read('roles.json');               // { ALUMNO: 'alumno', ... }
const users           = read('users.json');               // [{ username, password, role }]
const alumnos         = read('alumnos.json');
const docentes        = read('docentes.json');
const preceptores     = read('preceptores.json');
const administradores = read('administrador.json');
const materias        = read('materias.json');
const asistencias     = read('asistencias.json');
const calificaciones  = read('calificaciones.json');
const justificaciones = read('justificaciones.json');
const notificaciones  = read('notificaciones.json');
const eventos         = read('eventos_calendario.json');
const instituto       = read('instituto_contacto.json');

// 'MAT-1' + 'A' -> 'MAT-1_A'
const toComisionCode = (materiaCodigo, letra) => `${materiaCodigo}_${letra}`;

(async () => {
  const port = Number(process.env.DB_PORT || 3306);

  const cn = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || 'root',
    database: process.env.DB_NAME || 'prisma_app'
  });

  await cn.beginTransaction();
  try {
    // ---- ROLES
    const roleIds = {};
    for (const r of Object.values(roles)) {
      await cn.execute('INSERT IGNORE INTO roles(nombre) VALUES (?)', [r]);
      const [rows] = await cn.execute('SELECT id FROM roles WHERE nombre=?', [r]);
      roleIds[r] = rows[0].id;
    }

    // ---- USUARIOS
    const userIdByUsername = {};
    for (const u of users) {
      const hash  = await bcrypt.hash(u.password, 10);
      const rolId = roleIds[u.role];
      await cn.execute(
        'INSERT IGNORE INTO usuarios(username,password_hash,rol_id) VALUES (?,?,?)',
        [u.username, hash, rolId]
      );
      const [rows] = await cn.execute('SELECT id FROM usuarios WHERE username=?', [u.username]);
      userIdByUsername[u.username] = rows[0].id;
    }

    // ---- ALUMNOS / DOCENTES / PRECEPTORES / ADMINISTRADORES
    for (const a of alumnos) {
      await cn.execute(
        'INSERT IGNORE INTO alumnos(id,nombre,apellido,dni,telefono,email,usuario_id) VALUES (?,?,?,?,?,?,?)',
        [a.id, a.nombre, a.apellido, a.dni ? String(a.dni) : null, a.telefono || null, a.email || null, userIdByUsername[a.usuario] || null]
      );
    }
    for (const d of docentes) {
      await cn.execute(
        'INSERT IGNORE INTO docentes(id,nombre,apellido,telefono,email,usuario_id) VALUES (?,?,?,?,?,?)',
        [d.id, d.nombre, d.apellido, d.telefono || null, d.email || null, userIdByUsername[d.usuario] || null]
      );
    }
    for (const p of preceptores) {
      await cn.execute(
        'INSERT IGNORE INTO preceptores(id,nombre,apellido,usuario_id) VALUES (?,?,?,?)',
        [p.id, p.nombre, p.apellido, userIdByUsername[p.usuario] || null]
      );
    }
    for (const adm of administradores) {
      await cn.execute(
        'INSERT IGNORE INTO administradores(id,nombre,usuario_id) VALUES (?,?,?)',
        [adm.id, adm.nombre, userIdByUsername[adm.usuario] || null]
      );
    }

    // ---- MATERIAS y COMISIONES
    const materiaIdByCodigo = {};
    for (const m of materias) {
      await cn.execute('INSERT IGNORE INTO materias(codigo,nombre) VALUES (?,?)', [m.id, m.nombre]);
      const [rows] = await cn.execute('SELECT id FROM materias WHERE codigo=?', [m.id]);
      materiaIdByCodigo[m.id] = rows[0].id;
    }

    const comisionIdByCodigo = {};
    for (const m of materias) {
      const code = toComisionCode(m.id, m.comision);
      await cn.execute(
        'INSERT IGNORE INTO comisiones(codigo,materia_id,docente_id,letra,horario,cupo,sede,aula) VALUES (?,?,?,?,?,?,?,?)',
        [code, materiaIdByCodigo[m.id], m.docenteId || null, m.comision || null, m.horario || null, Number(m.cupo) || 0, m.sede || null, m.aula || null]
      );
      const [rows] = await cn.execute('SELECT id FROM comisiones WHERE codigo=?', [code]);
      comisionIdByCodigo[code] = rows[0]?.id ?? null;
    }

    // ---- PRECEPTOR ↔ COMISION
    for (const p of preceptores) {
      for (const code of (p.comisiones || [])) {
        const comId = comisionIdByCodigo[code] || null;
        if (comId) {
          await cn.execute(
            'INSERT IGNORE INTO preceptor_comision(preceptor_id,comision_id) VALUES (?,?)',
            [p.id, comId]
          );
        }
      }
    }

    // ---- ASISTENCIAS
    for (const a of asistencias) {
      const code  = toComisionCode(a.materiaId, a.comision);
      const comId = comisionIdByCodigo[code] || null;
      if (comId) {
        await cn.execute(
          'INSERT IGNORE INTO asistencias(fecha,alumno_id,comision_id,estado) VALUES (?,?,?,?)',
          [a.fecha, a.alumnoId, comId, a.estado]
        );
      }
    }

    // ---- CALIFICACIONES
    for (const c of calificaciones) {
      const code  = toComisionCode(c.materiaId, c.comision);
      const comId = comisionIdByCodigo[code] || null;
      const p     = c.parciales || {};
      await cn.execute(
        'INSERT IGNORE INTO calificaciones(alumno_id,comision_id,p1,p2,p3,estado,observacion,anio,cuatrimestre,docente_id) VALUES (?,?,?,?,?,?,?,?,?,?)',
        [c.alumnoId, comId, p.p1 ?? null, p.p2 ?? null, p.p3 ?? null, c.estado || null, c.observacion || null, c.anio || null, c.cuatrimestre || null, c.docenteId || null]
      );
    }

    // ---- JUSTIFICACIONES
    for (const j of justificaciones) {
      const code  = toComisionCode(j.materiaId, j.comision);
      const comId = comisionIdByCodigo[code] || null;
      await cn.execute(
        'INSERT IGNORE INTO justificaciones(id,alumno_id,comision_id,fecha,motivo,estado,documento_url) VALUES (?,?,?,?,?,?,?)',
        [j.id, j.alumnoId, comId, j.fecha, j.motivo, j.estado || 'pendiente', j.documentoUrl || null]
      );
    }

    // ---- NOTIFICACIONES
    for (const n of notificaciones) {
      await cn.execute(
        'INSERT IGNORE INTO notificaciones(id,destino,usuario_id,fecha,titulo,detalle,tipo,leida,favorito,link) VALUES (?,?,?,?,?,?,?,?,?,?)',
        [n.id, n.destino, null, n.fecha, n.titulo, n.detalle || null, n.tipo || null, !!n.leida, !!n.favorito, n.link || null]
      );
    }

    // ---- EVENTOS
    for (const e of eventos) {
      const comId = comisionIdByCodigo[e.comision] || null; // puede ser null
      await cn.execute(
        'INSERT IGNORE INTO eventos(id,fecha,titulo,comision_id) VALUES (?,?,?,?)',
        [e.id, e.fecha, e.titulo, comId]
      );
    }

    // ---- INSTITUTO
    await cn.execute(
      'INSERT IGNORE INTO instituto(id,nombre,direccion,telefono,email_secretaria,email_soporte,web,horarios) VALUES (1,?,?,?,?,?,?,?)',
      [instituto.nombre, instituto.direccion, instituto.telefono, instituto.email_secretaria, instituto.email_soporte, instituto.web, instituto.horarios]
    );

    await cn.commit();
    console.log('Migración OK');
  } catch (e) {
    await cn.rollback();
    console.error('Error en migración:', e.message);
    process.exit(1);
  } finally {
    await cn.end();
  }
})();