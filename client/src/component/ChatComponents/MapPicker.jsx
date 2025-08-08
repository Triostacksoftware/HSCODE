"use client";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Dynamically import Map components to avoid SSR issues
const MapContainer = dynamic(() => import("react-leaflet").then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(m => m.Marker), { ssr: false });
const useMapEvents = dynamic(() => import("react-leaflet").then(m => m.useMapEvents), { ssr: false });

function ClickHandler({ onClick }) {
  const MapEvents = useMapEvents;
  if (!MapEvents) return null;
  // tie clicks to set position
  MapEvents(({ latlng }) => {});
  return null;
}

const MapPicker = ({ isOpen, onClose, onPick, initial }) => {
  const [position, setPosition] = useState(initial || { lat: 20, lng: 78 });

  useEffect(() => {
    if (initial?.lat && initial?.lng) {
      setPosition(initial);
    }
  }, [initial]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-lg w-[95vw] h-[85vh] max-w-5xl overflow-hidden">
        <div className="flex items-center justify-between p-3 border-b">
          <div className="font-medium">Pick location on map</div>
          <button className="text-sm text-gray-600" onClick={onClose}>Close</button>
        </div>
        <div className="w-full h-full">
          {/* Map */}
          <MapContainer center={[position.lat, position.lng]} zoom={5} style={{ height: "calc(85vh - 48px)", width: "100%" }}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {/* Mimic click handler without hooks SSR issues */}
            {typeof window !== "undefined" && (
              <ClickCatcher onSet={(latlng) => setPosition(latlng)} />
            )}
            <Marker position={[position.lat, position.lng]} />
          </MapContainer>
        </div>
        <div className="p-3 border-t flex items-center justify-end text-sm">
          <button
            className="px-3 py-1.5 bg-gray-800 text-white rounded"
            onClick={() => {
              onPick(position);
              onClose();
            }}
          >
            Use this location
          </button>
        </div>
      </div>
    </div>
  );
};

// Separate dynamic element to attach map click events when in client
const ClickCatcher = dynamic(() => Promise.resolve(({ onSet }) => {
  const { useMapEvents } = require("react-leaflet");
  useMapEvents({
    click: (e) => {
      onSet({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}), { ssr: false });

export default MapPicker;

