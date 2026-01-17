"use client";

import { useEffect, useState } from "react";

interface ScheduledEvent {
  id: string;
  hall: { name: string };
  booking_date: string;
  start_time: string;
  end_time: string;
  purpose: string;
  teacher: { name: string };
  status: string;
}

export default function TechStaffDashboard() {
  const [events, setEvents] = useState<ScheduledEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch("/api/bookings");
        if (res.ok) {
          const bookings = await res.json();
          const approved = bookings.filter((b: any) => b.status === "approved");
          setEvents(approved);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) return <div className="p-8">Loading schedule...</div>;

  const sortedEvents = events.sort(
    (a, b) =>
      new Date(a.booking_date).getTime() - new Date(b.booking_date).getTime()
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="heading-2 mb-2">Hall Schedule</h1>
        <p className="text-neutral-600">View and manage hall bookings and events</p>
      </div>

      <div className="space-y-4">
        {sortedEvents.length > 0 ? (
          sortedEvents.map((event) => (
            <div key={event.id} className="card p-6 border-l-4 border-primary">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="heading-3">{event.hall.name}</h3>
                  <p className="text-neutral-600 text-sm">
                    {event.teacher.name} - {event.purpose}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  event.status === "approved"
                    ? "bg-green-100 text-green-800"
                    : "bg-blue-100 text-blue-800"
                }`}>
                  {event.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-neutral-600 text-sm">Date</p>
                  <p className="font-semibold">
                    {new Date(event.booking_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-neutral-600 text-sm">Start Time</p>
                  <p className="font-semibold">
                    {new Date(event.start_time).toLocaleTimeString()}
                  </p>
                </div>
                <div>
                  <p className="text-neutral-600 text-sm">End Time</p>
                  <p className="font-semibold">
                    {new Date(event.end_time).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="card p-8 text-center text-neutral-600">
            No scheduled events
          </div>
        )}
      </div>
    </div>
  );
}
