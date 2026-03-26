import React from "react";
import { Briefcase, Info, CheckCircle2, Clock, XCircle, ChevronRight } from "lucide-react";

const PlacementDetails = ({ student }) => {
    const semesters = student.semesters || [];
    const placementData = student.placementData || [];
    const currentSemesterNumber = semesters.length;

    if (currentSemesterNumber < 6) {
        return (
            <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Briefcase className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-display text-lg font-bold text-foreground">Placement History</h3>
                </div>
                <div className="flex flex-col items-center justify-center py-8 text-center bg-muted/30 rounded-lg border border-dashed border-border">
                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                        <Info className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-foreground">No placement history available</p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-[250px]">
                        Placement activities typically begin from the 6th semester onwards. Stay focused on your core academics!
                    </p>
                </div>
            </div>
        );
    }

    const getStatusStyles = (status) => {
        switch (status) {
            case "Selected":
                return "bg-success/10 text-success border-success/20";
            case "Rejected":
                return "bg-destructive/10 text-destructive border-destructive/20";
            case "In Progress":
                return "bg-accent text-accent-foreground border-border";
            default:
                return "bg-muted text-muted-foreground border-border";
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "Selected":
                return <CheckCircle2 className="h-3 w-3" />;
            case "Rejected":
                return <XCircle className="h-3 w-3" />;
            case "In Progress":
                return <Clock className="h-3 w-3" />;
            default:
                return null;
        }
    };

    return (
        <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
            <div className="p-6 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Briefcase className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="font-display text-lg font-bold text-foreground">Placement Details</h3>
                        <p className="text-xs text-muted-foreground">Tracking your professional journey</p>
                    </div>
                </div>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-success/10 rounded-full border border-success/20">
                    <span className="h-2 w-2 rounded-full bg-success animate-pulse"></span>
                    <span className="text-[10px] font-bold text-success uppercase tracking-wider">Placement Season Active</span>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-muted/50 border-b border-border">
                            <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Company</th>
                            <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Role</th>
                            <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Package</th>
                            <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Progress</th>
                            <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Date</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {placementData.length > 0 ? (
                            placementData.map((item, index) => (
                                <tr key={index} className="hover:bg-muted/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-foreground">{item.companyName}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-foreground/80">{item.role || "N/A"}</td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center gap-1 rounded-full bg-success/10 border border-success/20 px-2.5 py-1 text-xs font-bold text-success">
                                            {item.package || "8–12 LPA"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusStyles(item.status)}`}>
                                            {getStatusIcon(item.status)}
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground mb-1 uppercase">
                                                <span>Rounds Cleared</span>
                                                <span>{item.roundsCleared || 0}/{item.totalRounds || 3}</span>
                                            </div>
                                            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                                                <div
                                                    className="h-full bg-primary rounded-full transition-all duration-500"
                                                    style={{ width: `${((item.roundsCleared || 0) / (item.totalRounds || 3)) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-xs text-muted-foreground">
                                            {item.date ? new Date(item.date).toLocaleDateString() : "Pending"}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="px-6 py-12 text-center text-sm text-muted-foreground italic">
                                    No companies attended yet. Keep your profile updated for upcoming drives!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="p-4 bg-muted/20 border-t border-border flex items-center justify-center">
                <button className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                    View Comprehensive Placement Report <ChevronRight className="h-3 w-3" />
                </button>
            </div>
        </div>
    );
};

export default PlacementDetails;
