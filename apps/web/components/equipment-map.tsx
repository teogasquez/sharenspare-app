"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents, useMap } from "react-leaflet";
import L, { type LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import type { EquipmentListDto } from "@/lib/api";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";
const TILE_URL = MAPBOX_TOKEN
  ? `https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`
  : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
const TILE_ATTRIBUTION = MAPBOX_TOKEN
  ? '&copy; <a href="https://www.mapbox.com/">Mapbox</a>'
  : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>';

// Inject global CSS for user location pulse animation (once)
if (typeof window !== "undefined") {
  const styleId = "user-loc-pulse";
  if (!document.getElementById(styleId)) {
    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      @keyframes sns-pulse {
        0% { transform: scale(1); opacity: 1; }
        100% { transform: scale(2.5); opacity: 0; }
      }
      .sns-user-marker { position: relative; width: 28px; height: 28px; }
      .sns-user-marker-pulse { position: absolute; inset: 0; border-radius: 50%; background: rgba(0,97,58,0.25); animation: sns-pulse 2s ease-out infinite; }
      .sns-user-marker-dot { position: absolute; top: 4px; left: 4px; width: 20px; height: 20px; border-radius: 50%; background: #00613a; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.35); }
    `;
    document.head.appendChild(style);
  }
}

// Green pulsing dot for user location (singleton icon)
const userIcon = typeof window !== "undefined" ? new L.DivIcon({
  className: "",
  html: `<div class="sns-user-marker"><div class="sns-user-marker-pulse"></div><div class="sns-user-marker-dot"></div></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
}) : null;

// Custom marker with photo bubble + arrow
function createPhotoIcon(photoUrl?: string | null) {
  const img = photoUrl
    ? `<img src="${photoUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`
    : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:18px;">📦</div>`;

  return new L.DivIcon({
    className: "",
    html: `
      <div style="position:relative;width:48px;height:56px;">
        <div style="width:44px;height:44px;border-radius:50%;border:3px solid #00613a;background:white;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.3);position:absolute;top:0;left:2px;">
          ${img}
        </div>
        <div style="width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;border-top:10px solid #00613a;position:absolute;bottom:0;left:16px;"></div>
      </div>
    `,
    iconSize: [48, 56],
    iconAnchor: [24, 56],
    popupAnchor: [0, -56],
  });
}

interface EquipmentMapProps {
  items: EquipmentListDto[];
  onRadiusSearch?: (lat: number, lng: number, radius: number) => void;
  onClearRadius?: () => void;
  radiusCenter?: { lat: number; lng: number } | null;
  radiusKm?: number;
}

function ClickHandler({ onRadiusSearch, radiusKm }: { onRadiusSearch?: (lat: number, lng: number, radius: number) => void; radiusKm: number }) {
  useMapEvents({
    click(e: L.LeafletMouseEvent) {
      if (onRadiusSearch) {
        onRadiusSearch(e.latlng.lat, e.latlng.lng, radiusKm);
      }
    },
  });
  return null;
}

function FitBounds({ items, radiusCenter }: { items: EquipmentListDto[]; radiusCenter?: { lat: number; lng: number } | null }) {
  const map = useMap();
  useEffect(() => {
    const geoItems = items.filter((i) => i.latitude && i.longitude);
    if (radiusCenter) {
      map.setView([radiusCenter.lat, radiusCenter.lng], 10);
    } else if (geoItems.length > 0) {
      const bounds = L.latLngBounds(geoItems.map((i) => [i.latitude!, i.longitude!] as LatLngExpression));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  }, [items, radiusCenter, map]);
  return null;
}

function UserLocationMarker({ position }: { position: [number, number] }) {
  return (
    <Marker position={position} icon={userIcon!} zIndexOffset={1000}>
      <Popup>
        <span style={{ fontFamily: "system-ui, sans-serif", fontWeight: 600, fontSize: 13 }}>Vous êtes ici</span>
      </Popup>
    </Marker>
  );
}

export function EquipmentMap({ items, onRadiusSearch, onClearRadius, radiusCenter, radiusKm = 20 }: EquipmentMapProps) {
  const geoItems = items.filter((item) => item.latitude && item.longitude);
  const center: LatLngExpression = [46.52, 6.63];
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const geoRequestedRef = useRef(false);

  useEffect(() => {
    if (geoRequestedRef.current) return;
    geoRequestedRef.current = true;

    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (p) => {
        const coords: [number, number] = [p.coords.latitude, p.coords.longitude];
        setUserPos(coords);
        if (onRadiusSearch) {
          onRadiusSearch(coords[0], coords[1], radiusKm);
        }
      },
      () => {},
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 }
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative rounded-xl overflow-hidden border border-gray-200 shadow-md">
      <MapContainer
        center={center}
        zoom={8}
        style={{ height: "400px", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          url={TILE_URL}
          attribution={TILE_ATTRIBUTION}
          {...(MAPBOX_TOKEN ? { tileSize: 512, zoomOffset: -1 } : {})}
        />

        <ClickHandler onRadiusSearch={onRadiusSearch} radiusKm={radiusKm} />
        <FitBounds items={items} radiusCenter={radiusCenter} />
        {userPos && <UserLocationMarker position={userPos} />}

        {geoItems.map((item) => {
          const pos: LatLngExpression = [item.latitude!, item.longitude!];
          return (
            <Marker key={item.id} position={pos} icon={createPhotoIcon(item.primaryPhotoUrl)}>
              <Popup>
                <div style={{ fontFamily: "system-ui, sans-serif", minWidth: 180 }}>
                  {item.primaryPhotoUrl && (
                    <img src={item.primaryPhotoUrl} alt={item.name} style={{ width: "100%", height: 100, objectFit: "cover", borderRadius: 8, marginBottom: 8 }} />
                  )}
                  <a href={`/catalogue/${item.id}`} style={{ fontWeight: 700, fontSize: 14, color: "#00613a", textDecoration: "none" }}>{item.name}</a>
                  <p style={{ color: "#666", fontSize: 12, margin: "4px 0" }}>{item.categoryName} — {item.condition}</p>
                  <p style={{ fontWeight: 700, color: "#00613a", fontSize: 16, margin: "4px 0" }}>{item.dailyPrice} CHF<span style={{ fontWeight: 400, fontSize: 12, color: "#999" }}>/jour</span></p>
                  <p style={{ color: "#999", fontSize: 11 }}>{item.organisationName} — {item.city || ""}{item.canton ? ` (${item.canton})` : ""}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {radiusCenter && (
          <Circle
            center={[radiusCenter.lat, radiusCenter.lng] as LatLngExpression}
            radius={radiusKm * 1000}
            pathOptions={{ color: "#00613a", fillColor: "#00613a", fillOpacity: 0.1, weight: 2, dashArray: "8 4" }}
          />
        )}
      </MapContainer>

      {onRadiusSearch && !radiusCenter && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur text-sm text-gray-600 px-4 py-2 rounded-full shadow z-1000">
          Cliquez sur la carte pour rechercher par périmètre
        </div>
      )}
      {radiusCenter && onClearRadius && (
        <button
          onClick={onClearRadius}
          className="absolute top-4 left-14 bg-white text-sm text-red-500 px-3 py-1.5 rounded-full shadow hover:bg-red-50 transition-colors font-medium z-1000"
        >
          Effacer le périmètre
        </button>
      )}
    </div>
  );
}
