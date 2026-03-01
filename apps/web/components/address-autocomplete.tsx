"use client";

import { useState, useRef, useEffect } from "react";
import { MapPin } from "lucide-react";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

interface Suggestion {
  place_name: string;
  center: [number, number]; // [lng, lat]
  context?: { id: string; text: string }[];
  text: string;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (data: { address: string; city: string; canton: string; latitude: number; longitude: number }) => void;
}

export function AddressAutocomplete({ value, onChange }: AddressAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setQuery(value); }, [value]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const search = (q: string) => {
    setQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.length < 3) { setSuggestions([]); setOpen(false); return; }

    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?access_token=${MAPBOX_TOKEN}&country=ch&language=fr&types=address,place,locality&limit=5`
        );
        const data = await res.json();
        setSuggestions(data.features || []);
        setOpen(true);
      } catch {
        setSuggestions([]);
      }
    }, 300);
  };

  const select = (s: Suggestion) => {
    setQuery(s.place_name);
    setOpen(false);

    // Extract city and canton from context
    let city = "";
    let canton = "";
    if (s.context) {
      for (const ctx of s.context) {
        if (ctx.id.startsWith("place")) city = ctx.text;
        if (ctx.id.startsWith("region")) {
          // Mapbox returns "Canton de Vaud" → extract abbreviation
          const cantonMap: Record<string, string> = {
            "Aargau": "AG", "Argovie": "AG", "Appenzell Innerrhoden": "AI", "Appenzell Rhodes-Intérieures": "AI",
            "Appenzell Ausserrhoden": "AR", "Appenzell Rhodes-Extérieures": "AR", "Bern": "BE", "Berne": "BE",
            "Basel-Landschaft": "BL", "Bâle-Campagne": "BL", "Basel-Stadt": "BS", "Bâle-Ville": "BS",
            "Fribourg": "FR", "Freiburg": "FR", "Genève": "GE", "Geneva": "GE", "Genf": "GE",
            "Glarus": "GL", "Glaris": "GL", "Graubünden": "GR", "Grisons": "GR",
            "Jura": "JU", "Luzern": "LU", "Lucerne": "LU", "Neuchâtel": "NE",
            "Nidwalden": "NW", "Nidwald": "NW", "Obwalden": "OW", "Obwald": "OW",
            "St. Gallen": "SG", "Saint-Gall": "SG", "Schaffhausen": "SH", "Schaffhouse": "SH",
            "Solothurn": "SO", "Soleure": "SO", "Schwyz": "SZ", "Thurgau": "TG", "Thurgovie": "TG",
            "Ticino": "TI", "Tessin": "TI", "Uri": "UR",
            "Vaud": "VD", "Valais": "VS", "Wallis": "VS",
            "Zug": "ZG", "Zoug": "ZG", "Zürich": "ZH", "Zurich": "ZH",
          };
          // Try direct match or "Canton de X" pattern
          const regionText = ctx.text.replace(/^Canton d[eu']?\s*/i, "");
          canton = cantonMap[regionText] || cantonMap[ctx.text] || "";
        }
      }
    }
    if (!city) city = s.text;

    onChange({
      address: s.place_name,
      city,
      canton,
      latitude: s.center[1],
      longitude: s.center[0],
    });
  };

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">Adresse / Localisation *</label>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={e => search(e.target.value)}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          required
          placeholder="Tapez une adresse en Suisse..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-primary focus:border-transparent outline-none transition"
        />
      </div>
      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          {suggestions.map((s, i) => (
            <li key={i} onClick={() => select(s)}
              className="px-4 py-3 hover:bg-green-primary/5 cursor-pointer text-sm text-gray-700 border-b border-gray-50 last:border-0 flex items-start gap-2">
              <MapPin className="w-4 h-4 text-green-primary shrink-0 mt-0.5" />
              <span>{s.place_name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
