import { useQuery } from "@tanstack/react-query"
import { getHalls, getHallById } from "@/actions/halls"

export const useHalls = () => {
  return useQuery({
    queryKey: ["halls"],
    queryFn: () => getHalls(),
  })
}

export const useHall = (id: string | undefined) => {
  return useQuery({
    queryKey: ["hall", id],
    queryFn: () => (id ? getHallById(id) : null),
    enabled: !!id,
  })
}
