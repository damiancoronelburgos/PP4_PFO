import React, { useState, useEffect } from "react";
import Calendario from "../../components/Calendario";
import { MESES_ES, DOW_ES, getCalendarCells, getYearsRange } from "../../lib/calendarUtils"; 
import { api } from "../../lib/api";
import "../../styles/preceptor.css";


export default function DocenteCalendario({ onVolver }) {
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth());
  const [calAnimKey, setCalAnimKey] = useState(0);

  const years = getYearsRange(calYear);
  const cells = getCalendarCells(calYear, calMonth);

  const [loadingEventos, setLoadingEventos] = useState(false);
  const [errEventos, setErrEventos] = useState("");
  const [eventosPorDia, setEventosPorDia] = useState(new Map());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [draft, setDraft] = useState({ fecha:"", comisionId:"", titulo:"" });

  const [comisionesCalOptions, setComisionesCalOptions] = useState([]);
  const hasComisionesForEvents = comisionesCalOptions.length > 0;

  const loadComisiones = async () => {
  try {
    const data = await api.get("/docentes/me/comisiones");
    const arr = Array.isArray(data?.data) ? data.data : [];
    setComisionesCalOptions(arr);
  } catch (e) {
    console.error("No se pudieron cargar comisiones", e);
    setComisionesCalOptions([]);
  }
  };




  const loadEventos = async () => {
  try {
    setLoadingEventos(true);

    const url = `/calendario/docente/eventos?year=${calYear}&month=${calMonth + 1}`;
    const result = await api.get(url);

    // La API devuelve { data: { "15": [evento1], "20": [evento2] } }
    const mapObj = result?.data ?? {};

    console.log("Eventos recibidos (crudo):", mapObj);

    // Convertimos las claves a número para que .get(day) funcione
    const entries = Object.entries(mapObj).map(([dayStr, events]) => [
      Number(dayStr),
      events,
    ]);

    setEventosPorDia(new Map(entries));

    setErrEventos("");
  } catch (e) {
    console.error("Error cargando eventos:", e);
    setErrEventos("No se pudo cargar eventos.");
  } finally {
    setLoadingEventos(false);
  }
};
  useEffect(() => {
  async function loadComisiones() {
    try {
      const data = await fetchDocenteComisiones();
      setComisionesCalOptions(
        data.map(c => ({ id: c.id, codigo: c.codigo }))
      );
    } catch {
      console.error("No se pudieron cargar comisiones");
    }
  }
  loadComisiones();
  }, []);


  useEffect(() => {
    loadEventos();
  }, [calYear, calMonth]);

  const openAddModal = (fecha) => {
    setDraft({ fecha, comisionId:"", titulo:"" });
    setModalMode("add");
    setIsModalOpen(true);
  };

  const openEditModal = (ev) => {
    setDraft(ev);
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const saveDraft = async () => {
    try {
      await api.post(`/calendario/docente/eventos`, draft);
      setIsModalOpen(false);
      loadEventos();
    } catch {
      alert("Error guardando evento");
    }
  };
  useEffect(() => {
  loadComisiones();
}, []);

  const deleteDraft = async () => {
    try {
      await api.delete(`/calendario/docente/eventos/${draft.id}`);
      setIsModalOpen(false);
      loadEventos();
    } catch {
      alert("Error eliminando.");
    }
  };

  return (
  <div className="preceptor-page">
    <Calendario
      calYear={calYear}
      setCalYear={setCalYear}
      calMonth={calMonth}
      setCalMonth={setCalMonth}
      calAnimKey={calAnimKey}
      setCalAnimKey={setCalAnimKey}
      years={years}
      MESES_ES={MESES_ES}
      DOW_ES={DOW_ES}
      loadingEventos={loadingEventos}
      errEventos={errEventos}
      cells={cells}
      eventosPorDia={eventosPorDia}
      hasComisionesForEvents={hasComisionesForEvents}
      isModalOpen={isModalOpen}
      setIsModalOpen={setIsModalOpen}
      modalMode={modalMode}
      draft={draft}
      setDraft={setDraft}
      comisionesCalOptions={comisionesCalOptions}
      openAddModal={openAddModal}
      handleAddAnother={() => {}}
      deleteDraft={deleteDraft}
      saveDraft={saveDraft}
      openEditModal={openEditModal}
      onVolver={onVolver}
    />
  </div>
);

}
