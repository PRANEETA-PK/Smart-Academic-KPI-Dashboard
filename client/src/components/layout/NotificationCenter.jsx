import React, { useState, useEffect } from "react";
import {
    Bell,
    Mail,
    AlertTriangle,
    CheckCircle2,
    Clock,
    X,
    ChevronRight,
    MessageSquare
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import userService from "@/services/userService";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const NotificationCenter = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState(false);

    const fetchNotifications = async () => {
        try {
            const data = await userService.getNotifications();
            setNotifications(data);
        } catch (error) {
            console.error("Failed to load notifications");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll for new notifications every minute
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    const handleMarkAsRead = async (id) => {
        try {
            await userService.markAsRead(id);
            setNotifications(notifications.map(n =>
                n._id === id ? { ...n, isRead: true } : n
            ));
        } catch (error) {
            toast.error("Failed to update notification");
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const getTypeIcon = (type) => {
        switch (type) {
            case 'Alert': return <AlertTriangle className="h-4 w-4 text-destructive" />;
            case 'System': return <Clock className="h-4 w-4 text-blue-500" />;
            default: return <MessageSquare className="h-4 w-4 text-primary" />;
        }
    };

    return (
        <div className="relative">
            <Button
                variant="ghost"
                size="icon"
                className="relative rounded-full hover:bg-muted"
                onClick={() => setIsOpen(!isOpen)}
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-4 w-4 bg-destructive text-[10px] font-bold text-destructive-foreground rounded-full flex items-center justify-center border-2 border-background animate-pulse">
                        {unreadCount}
                    </span>
                )}
            </Button>

            {isOpen && (
                <div className="absolute right-0 mt-3 w-80 sm:w-96 z-50 animate-in fade-in zoom-in duration-200">
                    <Card className="shadow-2xl border-primary/10 overflow-hidden">
                        <CardHeader className="bg-primary px-4 py-3 flex flex-row items-center justify-between space-y-0">
                            <div>
                                <CardTitle className="text-sm font-bold text-primary-foreground">Institutional Notices</CardTitle>
                                <CardDescription className="text-[10px] text-primary-foreground/70">
                                    Official communication from administration
                                </CardDescription>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-primary-foreground hover:bg-white/10"
                                onClick={() => setIsOpen(false)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <ScrollArea className="h-[400px]">
                                {loading ? (
                                    <div className="p-8 text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
                                        <p className="text-xs text-muted-foreground italic">Fetching secure messages...</p>
                                    </div>
                                ) : notifications.length === 0 ? (
                                    <div className="p-12 text-center">
                                        <Mail className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                                        <p className="text-sm font-medium text-muted-foreground">No new notices</p>
                                        <p className="text-xs text-muted-foreground/60 mt-1">Your inbox is clear for now.</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-border/50">
                                        {notifications.map((n) => (
                                            <div
                                                key={n._id}
                                                className={cn(
                                                    "p-4 transition-colors hover:bg-muted/50 group cursor-default",
                                                    !n.isRead && "bg-primary/5"
                                                )}
                                            >
                                                <div className="flex gap-3">
                                                    <div className="mt-1">
                                                        {getTypeIcon(n.type)}
                                                    </div>
                                                    <div className="flex-1 space-y-1">
                                                        <div className="flex items-center justify-between">
                                                            <p className={cn(
                                                                "text-xs font-bold leading-none",
                                                                !n.isRead ? "text-primary" : "text-foreground"
                                                            )}>
                                                                {n.title}
                                                            </p>
                                                            <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                                                {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                                                            {n.message}
                                                        </p>
                                                        <div className="flex items-center justify-between pt-2">
                                                            <span className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                                                                <Badge variant="outline" className="text-[9px] py-0 px-1 border-muted-foreground/20">
                                                                    {n.sender?.name || 'Admin'}
                                                                </Badge>
                                                                • {n.type}
                                                            </span>
                                                            {!n.isRead && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-6 text-[10px] font-bold text-primary hover:text-primary p-0 h-auto"
                                                                    onClick={() => handleMarkAsRead(n._id)}
                                                                >
                                                                    Mark as Read <ChevronRight className="h-3 w-3 inline ml-0.5" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                        </CardContent>
                        {notifications.length > 0 && (
                            <div className="p-2 bg-muted/30 border-t flex justify-center">
                                <p className="text-[10px] text-muted-foreground italic font-medium">
                                    Displaying last 20 institutional transmissions
                                </p>
                            </div>
                        )}
                    </Card>
                </div>
            )}
        </div>
    );
};

export default NotificationCenter;
