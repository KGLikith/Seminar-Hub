import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { ClipboardList, Wrench, Package } from "lucide-react";
import { useParams } from "next/navigation";
import { useGetComponentMaintenanceLogs, useGetEquipmentLogs } from "@/hooks/react-query/useEquipments";
import { useBookingLogs } from "@/hooks/react-query/useBookings";
import { useHall } from "@/hooks/react-query/useHalls";

export default function HallLogs() {
   const { id } = useParams() as { id: string };
   const { data: hallData, isLoading: hallLoading } = useHall(id || "");
   const { data: maintenanceLogs, isLoading: maintenanceLoading } = useGetComponentMaintenanceLogs(id || "");
   const { data: equipmentLogs, isLoading: equipmentLoading } = useGetEquipmentLogs(id || "");
   const { data: bookingLogs, isLoading: bookingLoading } = useBookingLogs(id || "");

   const getStatusColor = (status: string) => {
      const colors: Record<string, string> = {
         operational: "bg-green-500/10 text-green-600 border-green-500/20",
         maintenance_required: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
         under_maintenance: "bg-blue-500/10 text-blue-600 border-blue-500/20",
         non_operational: "bg-red-500/10 text-red-600 border-red-500/20",
         active: "bg-green-500/10 text-green-600 border-green-500/20",
         not_working: "bg-red-500/10 text-red-600 border-red-500/20",
         under_repair: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
      };
      return colors[status] || "bg-gray-500/10 text-gray-600 border-gray-500/20";
   };

   if (hallLoading || maintenanceLoading || equipmentLoading || bookingLoading) {
      return (
         <div className="flex items-center justify-center h-64">
            <p>Loading logs...</p>
         </div>
      );
   }

   if (!hallData) {
      return (
         <div className="flex items-center justify-center h-64">
            <p>Hall not found</p>
         </div>
      );
   }

   return (
      <>
         <div className="container mx-auto p-6 space-y-6">
            <div>
               <h1 className="text-3xl font-bold mb-2">{hallData.name} - Activity Logs</h1>
               <p className="text-muted-foreground">{hallData.department.name}</p>
            </div>

            <Tabs defaultValue="maintenance" className="w-full">
               <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="maintenance">
                     <Wrench className="h-4 w-4 mr-2" />
                     Maintenance
                  </TabsTrigger>
                  <TabsTrigger value="equipment">
                     <Package className="h-4 w-4 mr-2" />
                     Equipment
                  </TabsTrigger>
                  <TabsTrigger value="booking">
                     <ClipboardList className="h-4 w-4 mr-2" />
                     Bookings
                  </TabsTrigger>
               </TabsList>

               <TabsContent value="maintenance">
                  <Card>
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
                                    transition={{ delay: index * 0.05 }}
                                    className="p-4 border rounded-lg"
                                 >
                                    <div className="flex items-start justify-between mb-2">
                                       <div>
                                          <h4 className="font-medium">{log.component?.name}</h4>
                                          {/* <p className="text-sm text-muted-foreground">{log.}</p> */}
                                       </div>
                                       <span className="text-xs text-muted-foreground">
                                          {new Date(log.created_at).toLocaleString()}
                                       </span>
                                    </div>
                                    <div className="flex gap-2 items-center">
                                       <Badge variant="outline" className={getStatusColor(log.previous_status)}>
                                          {log.previous_status.replace(/_/g, " ")}
                                       </Badge>
                                       <span className="text-muted-foreground">→</span>
                                       <Badge variant="outline" className={getStatusColor(log.new_status)}>
                                          {log.new_status.replace(/_/g, " ")}
                                       </Badge>
                                    </div>
                                    {log.notes && <p className="text-sm text-muted-foreground mt-2">{log.notes}</p>}
                                    <p className="text-xs text-muted-foreground mt-2">By: {log.performed_by}</p>
                                 </motion.div>
                              ))}
                           </div>
                        )}
                     </CardContent>
                  </Card>
               </TabsContent>

               <TabsContent value="equipment">
                  <Card>
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
                                    transition={{ delay: index * 0.05 }}
                                    className="p-4 border rounded-lg"
                                 >
                                    <div className="flex items-start justify-between mb-2">
                                       <div>
                                          <h4 className="font-medium">{log.equipment?.name}</h4>
                                          <p className="text-sm text-muted-foreground">{log.equipment?.type}</p>
                                       </div>
                                       <span className="text-xs text-muted-foreground">
                                          {new Date(log.created_at).toLocaleString()}
                                       </span>
                                    </div>
                                    <div className="flex gap-2 items-center">
                                       <Badge variant="outline" className={getStatusColor(log.previous_condition)}>
                                          {log.previous_condition.replace(/_/g, " ")}
                                       </Badge>
                                       <span className="text-muted-foreground">→</span>
                                       <Badge variant="outline" className={getStatusColor(log.new_condition)}>
                                          {log.new_condition.replace(/_/g, " ")}
                                       </Badge>
                                    </div>
                                    {log.notes && <p className="text-sm text-muted-foreground mt-2">{log.notes}</p>}
                                    <p className="text-xs text-muted-foreground mt-2">By: {log.updated_by}</p>
                                 </motion.div>
                              ))}
                           </div>
                        )}
                     </CardContent>
                  </Card>
               </TabsContent>

               <TabsContent value="booking">
                  <Card>
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
                                    transition={{ delay: index * 0.05 }}
                                    className="p-4 border rounded-lg"
                                 >
                                    <div className="flex items-start justify-between mb-2">
                                       <div>
                                          <h4 className="font-medium">{log.action}</h4>
                                          <span className="text-xs text-muted-foreground">
                                             {new Date(log.created_at).toLocaleString()}
                                          </span>
                                       </div>
                                    </div>
                                    {log.previous_status && log.new_status && (
                                       <div className="flex gap-2 items-center mb-2">
                                          <Badge variant="outline">{log.previous_status}</Badge>
                                          <span className="text-muted-foreground">→</span>
                                          <Badge variant="outline">{log.new_status}</Badge>
                                       </div>
                                    )}
                                    {log.notes && <p className="text-sm text-muted-foreground">{log.notes}</p>}
                                    {log.performed_by && (
                                       <p className="text-xs text-muted-foreground mt-2">By: {log.performed_by}</p>
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
   );
}