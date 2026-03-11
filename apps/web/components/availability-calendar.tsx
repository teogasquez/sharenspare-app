"use client";

import { useEffect, useState, useCallback } from "react";
import { blackouts as blackoutsApi, type EquipmentAvailabilityDto, type EquipmentBlackoutDto } from "@/lib/api";
import { ChevronLeft, ChevronRight, X, AlertCircle } from "lucide-react";

interface Props {
  equipmentId: string;
  editable?: boolean;
  /** Reservation mode: called with (start, end) ISO date strings when user picks a range */
  onRangeSelect?: (start: string, end: string) => void;
}

const DAYS_FR = ["Lu", "Ma", "Me", "Je", "Ve", "Sa", "Di"];
const MONTHS_FR = [
  "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
  "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];

function toDateStr(d: Date): string {
  return d.toISOString().split("T")[0];
}

function parseDateStr(s: string): Date {
  return new Date(s + "T00:00:00Z");
}

function isInRange(date: Date, start: string, end: string): boolean {
  const d = date.getTime();
  return d >= parseDateStr(start).getTime() && d < parseDateStr(end).getTime();
}

export function AvailabilityCalendar({ equipmentId, editable = false, onRangeSelect }: Props) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
  });
  const [availability, setAvailability] = useState<EquipmentAvailabilityDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectStart, setSelectStart] = useState<string | null>(null);
  const [selectEnd, setSelectEnd] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const today = new Date();
  const todayStr = toDateStr(today);

  const refresh = useCallback(async () => {
    try {
      const data = await blackoutsApi.getAvailability(equipmentId);
      setAvailability(data);
    } catch {
      setError("Erreur lors du chargement du calendrier.");
    } finally {
      setLoading(false);
    }
  }, [equipmentId]);

  useEffect(() => { refresh(); }, [refresh]);

  const getDateStatus = (dateStr: string): "blackout" | "reserved" | "available" => {
    if (!availability) return "available";
    const d = parseDateStr(dateStr);
    for (const b of availability.blackouts) {
      if (isInRange(d, b.startDate.split("T")[0], b.endDate.split("T")[0])) return "blackout";
    }
    for (const r of availability.reservedPeriods) {
      if (isInRange(d, r.startDate.split("T")[0], r.endDate.split("T")[0])) return "reserved";
    }
    return "available";
  };

  const getBlackoutForDate = (dateStr: string): EquipmentBlackoutDto | null => {
    if (!availability) return null;
    const d = parseDateStr(dateStr);
    for (const b of availability.blackouts) {
      if (isInRange(d, b.startDate.split("T")[0], b.endDate.split("T")[0])) return b;
    }
    return null;
  };

  const isInSelection = (dateStr: string): boolean => {
    if (!selectStart) return false;
    if (!selectEnd) return dateStr === selectStart;
    const d = parseDateStr(dateStr).getTime();
    const s = parseDateStr(selectStart).getTime();
    const e = parseDateStr(selectEnd).getTime();
    return d >= Math.min(s, e) && d <= Math.max(s, e);
  };

  const sortedRange = (): { start: string; end: string } | null => {
    if (!selectStart || !selectEnd) return null;
    const s = parseDateStr(selectStart).getTime();
    const e = parseDateStr(selectEnd).getTime();
    return { start: s <= e ? selectStart : selectEnd, end: s <= e ? selectEnd : selectStart };
  };

  const isReservationMode = !!onRangeSelect && !editable;

  const handleDayClick = (dateStr: string) => {
    const isPast = parseDateStr(dateStr).getTime() < parseDateStr(todayStr).getTime();
    if (isPast) return;

    const status = getDateStatus(dateStr);

    // Editable: click on blackout = delete it
    if (editable && status === "blackout") {
      const b = getBlackoutForDate(dateStr);
      if (b) handleDeleteBlackout(b.id);
      return;
    }

    // Blocked/reserved dates = not selectable
    if (status === "reserved") return;
    if (!editable && status === "blackout") return;

    // Start or reset selection
    if (!selectStart || selectEnd) {
      setSelectStart(dateStr);
      setSelectEnd(null);
      return;
    }

    // Complete selection
    setSelectEnd(dateStr);

    // In reservation mode: immediately notify parent
    if (isReservationMode) {
      const s = parseDateStr(selectStart).getTime();
      const e = parseDateStr(dateStr).getTime();
      onRangeSelect(
        s <= e ? selectStart : dateStr,
        s <= e ? dateStr : selectStart,
      );
    }
  };

  const handleDeleteBlackout = async (blackoutId: string) => {
    try {
      await blackoutsApi.delete(equipmentId, blackoutId);
      await refresh();
    } catch {
      setError("Erreur lors de la suppression.");
    }
  };

  // Block the selected range
  const handleAddBlackout = async () => {
    const range = sortedRange();
    if (!range) return;
    setSubmitting(true);
    setError("");
    try {
      const endDate = new Date(parseDateStr(range.end).getTime() + 86400000);
      await blackoutsApi.create(equipmentId, {
        startDate: range.start,
        endDate: toDateStr(endDate),
        reason: reason || undefined,
      });
      setSelectStart(null); setSelectEnd(null); setReason("");
      await refresh();
    } catch (err: any) {
      setError(err.message || "Erreur lors du blocage.");
    } finally {
      setSubmitting(false);
    }
  };

  // Unblock (remove blackouts that overlap the selection)
  const handleUnblockRange = async () => {
    const range = sortedRange();
    if (!range || !availability) return;
    setSubmitting(true);
    setError("");
    try {
      const rangeStart = parseDateStr(range.start).getTime();
      const rangeEnd = parseDateStr(range.end).getTime() + 86400000;
      const overlapping = availability.blackouts.filter(b => {
        const bStart = parseDateStr(b.startDate.split("T")[0]).getTime();
        const bEnd = parseDateStr(b.endDate.split("T")[0]).getTime();
        return bStart < rangeEnd && bEnd > rangeStart;
      });
      for (const b of overlapping) {
        await blackoutsApi.delete(equipmentId, b.id);
      }
      setSelectStart(null); setSelectEnd(null);
      await refresh();
    } catch (err: any) {
      setError(err.message || "Erreur lors de la libération.");
    } finally {
      setSubmitting(false);
    }
  };

  // Mark as available ONLY during this period — block everything else (12-month horizon)
  const handleAvailableOnly = async () => {
    const range = sortedRange();
    if (!range || !availability) return;
    setSubmitting(true);
    setError("");
    try {
      const endDate = new Date(parseDateStr(range.end).getTime() + 86400000);
      const endDateStr = toDateStr(endDate);
      const horizon = new Date();
      horizon.setFullYear(horizon.getFullYear() + 1);
      const horizonStr = toDateStr(horizon);

      // Delete all existing blackouts first
      for (const b of [...availability.blackouts]) {
        await blackoutsApi.delete(equipmentId, b.id);
      }

      // Block everything BEFORE the range (today → start)
      if (range.start > todayStr) {
        await blackoutsApi.create(equipmentId, { startDate: todayStr, endDate: range.start });
      }

      // Block everything AFTER the range (end+1 → horizon)
      if (endDateStr < horizonStr) {
        await blackoutsApi.create(equipmentId, { startDate: endDateStr, endDate: horizonStr });
      }

      setSelectStart(null); setSelectEnd(null); setReason("");
      await refresh();
    } catch (err: any) {
      setError(err.message || "Erreur.");
    } finally {
      setSubmitting(false);
    }
  };

  // Build month grid
  const year = currentMonth.getUTCFullYear();
  const month = currentMonth.getUTCMonth();
  const firstDay = new Date(Date.UTC(year, month, 1));
  const lastDay = new Date(Date.UTC(year, month + 1, 0));
  let startDow = firstDay.getUTCDay() - 1;
  if (startDow < 0) startDow = 6;

  const days: (Date | null)[] = [];
  for (let i = 0; i < startDow; i++) days.push(null);
  for (let d = 1; d <= lastDay.getUTCDate(); d++) days.push(new Date(Date.UTC(year, month, d)));
  while (days.length % 7 !== 0) days.push(null);

  const range = sortedRange();

  if (loading) {
    return <div className="border border-gray-200 rounded-xl p-4 text-center text-gray-400 text-sm animate-pulse">Chargement du calendrier...</div>;
  }

  return (
    <div className="border border-gray-200 rounded-xl p-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-3">
        <button type="button" onClick={() => setCurrentMonth(new Date(Date.UTC(year, month - 1, 1)))}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        </button>
        <h4 className="text-sm font-semibold text-gray-900">{MONTHS_FR[month]} {year}</h4>
        <button type="button" onClick={() => setCurrentMonth(new Date(Date.UTC(year, month + 1, 1)))}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAYS_FR.map(d => <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>)}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} className="h-9" />;

          const dateStr = toDateStr(day);
          const status = getDateStatus(dateStr);
          const isToday = dateStr === todayStr;
          const inSel = isInSelection(dateStr);
          const isPast = day.getTime() < parseDateStr(todayStr).getTime();
          const clickable = !isPast && status !== "reserved" && (editable || (isReservationMode && status !== "blackout"));

          let cls = "h-9 flex items-center justify-center text-xs rounded-lg transition-colors relative select-none ";

          if (inSel) {
            cls += "bg-green-100 border-2 border-green-primary text-green-primary font-bold ";
          } else if (status === "blackout") {
            cls += "bg-red-100 text-red-700 font-medium ";
            if (editable) cls += "cursor-pointer hover:bg-red-200 ";
          } else if (status === "reserved") {
            cls += "bg-gray-200 text-gray-400 cursor-not-allowed ";
          } else if (isPast) {
            cls += "text-gray-300 cursor-not-allowed ";
          } else {
            cls += "text-gray-700 ";
            if (clickable) cls += "cursor-pointer hover:bg-green-50 hover:text-green-primary ";
          }

          if (isToday && !inSel) cls += "ring-2 ring-green-primary ring-offset-1 ";

          return (
            <button key={dateStr} type="button" disabled={!clickable}
              onClick={() => clickable && handleDayClick(dateStr)}
              className={cls}>
              {day.getUTCDate()}
              {status === "blackout" && editable && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 text-white rounded-full flex items-center justify-center text-[8px]">×</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-3 text-[11px] text-gray-500">
        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-100 border border-red-300 inline-block" /> Indisponible</div>
        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-200 inline-block" /> Réservé</div>
        {(editable || isReservationMode) && (
          <div className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-green-100 border-2 border-green-primary inline-block" /> Sélectionné</div>
        )}
      </div>

      {/* Hint: waiting for 2nd click */}
      {selectStart && !selectEnd && (
        <div className="mt-3 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg p-2">
          {isReservationMode
            ? "Cliquez sur une date de fin pour votre réservation."
            : "Cliquez sur une deuxième date pour définir la fin de la période."}
        </div>
      )}

      {/* Reservation mode: show selection summary */}
      {isReservationMode && selectStart && selectEnd && range && (
        <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-lg text-xs text-green-800 flex items-center justify-between">
          <span>
            Du <strong>{parseDateStr(range.start).toLocaleDateString("fr-CH")}</strong> au <strong>{parseDateStr(range.end).toLocaleDateString("fr-CH")}</strong>
          </span>
          <button type="button" onClick={() => { setSelectStart(null); setSelectEnd(null); }}
            className="text-green-600 hover:text-green-800 ml-2">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Editable: action panel after range selection */}
      {editable && selectStart && selectEnd && range && (
        <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-xs font-semibold text-gray-700 mb-2">
            Période : {parseDateStr(range.start).toLocaleDateString("fr-CH")} → {parseDateStr(range.end).toLocaleDateString("fr-CH")}
          </p>
          <input type="text" value={reason} onChange={e => setReason(e.target.value)}
            placeholder="Raison (optionnel)"
            className="w-full py-1.5 px-3 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary outline-none mb-3" />

          <div className="flex flex-col gap-2">
            <button type="button" onClick={handleAddBlackout} disabled={submitting}
              className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors text-left">
              Bloquer ces dates (indisponible)
            </button>
            <button type="button" onClick={handleUnblockRange} disabled={submitting}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors text-left">
              Libérer ces dates (disponible)
            </button>
            <button type="button" onClick={handleAvailableOnly} disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors text-left">
              Disponible uniquement sur cette période (bloque tout le reste)
            </button>
            <button type="button" onClick={() => { setSelectStart(null); setSelectEnd(null); setReason(""); }}
              className="text-gray-400 hover:text-gray-700 text-xs font-medium text-center py-1 transition-colors">
              Annuler
            </button>
          </div>
          {submitting && <p className="text-xs text-gray-500 mt-2 text-center">En cours...</p>}
        </div>
      )}

      {/* Existing blackouts list */}
      {editable && availability && availability.blackouts.length > 0 && (
        <div className="mt-4">
          <h5 className="text-xs font-semibold text-gray-600 mb-2">Périodes bloquées :</h5>
          <div className="space-y-1.5">
            {availability.blackouts.map(b => (
              <div key={b.id} className="flex items-center justify-between bg-red-50 border border-red-200 rounded-lg px-3 py-1.5 text-xs">
                <span className="text-red-700">
                  {new Date(b.startDate).toLocaleDateString("fr-CH")} — {new Date(b.endDate).toLocaleDateString("fr-CH")}
                  {b.reason && <span className="text-red-500 ml-2">({b.reason})</span>}
                </span>
                <button type="button" onClick={() => handleDeleteBlackout(b.id)}
                  className="text-red-400 hover:text-red-600 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-xs">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />{error}
        </div>
      )}
    </div>
  );
}
