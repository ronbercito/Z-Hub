/**
 * Archivo: frontend/src/modules/red/components/CoordinatesPicker.jsx
 * Actualización: 2026-09-08 — habilita mapa/satélite y navegación hacia la ubicación del abonado.
 * Función: Selector visual de coordenadas con Google Maps. En modo edición permite mover
 *          el marcador; en modo solo lectura muestra minimapa, datos de ubicación y acceso a navegación.
 */
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../context/AuthContext";
import { MapPin, X, Navigation, Route } from "lucide-react";

const DEFAULT_POSITION = { lat: -8.0679, lng: -78.9859 };

const loadMaps = (apiKey) => new Promise((resolve, reject) => {
  if (window.google?.maps) return resolve(window.google.maps);
  const existing = document.getElementById("google-maps-script");
  if (existing) {
    existing.addEventListener("load", () => resolve(window.google.maps), { once: true });
    existing.addEventListener("error", () => reject(new Error("No se pudo cargar Google Maps.")), { once: true });
    return;
  }
  const script = document.createElement("script");
  script.id = "google-maps-script";
  script.async = true;
  script.defer = true;
  script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&v=weekly`;
  script.onload = () => resolve(window.google.maps);
  script.onerror = () => reject(new Error("No se pudo cargar Google Maps."));
  document.head.appendChild(script);
});

export default function CoordinatesPicker({ title = "Ubicación del equipo", latitude, longitude, address = "", reference = "", onApply, onClose, readOnly = false }) {
  const { API, token } = useAuth();
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [message, setMessage] = useState("Cargando mapa…");
  const initialLat = Number(latitude);
  const initialLng = Number(longitude);
  const initial = Number.isFinite(initialLat) && Number.isFinite(initialLng) && (initialLat !== 0 || initialLng !== 0)
    ? { lat: initialLat, lng: initialLng } : DEFAULT_POSITION;
  const [position, setPosition] = useState(initial);

  const openDirections = () => {
    const destination = `${position.lat},${position.lng}`;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}&travelmode=driving`;
    const isMobile = /Android|iPhone|iPad|iPod|Windows Phone/i.test(navigator.userAgent || "");
    if (isMobile) {
      window.location.href = url;
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  useEffect(() => {
    let cancelled = false;
    const start = async () => {
      try {
        const settings = await axios.get(`${API}/settings`, { headers: { Authorization: `Bearer ${token}` } });
        const key = settings.data?.google_maps_api_key?.trim();
        if (!key) {
          setMessage("Configura la clave de Google Maps en Ajustes → Google.");
          return;
        }
        const maps = await loadMaps(key);
        if (cancelled || !mapRef.current) return;
        const map = new maps.Map(mapRef.current, {
          center: initial,
          zoom: 16,
          mapTypeId: maps.MapTypeId.ROADMAP,
          mapTypeControl: true,
          mapTypeControlOptions: {
            style: maps.MapTypeControlStyle.HORIZONTAL_BAR,
            position: maps.ControlPosition.TOP_RIGHT,
            mapTypeIds: [maps.MapTypeId.ROADMAP, maps.MapTypeId.SATELLITE],
          },
          streetViewControl: false,
          fullscreenControl: !readOnly,
          zoomControl: true,
        });
        const marker = new maps.Marker({ map, position: initial, draggable: !readOnly, title: title });
        markerRef.current = marker;
        if (!readOnly) {
          const setFromPosition = (next) => {
            const point = { lat: next.lat(), lng: next.lng() };
            setPosition(point);
            marker.setPosition(point);
          };
          marker.addListener("dragend", (event) => setFromPosition(event.latLng));
          map.addListener("click", (event) => setFromPosition(event.latLng));
        }
        setMessage("");
      } catch {
        if (!cancelled) setMessage("No se pudo cargar el mapa. Revisa la clave de Google Maps y el dominio autorizado.");
      }
    };
    start();
    return () => { cancelled = true; };
  }, [API, token, readOnly, title]);

  return <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
    <div className={`w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl ${readOnly ? "max-w-3xl" : "max-w-2xl"}`}>
      <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
        <div><h3 className="flex items-center gap-2 font-bold text-slate-100"><MapPin className="h-5 w-5 text-cyan-400" /> {title}</h3><p className="mt-1 text-xs text-slate-500">{readOnly ? "Ubicación registrada del abonado." : "Arrastra el marcador o haz clic en el mapa."}</p></div>
        <button type="button" onClick={onClose} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"><X className="h-5 w-5" /></button>
      </div>

      {readOnly ? (
        <div className="grid grid-cols-1 md:grid-cols-[1.45fr_0.9fr]">
          <div ref={mapRef} className="h-72 w-full bg-slate-950" />
          <div className="border-t border-slate-800 bg-slate-900 p-5 md:border-l md:border-t-0">
            <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-cyan-300">
              <Navigation className="h-4 w-4" /> Datos de ubicación
            </div>
            <div className="space-y-4">
              <div>
                <div className="mb-1 text-[10px] font-semibold uppercase text-slate-500">Dirección</div>
                <div className="text-sm leading-5 text-slate-100">{address || "Sin dirección registrada"}</div>
              </div>
              <div>
                <div className="mb-1 text-[10px] font-semibold uppercase text-slate-500">Referencia</div>
                <div className="text-sm leading-5 text-slate-300">{reference || "Sin referencia registrada"}</div>
              </div>
              <div>
                <div className="mb-1 text-[10px] font-semibold uppercase text-slate-500">Coordenadas</div>
                <div className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 font-mono text-xs text-cyan-300">{position.lat.toFixed(6)}, {position.lng.toFixed(6)}</div>
              </div>
              <button type="button" onClick={openDirections} className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-xs font-bold text-white shadow-lg transition hover:bg-cyan-400">
                <Route className="h-4 w-4" /> Cómo llegar
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div ref={mapRef} className="h-80 w-full bg-slate-950" />
      )}

      {message && <div className="border-t border-slate-800 p-5 text-center text-sm text-slate-400">{message}</div>}
      <div className="flex flex-col items-start justify-between gap-3 border-t border-slate-800 p-4 sm:flex-row sm:items-center">
        {!readOnly && <p className="font-mono text-xs text-cyan-300">{position.lat.toFixed(6)}, {position.lng.toFixed(6)}</p>}
        {readOnly ? (
          <button type="button" onClick={onClose} className="ml-auto rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700">Cerrar</button>
        ) : (
          <div className="ml-auto flex gap-2"><button type="button" onClick={onClose} className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700">Cancelar</button><button type="button" onClick={() => { onApply(position); onClose(); }} className="rounded-xl bg-cyan-500 px-4 py-2 text-xs font-bold text-white hover:bg-cyan-400">Usar estas coordenadas</button></div>
        )}
      </div>
    </div>
  </div>;
}
