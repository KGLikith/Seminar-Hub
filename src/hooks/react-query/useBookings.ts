import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getBookings,
  getMyBookings,
  createBooking,
  approveBooking,
  rejectBooking,
  addBookingSummary,
  getPendingBookingsForHOD,
} from "@/actions/booking"

export const useBookings = (filters?: any) => {
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

export const useCreateBooking = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] })
      queryClient.invalidateQueries({ queryKey: ["myBookings"] })
    },
  })
}

export const useApproveBooking = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ bookingId, hodId }: { bookingId: string; hodId: string }) => approveBooking(bookingId, hodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] })
      queryClient.invalidateQueries({ queryKey: ["pendingBookings"] })
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] })
      queryClient.invalidateQueries({ queryKey: ["pendingBookings"] })
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myBookings"] })
      queryClient.invalidateQueries({ queryKey: ["bookings"] })
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