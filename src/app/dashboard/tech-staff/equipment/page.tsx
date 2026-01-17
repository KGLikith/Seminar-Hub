"use client";

import { useEffect, useState } from "react";
import { Wrench, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

interface Equipment {
  id: string;
  name: string;
  type: string;
  serial_number?: string;
  condition: "active" | "not_working" | "under_repair";
  last_updated_at: string;
  hall: { name: string };
}

export default function EquipmentManagement() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEquipment();
  }, []);

  const fetchEquipment = async () => {
    try {
      const res = await fetch("/api/equipment");
      if (res.ok) {
        setEquipment(await res.json());
      }
    } catch (error) {
      console.error("[v0] Error fetching equipment:", error);
    } finally {
      setLoading(false);
    }
  };

  const getConditionIcon = (condition: string) => {
    switch (condition) {
      case "active":
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case "not_working":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case "under_repair":
        return <Clock className="w-5 h-5 text-amber-600" />;
      default:
        return <Wrench className="w-5 h-5 text-slate-600" />;
    }
  };

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case "active":
        return "bg-emerald-100 text-emerald-800";
      case "not_working":
        return "bg-red-100 text-red-800";
      case "under_repair":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-slate-100 text-slate-800";
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-linear-to-r from-slate-200 via-slate-100 to-slate-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Equipment Management</h1>
        <p className="text-slate-600">Monitor and update equipment status across all halls</p>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-full">
          {equipment.length > 0 ? (
            <div className="space-y-4">
              {equipment.map((eq, idx) => (
                <div
                  key={eq.id}
                  className="bg-white border border-slate-200 rounded-lg p-4 md:p-6 hover:shadow-lg transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        {getConditionIcon(eq.condition)}
                        <div>
                          <h3 className="font-bold text-slate-900">{eq.name}</h3>
                          <p className="text-sm text-slate-600">{eq.type}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
                      <div>
                        <p className="text-xs text-slate-600">Hall</p>
                        <p className="font-semibold text-slate-900 truncate">{eq.hall.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">Serial</p>
                        <p className="font-semibold text-slate-900">{eq.serial_number || "-"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600">Last Updated</p>
                        <p className="font-semibold text-slate-900">
                          {new Date(eq.last_updated_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getConditionColor(eq.condition)}`}>
                          {eq.condition.replace("_", " ")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-slate-50 rounded-lg">
              <Wrench className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">No equipment assigned</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
