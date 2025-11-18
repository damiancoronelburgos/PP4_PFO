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

  const loadEventos = async () => {
    try {
      setLoadingEventos(true);
      const { data } = await api.get(`/calendario/docente/eventos`, {
        params: { year: calYear, month: calMonth + 1 },
      });
      setEventosPorDia(new Map(Object.entries(data)));
      setErrEventos("");
    } catch (e) {
      setErrEventos("No se pudo cargar eventos.");
    } finally {
      setLoadingEventos(false);
    }
  };

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
