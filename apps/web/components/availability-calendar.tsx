"use client";

import { useEffect, useState, useCallback } from "react";
import { blackouts as blackoutsApi, type EquipmentAvailabilityDto, type EquipmentBlackoutDto } from "@/lib/api";
import { ChevronLeft, ChevronRight, X, AlertCircle } from "lucide-react";

interface Props {
  equipmentId: string;
  editable?: boolean;
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

function isSameDay(a: Date, b: Date): boolean {
  return a.getUTCFullYear() === b.getUTCFullYear() && a.getUTCMonth() === b.getUTCMonth() && a.getUTCDate() === b.getUTCDate();
}

function isInRange(date: Date, start: string, end: string): boolean {
  const d = date.getTime();
  return d >= parseDateStr(start).getTime() && d < parseDateStr(end).getTime();
}

export function AvailabilityCalendar({ equipmentId, editable = false }: Props) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
  });
  const [availability, setAvailability] = useState<EquipmentAvailabilityDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Selection state for creating blackouts
  const [selectStart, setSelectStart] = useState<string | null>(null);
  const [selectEnd, setSelectEnd] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
    const min = Math.min(s, e);
    const max = Math.max(s, e);
    return d >= min && d <= max;
  };

  const handleDayClick = (dateStr: string) => {
    if (!editable) return;
    const status = getDateStatus(dateStr);
    if (status === "reserved") return;

    // If clicking a blackout date, delete it
    if (status === "blackout") {
      const b = getBlackoutForDate(dateStr);
      if (b) handleDeleteBlackout(b.id);
      return;
    }

    if (!selectStart || selectEnd) {
      // Start new selection
      setSelectStart(dateStr);
      setSelectEnd(null);
    } else {
      // Complete selection
      setSelectEnd(dateStr);
    }
  };

  const handleAddBlackout = async () => {
    if (!selectStart || !selectEnd) return;
    setSubmitting(true);
    setError("");
    try {
      const s = parseDateStr(selectStart).getTime();
      const e = parseDateStr(selectEnd).getTime();
      const start = s <= e ? selectStart : selectEnd;
      const end = s <= e ? selectEnd : selectStart;
      // Add one day to end to make it inclusive
      const endDate = new Date(parseDateStr(end).getTime() + 86400000);

      await blackoutsApi.create(equipmentId, {
        startDate: start,
        endDate: toDateStr(endDate),
        reason: reason || undefined,
      });
      setSelectStart(null);
      setSelectEnd(null);
      setReason("");
      await refresh();
    } catch (err: any) {
      setError(err.message || "Erreur lors de la création.");
    } finally {
      setSubmitting(false);
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

  // Build month grid
  const year = currentMonth.getUTCFullYear();
  const month = currentMonth.getUTCMonth();
  const firstDay = new Date(Date.UTC(year, month, 1));
  const lastDay = new Date(Date.UTC(year, month + 1, 0));

  // Monday = 0, Sunday = 6
  let startDow = firstDay.getUTCDay() - 1;
  if (startDow < 0) startDow = 6;

  const days: (Date | null)[] = [];
  for (let i = 0; i < startDow; i++) days.push(null);
  for (let d = 1; d <= lastDay.getUTCDate(); d++) {
    days.push(new Date(Date.UTC(year, month, d)));
  }
  // Pad to complete last week
  while (days.length % 7 !== 0) days.push(null);

  const today = new Date();
  const todayStr = toDateStr(today);

  const prevMonth = () => setCurrentMonth(new Date(Date.UTC(year, month - 1, 1)));
  const nextMonth = () => setCurrentMonth(new Date(Date.UTC(year, month + 1, 1)));

  if (loading) {
    return <div className="border border-gray-200 rounded-xl p-4 text-center text-gray-400 text-sm">Chargement du calendrier...</div>;
  }

  return (
    <div className="border border-gray-200 rounded-xl p-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button type="button" onClick={prevMonth} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        </button>
        <h4 className="text-sm font-semibold text-gray-900">
          {MONTHS_FR[month]} {year}
        </h4>
        <button type="button" onClick={nextMonth} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
          <ChevronRight className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAYS_FR.map(d => (
          <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          if (!day) return <div key={`empty-${i}`} className="h-9" />;

          const dateStr = toDateStr(day);
          const status = getDateStatus(dateStr);
          const isToday = dateStr === todayStr;
          const inSelection = isInSelection(dateStr);
          const isPast = day.getTime() < parseDateStr(todayStr).getTime();

          let cellClass = "h-9 flex items-center justify-center text-xs rounded-lg transition-colors relative ";

          if (inSelection) {
            cellClass += "bg-green-100 border-2 border-green-primary text-green-primary font-bold ";
          } else if (status === "blackout") {
            cellClass += "bg-red-100 text-red-700 font-medium ";
            if (editable) cellClass += "cursor-pointer hover:bg-red-200 ";
          } else if (status === "reserved") {
            cellClass += "bg-gray-200 text-gray-400 cursor-not-allowed ";
          } else if (isPast) {
            cellClass += "text-gray-300 ";
          } else {
            cellClass += "text-gray-700 ";
            if (editable) cellClass += "cursor-pointer hover:bg-green-50 ";
          }

          if (isToday) cellClass += "ring-2 ring-green-primary ring-offset-1 ";

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => !isPast && handleDayClick(dateStr)}
              disabled={isPast && status === "available"}
              className={cellClass}
            >
              {day.getUTCDate()}
              {status === "blackout" && editable && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 text-white rounded-full flex items-center justify-center text-[8px] leading-none">
                  ×
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-4 mt-3 text-[11px] text-gray-500">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-red-100 border border-red-300 inline-block" /> Indisponible
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-gray-200 inline-block" /> Réservé
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-white border border-gray-300 inline-block" /> Disponible
        </div>
      </div>

      {/* Selection form */}
      {editable && selectStart && selectEnd && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800 font-medium mb-2">
            Bloquer du {parseDateStr(selectStart < selectEnd ? selectStart : selectEnd).toLocaleDateString("fr-CH")} au {parseDateStr(selectStart < selectEnd ? selectEnd : selectStart).toLocaleDateString("fr-CH")}
          </p>
          <input
            type="text"
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Raison (optionnel)"
            className="w-full py-2 px-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent outline-none mb-2"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleAddBlackout}
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-medium px-4 py-1.5 rounded-full transition-colors disabled:opacity-50"
            >
              {submitting ? "..." : "Confirmer le blocage"}
            </button>
            <button
              type="button"
              onClick={() => { setSelectStart(null); setSelectEnd(null); setReason(""); }}
              className="text-gray-500 hover:text-gray-700 text-xs font-medium px-3 py-1.5 transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {editable && selectStart && !selectEnd && (
        <div className="mt-3 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg p-2">
          Cliquez sur une deuxième date pour définir la fin de la période.
        </div>
      )}

      {/* Existing blackouts list (editable mode) */}
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
                <button
                  type="button"
                  onClick={() => handleDeleteBlackout(b.id)}
                  className="text-red-400 hover:text-red-600 transition-colors p-0.5"
                >
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
