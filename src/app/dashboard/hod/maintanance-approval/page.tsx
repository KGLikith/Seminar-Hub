'use client'
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ClipboardCheck, Clock, CheckCircle, XCircle } from "lucide-react";
import { MaintenanceRequest } from "@/generated/client";
import { useAuth } from "@clerk/nextjs";
import { useProfile } from "@/hooks/react-query/useUser";
import { useRouter } from "next/navigation";
import { updateMaintenanceRequestStatus } from "@/actions/booking/maintenance";
import { useGetMaintenanceRequests } from "@/hooks/react-query/useMaintance";

export default function MaintenanceApproval() {
    const { userId: clerkId } = useAuth();
    const { data: profile, isLoading: isLoadingProfile } = useProfile(clerkId || "");
    const { data: requests, refetch, isLoading: isLoadingRequests } = useGetMaintenanceRequests(profile?.id || "");
    const router = useRouter();
    const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);

    useEffect(() => {
        if (profile?.roles && profile.roles[0].role !== "hod") {
            router.push("/dashboard");
        }
    }, [profile]);

    const handleApprove = async (requestId: string) => {
        if (!profile?.id) return;

        const { error } = await updateMaintenanceRequestStatus(
            requestId,
            "approved",
            profile.id,
        )

        if (error) {
            toast.error("Failed to approve request");
            console.error(error);
        } else {
            toast.success("Request approved successfully");
            refetch();
        }
    };

    const handleReject = async () => {
        if (!profile?.id) return;

        if (!selectedRequest || !rejectionReason.trim()) {
            toast.error("Please provide a rejection reason");
            return;
        }

        const { error } = await updateMaintenanceRequestStatus(
            selectedRequest.id,
            "rejected",
            profile.id,
            rejectionReason,
        )

        if (error) {
            toast.error("Failed to reject request");
            console.error(error);
        } else {
            toast.success("Request rejected");
            setIsRejectDialogOpen(false);
            setRejectionReason("");
            setSelectedRequest(null);
            refetch();
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "urgent":
                return "bg-red-500/10 text-red-600 border-red-500/20";
            case "high":
                return "bg-orange-500/10 text-orange-600 border-orange-500/20";
            case "medium":
                return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
            case "low":
                return "bg-green-500/10 text-green-600 border-green-500/20";
            default:
                return "bg-gray-500/10 text-gray-600 border-gray-500/20";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "pending":
                return <Clock className="h-4 w-4" />;
            case "approved":
                return <CheckCircle className="h-4 w-4" />;
            case "rejected":
                return <XCircle className="h-4 w-4" />;
            default:
                return <ClipboardCheck className="h-4 w-4" />;
        }
    };

    if (isLoadingProfile || isLoadingRequests) {
        return (
            <div className="flex items-center justify-center h-64">
                <p>Loading maintenance requests...</p>
            </div>
        );
    }

    const requestList = Array.isArray(requests)
        ? requests
        : Array.isArray((requests as any)?.requests)
            ? (requests as any).requests
            : [];

    const pendingRequests = requestList.filter((r: MaintenanceRequest) => r.status === "pending");
    const processedRequests = requestList.filter((r: MaintenanceRequest) => r.status !== "pending");

    return (
        <>
            <div className="container mx-auto p-6 space-y-6">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Maintenance Requests</h1>
                    <p className="text-muted-foreground">Review and approve maintenance requests from technical staff</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Pending Requests ({pendingRequests.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {pendingRequests.length === 0 ? (
                            <p className="text-muted-foreground text-center py-8">No pending requests</p>
                        ) : (
                            <div className="space-y-4">
                                {pendingRequests.map((request: any, index: number) => (
                                    <motion.div
                                        key={request.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="p-4 border rounded-lg space-y-3"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h3 className="font-semibold">{request.title}</h3>
                                                    <Badge variant="outline" className={getPriorityColor(request.priority)}>
                                                        {request.priority.toUpperCase()}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground mb-2">{request.description}</p>
                                                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                                                    <span>Hall: {request.hall.name}</span>
                                                    <span>•</span>
                                                    <span>Type: {request.request_type.replace(/_/g, " ")}</span>
                                                    <span>•</span>
                                                    <span>By: {request.profile.name}</span>
                                                    <span>•</span>
                                                    <span>{new Date(request.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="sm" onClick={() => handleApprove(request.id)}>
                                                Approve
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => {
                                                    setSelectedRequest(request);
                                                    setIsRejectDialogOpen(true);
                                                }}
                                            >
                                                Reject
                                            </Button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Processed Requests ({processedRequests.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {processedRequests.length === 0 ? (
                            <p className="text-muted-foreground text-center py-8">No processed requests</p>
                        ) : (
                            <div className="space-y-3">
                                {processedRequests.map((request: any) => (
                                    <div key={request.id} className="p-4 border rounded-lg">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    {getStatusIcon(request.status)}
                                                    <h3 className="font-semibold">{request.title}</h3>
                                                    <Badge variant={request.status === "approved" ? "default" : "destructive"}>
                                                        {request.status.toUpperCase()}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground mb-2">{request.description}</p>
                                                {request.rejection_reason && (
                                                    <p className="text-sm text-red-600 mb-2">Reason: {request.rejection_reason}</p>
                                                )}
                                                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                                                    <span>Hall: {request.seminar_halls.name}</span>
                                                    <span>•</span>
                                                    <span>{new Date(request.created_at).toLocaleDateString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Maintenance Request</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Rejection Reason *</label>
                            <Textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Please provide a reason for rejection..."
                                rows={4}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={handleReject} variant="destructive" className="flex-1">
                                Confirm Rejection
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsRejectDialogOpen(false);
                                    setRejectionReason("");
                                    setSelectedRequest(null);
                                }}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}