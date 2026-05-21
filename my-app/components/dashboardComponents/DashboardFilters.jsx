"use client"

import { useEffect, useState } from "react";
import { storeService } from "@/services/storeService";

const PERIODES = [
  { label: "Tout", value: "" },
  { label: "Janvier 2025", value: "2025-01" },
  { label: "Février 2025", value: "2025-02" },
  { label: "Mars 2025", value: "2025-03" },
  { label: "Avril 2025", value: "2025-04" },
  { label: "Mai 2025", value: "2025-05" },
];

export default function DashboardFilters() {
  const [regions, setRegions] = useState([]);
  const [stores, setStores] = useState([]);
  const [filters, setFilters] = useState({ periode: "", region: "", storeId: "" });

  useEffect(() => {
    storeService.getRegions().then((res) => setRegions(res.data));
    storeService.getActive().then((res) => setStores(res.data));
  }, []);

  useEffect(() => {
    if (filters.region) {
      storeService.getByRegion(filters.region).then((res) => setStores(res.data));
    } else {
      storeService.getActive().then((res) => setStores(res.data));
    }
  }, [filters.region]);

  const handleChange = (key, value) => {
    const updated = { ...filters, [key]: value };
    if (key === "region") updated.storeId = "";
    setFilters(updated);
  };

  return (
    <div className="grid grid-cols-3 gap-3">
      {/* Période */}
      <div className="border-2 border-red-500 rounded-md px-3.5 py-2.5 bg-white dark:bg-zinc-900">
        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">
          Période : Jan-Mai 2025
        </label>
        <select
          value={filters.periode}
          onChange={(e) => handleChange("periode", e.target.value)}
          className="w-full text-sm text-gray-800 dark:text-gray-100 bg-white dark:bg-zinc-900 border-none outline-none cursor-pointer"
        >
          {PERIODES.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>

      {/* Région */}
      <div className="border-2 border-red-500 rounded-md px-3.5 py-2.5 bg-white dark:bg-zinc-900">
        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">
          Région
        </label>
        <select
          value={filters.region}
          onChange={(e) => handleChange("region", e.target.value)}
          className="w-full text-sm text-gray-800 dark:text-gray-100 bg-white dark:bg-zinc-900 border-none outline-none cursor-pointer"
        >
          <option value="">Tout</option>
          {regions.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      {/* Magasin */}
      <div className="border-2 border-red-500 rounded-md px-3.5 py-2.5 bg-white dark:bg-zinc-900">
        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">
          Magasin
        </label>
        <select
          value={filters.storeId}
          onChange={(e) => handleChange("storeId", e.target.value)}
          className="w-full text-sm text-gray-800 dark:text-gray-100 bg-white dark:bg-zinc-900 border-none outline-none cursor-pointer"
        >
          <option value="">Tout</option>
          {stores.map((s) => (
            <option key={s.id} value={s.id}>{s.nom}</option>
          ))}
        </select>
      </div>
    </div>
  );
}