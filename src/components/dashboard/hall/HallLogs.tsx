"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { ClipboardList, Wrench, Package, ArrowRight } from "lucide-react"
import { useParams } from "next/navigation"
import { useGetComponentMaintenanceLogs, useGetEquipmentLogs } from "@/hooks/react-query/useEquipments"
import { useBookingLogs } from "@/hooks/react-query/useBookings"
import { useHall } from "@/hooks/react-query/useHalls"

export default function HallLogs() {
  const { id } = useParams() as { id: string }
  const { data: hallData, isLoading: hallLoading } = useHall(id || "")
  const { data: maintenanceLogs, isLoading: maintenanceLoading } = useGetComponentMaintenanceLogs(id || "")
  const { data: equipmentLogs, isLoading: equipmentLoading } = useGetEquipmentLogs(id || "")
  const { data: bookingLogs, isLoading: bookingLoading } = useBookingLogs(id || "")

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      operational: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
      maintenance_required: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30",
      under_maintenance: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30",
      non_operational: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30",
      active: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
      not_working: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30",
      under_repair: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30",
    }
    return colors[status] || "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/30"
  }

  if (hallLoading || maintenanceLoading || equipmentLoading || bookingLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading logs...</p>
      </div>
    )
  }

  if (!hallData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Hall not found</p>
      </div>
    )
  }

  return (
    <>
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{hallData.name} - Activity Logs</h1>
          <p className="text-muted-foreground">{hallData.department.name}</p>
        </div>

        <Tabs defaultValue="maintenance" className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-auto">
            <TabsTrigger value="maintenance" className="gap-2">
              <Wrench className="h-4 w-4" />
              <span className="hidden sm:inline">Maintenance</span>
            </TabsTrigger>
            <TabsTrigger value="equipment" className="gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Equipment</span>
            </TabsTrigger>
            <TabsTrigger value="booking" className="gap-2">
              <ClipboardList className="h-4 w-4" />
              <span className="hidden sm:inline">Bookings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="maintenance">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Component Maintenance History</CardTitle>
              </CardHeader>
              <CardContent>
                {maintenanceLogs?.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No maintenance logs</p>
                ) : (
                  <div className="space-y-3">
                    {maintenanceLogs?.map((log, index) => (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="p-4 border rounded-xl hover:border-primary/40 hover:shadow-md transition-all duration-200 bg-card"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-base mb-1">{log.component?.name}</h4>
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="outline" className={`${getStatusColor(log.previous_status)} font-medium`}>
                                {log.previous_status.replace(/_/g, " ")}
                              </Badge>
                              <ArrowRight className="h-3 w-3 text-muted-foreground" />
                              <Badge variant="outline" className={`${getStatusColor(log.new_status)} font-medium`}>
                                {log.new_status.replace(/_/g, " ")}
                              </Badge>
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground shrink-0">
                            {new Date(log.created_at).toLocaleString()}
                          </span>
                        </div>
                        {log.notes && (
                          <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg mb-2">{log.notes}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium">Performed by:</span> {log.performed_by}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="equipment">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Equipment Update History</CardTitle>
              </CardHeader>
              <CardContent>
                {equipmentLogs?.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No equipment logs</p>
                ) : (
                  <div className="space-y-3">
                    {equipmentLogs?.map((log, index) => (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="p-4 border rounded-xl hover:border-primary/40 hover:shadow-md transition-all duration-200 bg-card"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-base mb-1">{log.equipment?.name}</h4>
                            <p className="text-sm text-muted-foreground mb-2">{log.equipment?.type}</p>
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge
                                variant="outline"
                                className={`${getStatusColor(log.previous_condition)} font-medium`}
                              >
                                {log.previous_condition.replace(/_/g, " ")}
                              </Badge>
                              <ArrowRight className="h-3 w-3 text-muted-foreground" />
                              <Badge variant="outline" className={`${getStatusColor(log.new_condition)} font-medium`}>
                                {log.new_condition.replace(/_/g, " ")}
                              </Badge>
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground shrink-0">
                            {new Date(log.created_at).toLocaleString()}
                          </span>
                        </div>
                        {log.notes && (
                          <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg mb-2">{log.notes}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium">Updated by:</span> {log.updated_by}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="booking">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Booking Activity History</CardTitle>
              </CardHeader>
              <CardContent>
                {bookingLogs?.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No booking logs</p>
                ) : (
                  <div className="space-y-3">
                    {bookingLogs?.map((log, index) => (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="p-4 border rounded-xl hover:border-primary/40 hover:shadow-md transition-all duration-200 bg-card"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-base mb-2">{log.action}</h4>
                            {log.previous_status && log.new_status && (
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <Badge variant="outline" className="font-medium">
                                  {log.previous_status}
                                </Badge>
                                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                <Badge variant="outline" className="font-medium">
                                  {log.new_status}
                                </Badge>
                              </div>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground shrink-0">
                            {new Date(log.created_at).toLocaleString()}
                          </span>
                        </div>
                        {log.notes && (
                          <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg mb-2">{log.notes}</p>
                        )}
                        {log.performed_by && (
                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium">Performed by:</span> {log.performed_by}
                          </p>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
