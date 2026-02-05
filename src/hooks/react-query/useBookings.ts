'use client'
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getBookings,
  getMyBookings,
  createBooking,
  approveBooking,
  rejectBooking,
  addBookingSummary,
  getPendingBookingsForHOD,
  BookingFilters,
  getBookingLogs,
  getBookingById,
  getBookingLogsByHall,
} from "@/actions/booking"

export const useBookings = (filters?: BookingFilters) => {
  return useQuery({
    queryKey: ["bookings", filters],
    queryFn: () => getBookings(filters),
  })
}

export const useMyBookings = (userId: string | undefined) => {
  return useQuery({
    queryKey: ["myBookings", userId],
    queryFn: () => (userId ? getMyBookings(userId) : null),
    enabled: !!userId,
  })
}

export const useGetBookingById = (bookingId: string | undefined) => {
  return useQuery({
    queryKey: ["booking", bookingId],
    queryFn: async () => {
      if (!bookingId) return null
      return await getBookingById(bookingId)
    },
    enabled: !!bookingId,
  })
}

export const useCreateBooking = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createBooking,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["bookings"] })
      await queryClient.invalidateQueries({ queryKey: ["myBookings"] })
    },
  })
}

export const useApproveBooking = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ bookingId, hodId }: { bookingId: string; hodId: string }) => approveBooking(bookingId, hodId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["bookings"] })
      await queryClient.invalidateQueries({ queryKey: ["pendingBookings"] })
    },
  })
}

export const useRejectBooking = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      bookingId,
      hodId,
      reason,
    }: {
      bookingId: string
      hodId: string
      reason: string
    }) => rejectBooking(bookingId, hodId, reason),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["bookings"] })
      await queryClient.invalidateQueries({ queryKey: ["pendingBookings"] })
    },
  })
}

export const useAddBookingSummary = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      bookingId,
      summary,
      aiSummary,
    }: {
      bookingId: string
      summary: string
      aiSummary?: any
    }) => addBookingSummary(bookingId, summary, aiSummary),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["myBookings"] })
      await queryClient.invalidateQueries({ queryKey: ["bookings"] })
    },
  })
}

export const usePendingBookingsForHOD = (departmentId: string | undefined) => {
  return useQuery({
    queryKey: ["pendingBookings", departmentId],
    queryFn: () => (departmentId ? getPendingBookingsForHOD(departmentId) : null),
    
    enabled: !!departmentId,
  })
}

export const useBookingLogs = (bookingId: string) => {
  return useQuery({
    queryKey: ["bookingLogs", bookingId],
    queryFn: () => (bookingId ? getBookingLogs(bookingId) : null),
    enabled: !!bookingId,
  })
}

export const useBookingLogsForHall = (hallId: string) => {
  return useQuery({
    queryKey: ["bookingLogsForHall", hallId],
    queryFn: () => (hallId ? getBookingLogsByHall(hallId) : null),
    enabled: !!hallId,
  })
}