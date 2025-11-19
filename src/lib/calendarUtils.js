// Días y meses en Español
export const MESES_ES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export const DOW_ES = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

// Rango de años para el selector
export function getYearsRange(baseYear = new Date().getFullYear(), past = 1, future = 1) {
  const years = [];
  for (let y = baseYear - past; y <= baseYear + future; y++) {
    years.push(y);
  }
  return years;
}

// Celdas del calendario
export function getCalendarCells(year, month) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);

  const firstWeekDay = (first.getDay() + 6) % 7; // convertimos para que Lun=0
  const days = last.getDate();

  const cells = Array(firstWeekDay).fill(null);

  for (let d = 1; d <= days; d++) cells.push(d);

  while (cells.length % 7 !== 0) cells.push(null);

  return cells;
}
