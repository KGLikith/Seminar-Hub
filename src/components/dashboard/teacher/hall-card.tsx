"use client";

import Image from "next/image";
import { MapPin, Users, BookOpen } from 'lucide-react';

interface Hall {
  id: string;
  name: string;
  location: string;
  seating_capacity: number;
  image_url?: string;
  status: string;
  equipment: any[];
}

interface HallCardProps {
  hall: Hall;
  onBook: (hall: Hall) => void;
}

export default function HallCard({ hall, onBook }: HallCardProps) {
  const isAvailable = hall.status === "available";

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full fade-in">
      <div className="relative h-48 bg-linear-to-br from-blue-100 to-indigo-100 overflow-hidden">
        {hall.image_url ? (
          <Image
            src={hall.image_url || "/placeholder.svg"}
            alt={hall.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <BookOpen className="w-12 h-12 text-blue-300" />
          </div>
        )}
        <div className="absolute top-3 right-3">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
            isAvailable 
              ? 'bg-emerald-100 text-emerald-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {isAvailable ? 'Available' : 'Unavailable'}
          </span>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-2">{hall.name}</h3>
        
        <div className="space-y-3 mb-6 flex-1">
          <div className="flex items-center gap-2 text-slate-600">
            <MapPin className="w-4 h-4 shrink-0 text-blue-600" />
            <span className="text-sm">{hall.location}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Users className="w-4 h-4 shrink-0 text-blue-600" />
            <span className="text-sm">Capacity: {hall.seating_capacity} seats</span>
          </div>
        </div>

        <button
          onClick={() => onBook(hall)}
          disabled={!isAvailable}
          className={`w-full py-2 px-4 rounded-lg font-semibold transition-colors ${
            isAvailable
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-slate-200 text-slate-500 cursor-not-allowed'
          }`}
        >
          {isAvailable ? 'Book Now' : 'Not Available'}
        </button>
      </div>
    </div>
  );
}
