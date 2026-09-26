import { useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";
import { listAppointments, localDateKey, occursOn } from "@/lib/diary-cloud";
import { hasCloudSession, listPatients } from "@/lib/session-board-cloud";

// The clients scheduled in the calendar for the board's date, above the session board.
// A tap opens that client's board for the same date. Hidden when nothing is scheduled.
export function BoardDayAppointments({ boardDate, patientBoardId, language, onOpen }) {
  const t = (he, en) => (language === "en" ? en : he);
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (!hasCloudSession()) return undefined;
    let cancelled = false;
    Promise.all([listAppointments(), listPatients()])
      .then(([appointments, patients]) => {
        if (cancelled) return;
        const names = new Map((patients || []).map((patient) => [patient.id, patient.display_name]));
        setRows((appointments || [])
          .filter((appointment) => occursOn(appointment, boardDate) && names.has(appointment.patient_id))
          .sort((a, b) => (a.start_time || "99").localeCompare(b.start_time || "99"))
          .map((appointment) => ({ id: appointment.id, patientId: appointment.patient_id, time: appointment.start_time, name: names.get(appointment.patient_id) })));
      })
      .catch(() => { if (!cancelled) setRows([]); });
    return () => { cancelled = true; };
  }, [boardDate]);

  if (!rows.length) return null;
  const [y, m, d] = boardDate.split("-");
  const label = boardDate === localDateKey(new Date()) ? t("היום ביומן", "Today in the calendar") : t(`ביומן ב-${Number(d)}.${Number(m)}`, `Calendar on ${Number(m)}/${Number(d)}`);

  return (
    <nav className="board-day-appointments" aria-label={label}>
      <span className="board-day-label"><CalendarDays aria-hidden="true" />{label}</span>
      {rows.map((row) => (
        <button key={row.id} type="button" onClick={() => onOpen(row.patientId)} aria-current={row.patientId === patientBoardId ? "true" : undefined}
          className={row.patientId === patientBoardId ? "board-day-chip current" : "board-day-chip"}>
          {row.time && <span className="board-day-time">{row.time}</span>}
          <span>{row.name}</span>
        </button>
      ))}
    </nav>
  );
}
