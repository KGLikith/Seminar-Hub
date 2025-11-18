"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Clock, XCircle, Filter } from 'lucide-react';

interface Booking {
  id: string;
  hall: {
    name: string;
    seating_capacity: number;
    location: string;
  };
  teacher: {
    name: string;
    email: string;
  };
  booking_date: string;
  start_time: string;
  end_time: string;
  purpose: string;
  status: string;
  permission_letter_url: string;
}

export default function HODDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/bookings");
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch (error) {
      console.error("[v0] Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter((b) =>
    filter === "all" ? true : b.status === filter
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-amber-600" />;
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-emerald-50 border-l-4 border-emerald-500";
      case "rejected":
        return "bg-red-50 border-l-4 border-red-500";
      default:
        return "bg-amber-50 border-l-4 border-amber-500";
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-linear-to-r from-slate-200 via-slate-100 to-slate-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Booking Approvals</h1>
        <p className="text-slate-600">Review and manage seminar hall booking requests</p>
      </div>

      {/* Filter Tabs */}
      <div className="mb-8 flex flex-wrap gap-2 animate-fade-in" style={{ animationDelay: "0.1s" }}>
        {["all", "pending", "approved", "rejected"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 capitalize ${
              filter === f
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <Filter className="w-4 h-4" />
            {f} ({bookings.filter((b) => f === "all" || b.status === f).length})
          </button>
        ))}
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.length > 0 ? (
          filteredBookings.map((booking, idx) => (
            <div
              key={booking.id}
              className={`p-6 rounded-lg transition-all duration-300 hover:shadow-lg animate-fade-in ${getStatusStyles(booking.status)}`}
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-4">
                    {getStatusIcon(booking.status)}
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{booking.hall.name}</h3>
                      <p className="text-sm text-slate-600">{booking.hall.location}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Teacher</p>
                      <p className="font-semibold text-slate-900">{booking.teacher.name}</p>
                      <p className="text-xs text-slate-500">{booking.teacher.email}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Date</p>
                      <p className="font-semibold text-slate-900">
                        {new Date(booking.booking_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Time</p>
                      <p className="font-semibold text-slate-900">
                        {new Date(booking.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600 mb-1">Purpose</p>
                      <p className="font-semibold text-slate-900 truncate">{booking.purpose}</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedBooking(booking)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors whitespace-nowrap"
                >
                  Review
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center bg-slate-50 rounded-lg">
            <Clock className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">No {filter === "all" ? "" : filter} bookings found</p>
          </div>
        )}
      </div>
    </div>
  );
}
