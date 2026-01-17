"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

interface HallComponent {
  id: string;
  name: string;
  type: string;
  status: "operational" | "faulty" | "maintenance";
  location: string;
  notes: string;
  hall: { name: string; id: string };
}

export default function ComponentsManagementPage() {
  const { userId } = useAuth();
  const [components, setComponents] = useState<HallComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedComponent, setSelectedComponent] = useState<HallComponent | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newStatus, setNewStatus] = useState<"operational" | "faulty" | "maintenance">("operational");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchComponents();
  }, []);

  const fetchComponents = async () => {
    try {
      const res = await fetch("/api/hall_components");
      if (res.ok) {
        setComponents(await res.json());
      }
    } catch (error) {
      console.error("Error fetching components:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateComponent = async () => {
    if (!selectedComponent) return;

    try {
      const res = await fetch(`/api/hall_components/${selectedComponent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          notes,
        }),
      });

      if (res.ok) {
        await fetchComponents();
        setShowModal(false);
        setSelectedComponent(null);
        setNotes("");
      }
    } catch (error) {
      console.error("Error updating component:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational":
        return "bg-green-100 text-green-800";
      case "faulty":
        return "bg-red-100 text-red-800";
      case "maintenance":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) return <div className="p-8 text-center">Loading components...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8 slide-up">
        <h1 className="heading-1 mb-2">Component Management</h1>
        <p className="text-neutral-600">Monitor and update status of hall components</p>
      </div>

      <div className="grid gap-4">
        {components.length > 0 ? (
          components.map((component, index) => (
            <div
              key={component.id}
              className="card-hover p-6"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="heading-3">{component.name}</h3>
                  <p className="text-neutral-600 text-sm">Hall: {component.hall.name}</p>
                </div>
                <span className={`status-badge ${getStatusColor(component.status)}`}>
                  {component.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <p className="text-neutral-600">Type</p>
                  <p className="font-semibold capitalize">{component.type}</p>
                </div>
                <div>
                  <p className="text-neutral-600">Location</p>
                  <p className="font-semibold">{component.location || "Not specified"}</p>
                </div>
              </div>

              {component.notes && (
                <p className="text-neutral-600 text-sm mb-4 p-3 bg-neutral-50 rounded italic">
                  "{component.notes}"
                </p>
              )}

              <button
                onClick={() => {
                  setSelectedComponent(component);
                  setNewStatus(component.status);
                  setNotes(component.notes);
                  setShowModal(true);
                }}
                className="btn-primary w-full sm:w-auto"
              >
                Update Status
              </button>
            </div>
          ))
        ) : (
          <div className="card p-8 text-center text-neutral-600">
            No components to manage
          </div>
        )}
      </div>

      {showModal && selectedComponent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 scale-in">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-lg slide-up">
            <h2 className="heading-2 mb-4">Update Component Status</h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-700">
                  Component: {selectedComponent.name}
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-700">
                  New Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) =>
                    setNewStatus(e.target.value as "operational" | "faulty" | "maintenance")
                  }
                  className="w-full border border-neutral-300 rounded-lg p-2 focus:outline-none focus:border-primary"
                >
                  <option value="operational">Operational</option>
                  <option value="faulty">Faulty</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-700">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border border-neutral-300 rounded-lg p-2 focus:outline-none focus:border-primary"
                  rows={3}
                  placeholder="Add any notes about this update..."
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateComponent}
                className="btn-primary flex-1"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
