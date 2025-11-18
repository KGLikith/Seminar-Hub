"use client";

import { useEffect, useState } from "react";
import { MapPin, Calendar, Clock, Users, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

interface Booking {
  id: string;
  hall: { name: string; location: string; seating_capacity: number };
  booking_date: string;
  start_time: string;
  end_time: string;
  purpose: string;
  status: string;
  rejection_reason?: string;
}

export default function MyBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch("/api/bookings");
        if (res.ok) {
          setBookings(await res.json());
        }
      } catch (error) {
        console.error("[v0] Error fetching bookings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 className="w-6 h-6 text-emerald-600" />;
      case "rejected":
        return <XCircle className="w-6 h-6 text-red-600" />;
      default:
        return <Clock className="w-6 h-6 text-amber-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-emerald-100 text-emerald-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-amber-100 text-amber-800";
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-linear-to-r from-slate-200 via-slate-100 to-slate-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">My Bookings</h1>
        <p className="text-slate-600">Track the status of all your seminar hall booking requests</p>
      </div>

      {/* Bookings Grid */}
      <div className="space-y-4">
        {bookings.length > 0 ? (
          bookings.map((booking, idx) => (
            <div
              key={booking.id}
              className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-lg transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{booking.hall.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-slate-600 mt-1">
                    <MapPin className="w-4 h-4" />
                    {booking.hall.location}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(booking.status)}
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(booking.status)}`}>
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-600">Date</p>
                    <p className="font-semibold text-slate-900">
                      {new Date(booking.booking_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-600">Start Time</p>
                    <p className="font-semibold text-slate-900">
                      {new Date(booking.start_time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Purpose</p>
                  <p className="font-semibold text-slate-900 truncate">{booking.purpose}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-600">Capacity</p>
                    <p className="font-semibold text-slate-900">{booking.hall.seating_capacity}</p>
                  </div>
                </div>
              </div>

              {booking.rejection_reason && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-red-900">Rejection Reason</p>
                    <p className="text-sm text-red-700">{booking.rejection_reason}</p>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="p-12 text-center bg-slate-50 rounded-lg">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 mb-4">No bookings yet</p>
            <a href="/dashboard/teacher" className="text-blue-600 font-medium hover:underline">
              Create your first booking
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
