import * as React from "react";
import { useState, useEffect } from "react";
import { useAuth } from "../App";
import { db } from "../firebase";
import { collection, query, where, onSnapshot, orderBy, limit, getDocs, doc, updateDoc, getDoc } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Calendar, 
  MessageSquare, 
  Users, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  MoreVertical,
  Scissors,
  DollarSign,
  Star,
  Share2,
  ExternalLink,
  Settings,
  ChevronRight,
  Plus,
  Trash2,
  User as UserIcon,
  Briefcase
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Appointment, Chat as ChatType, BarberProfile, Service } from "../types";

export function BarberDashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [chats, setChats] = useState<ChatType[]>([]);
  const [barberProfile, setBarberProfile] = useState<BarberProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [newService, setNewService] = useState<Partial<Service>>({ name: "", price: 0, duration: 30 });

  useEffect(() => {
    if (!user || profile?.role !== 'barber') {
      navigate("/");
      return;
    }

    // Fetch Barber Profile
    const fetchProfile = async () => {
      const docRef = doc(db, "barbers", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setBarberProfile(docSnap.data() as BarberProfile);
      }
    };
    fetchProfile();

    // Fetch Appointments
    const appointmentsQuery = query(
      collection(db, "appointments"),
      where("barberId", "==", user.uid),
      orderBy("startTime", "desc"),
      limit(20)
    );

    const unsubscribeAppointments = onSnapshot(appointmentsQuery, (snapshot) => {
      const apps = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
      setAppointments(apps);
      setLoading(false);
    });

    // Fetch Chats
    const chatsQuery = query(
      collection(db, "chats"),
      where("participants", "array-contains", user.uid),
      orderBy("lastTimestamp", "desc")
    );

    const unsubscribeChats = onSnapshot(chatsQuery, (snapshot) => {
      const c = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatType));
      setChats(c);
    });

    return () => {
      unsubscribeAppointments();
      unsubscribeChats();
    };
  }, [user, profile, navigate]);

  const handleStatusUpdate = async (appointmentId: string, status: Appointment['status']) => {
    try {
      await updateDoc(doc(db, "appointments", appointmentId), { status });
      toast.success(`Appointment ${status} successfully!`);
    } catch (error: any) {
      toast.error("Failed to update status: " + error.message);
    }
  };

  const handleAddService = async () => {
    if (!user || !barberProfile || !newService.name || !newService.price) return;
    
    const service: Service = {
      id: Math.random().toString(36).substr(2, 9),
      name: newService.name,
      price: Number(newService.price),
      duration: Number(newService.duration),
      category: "Hair"
    };

    const updatedServices = [...(barberProfile.services || []), service];
    try {
      await updateDoc(doc(db, "barbers", user.uid), { services: updatedServices });
      setBarberProfile({ ...barberProfile, services: updatedServices });
      setNewService({ name: "", price: 0, duration: 30 });
      toast.success("Service added successfully!");
    } catch (error: any) {
      toast.error("Failed to add service: " + error.message);
    }
  };

  const handleRemoveService = async (serviceId: string) => {
    if (!user || !barberProfile) return;
    const updatedServices = barberProfile.services.filter(s => s.id !== serviceId);
    try {
      await updateDoc(doc(db, "barbers", user.uid), { services: updatedServices });
      setBarberProfile({ ...barberProfile, services: updatedServices });
      toast.success("Service removed!");
    } catch (error: any) {
      toast.error("Failed to remove service: " + error.message);
    }
  };

  const copyBookingLink = () => {
    const link = `${window.location.origin}/book/${user?.uid}`;
    navigator.clipboard.writeText(link);
    toast.success("Booking link copied to clipboard!");
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]">Loading Dashboard...</div>;
  }

  const stats = [
    { title: "Total Revenue", value: "$1,240", icon: DollarSign, color: "text-green-500", bg: "bg-green-500/10" },
    { title: "Appointments", value: appointments.length.toString(), icon: Calendar, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Avg. Rating", value: barberProfile?.rating?.toFixed(1) || "5.0", icon: Star, color: "text-yellow-500", bg: "bg-yellow-500/10" },
    { title: "New Clients", value: "12", icon: Users, color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 px-4">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold font-display tracking-tight">Barber Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-lg">Welcome back, {profile?.displayName}. Here's what's happening today.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="rounded-xl h-12 px-6 font-bold" onClick={copyBookingLink}>
            <Share2 className="mr-2 h-5 w-5" />
            Share Booking Link
          </Button>
          <Button className="rounded-xl h-12 px-6 font-bold" onClick={() => navigate(`/barber/${user?.uid}`)}>
            <ExternalLink className="mr-2 h-5 w-5" />
            View Public Profile
          </Button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="rounded-3xl border-none shadow-lg bg-muted/30">
            <CardContent className="p-6 flex items-center gap-4">
              <div className={`h-14 w-14 rounded-2xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`h-7 w-7 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">{stat.title}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="appointments" className="w-full">
        <TabsList className="bg-muted/30 p-1 rounded-2xl mb-8 flex-wrap h-auto">
          <TabsTrigger value="appointments" className="rounded-xl px-8 py-3 text-lg font-bold data-[state=active]:bg-background data-[state=active]:shadow-lg">
            <Calendar className="mr-2 h-5 w-5" />
            Appointments
          </TabsTrigger>
          <TabsTrigger value="messages" className="rounded-xl px-8 py-3 text-lg font-bold data-[state=active]:bg-background data-[state=active]:shadow-lg">
            <MessageSquare className="mr-2 h-5 w-5" />
            Messages
            {chats.length > 0 && <Badge className="ml-2 bg-primary text-primary-foreground">{chats.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="services" className="rounded-xl px-8 py-3 text-lg font-bold data-[state=active]:bg-background data-[state=active]:shadow-lg">
            <Briefcase className="mr-2 h-5 w-5" />
            Services
          </TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-xl px-8 py-3 text-lg font-bold data-[state=active]:bg-background data-[state=active]:shadow-lg">
            <TrendingUp className="mr-2 h-5 w-5" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="appointments" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Upcoming Appointments */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-2xl font-bold font-display flex items-center">
                <Clock className="mr-2 h-6 w-6 text-primary" />
                Upcoming Bookings
              </h3>
              <div className="space-y-4">
                {appointments.length === 0 ? (
                  <Card className="rounded-3xl border-dashed border-2 bg-transparent p-12 text-center">
                    <p className="text-muted-foreground text-lg">No appointments scheduled yet.</p>
                  </Card>
                ) : (
                  appointments.map((app) => (
                    <motion.div key={app.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                      <Card className="rounded-3xl border-none shadow-md hover:shadow-xl transition-all group">
                        <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                          <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center font-bold text-primary text-xl">
                              {new Date(app.startTime).getDate()}
                            </div>
                            <div>
                              <p className="font-bold text-lg">Client ID: {app.userId.slice(0, 8)}...</p>
                              <p className="text-muted-foreground flex items-center text-sm">
                                <Clock className="mr-1 h-4 w-4" />
                                {new Date(app.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                {" - "}
                                {new Date(app.startTime).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant={app.status === 'confirmed' ? 'default' : app.status === 'pending' ? 'secondary' : 'destructive'} className="rounded-full px-4 py-1">
                              {app.status}
                            </Badge>
                            <div className="flex gap-2">
                              {app.status === 'pending' && (
                                <Button size="sm" variant="outline" className="rounded-xl bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500 hover:text-white" onClick={() => handleStatusUpdate(app.id, 'confirmed')}>
                                  <CheckCircle2 className="h-4 w-4" />
                                </Button>
                              )}
                              <Button size="sm" variant="outline" className="rounded-xl bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500 hover:text-white" onClick={() => handleStatusUpdate(app.id, 'cancelled')}>
                                <XCircle className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="ghost" className="rounded-xl" onClick={() => navigate(`/chat/${app.userId}`)}>
                                <MessageSquare className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            {/* Quick Actions / Schedule Preview */}
            <div className="space-y-6">
              <Card className="rounded-[2.5rem] border-none shadow-xl bg-primary text-primary-foreground overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-display">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 p-6 pt-0">
                  <Button className="w-full justify-start rounded-xl bg-white/10 hover:bg-white/20 border-none h-12 text-white" onClick={() => navigate("/profile")}>
                    <Settings className="mr-3 h-5 w-5" />
                    Account Settings
                  </Button>
                  <Button className="w-full justify-start rounded-xl bg-white/10 hover:bg-white/20 border-none h-12 text-white" onClick={() => navigate("/profile")}>
                    <Clock className="mr-3 h-5 w-5" />
                    Update Availability
                  </Button>
                  <Button className="w-full justify-start rounded-xl bg-white/10 hover:bg-white/20 border-none h-12 text-white" onClick={() => navigate("/profile")}>
                    <Scissors className="mr-3 h-5 w-5" />
                    Portfolio Manager
                  </Button>
                </CardContent>
              </Card>

              <Card className="rounded-[2.5rem] border-none shadow-xl bg-muted/30">
                <CardHeader>
                  <CardTitle className="text-xl font-display">Recent Messages</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[300px] px-6">
                    {chats.length === 0 ? (
                      <p className="text-center text-muted-foreground py-10">No messages yet.</p>
                    ) : (
                      chats.map((chat) => (
                        <div key={chat.id} className="flex items-center gap-4 py-4 border-b last:border-none cursor-pointer hover:bg-muted/50 rounded-xl px-2 transition-colors" onClick={() => navigate(`/chat/${chat.participants.find(p => p !== user?.uid)}`)}>
                          <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                            {chat.participants.find(p => p !== user?.uid)?.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold truncate">Client {chat.participants.find(p => p !== user?.uid)?.slice(-4)}</p>
                            <p className="text-sm text-muted-foreground truncate">{chat.lastMessage || "No messages yet"}</p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      ))
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="messages">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             <Card className="md:col-span-1 rounded-3xl border-none shadow-xl bg-muted/30">
               <CardHeader>
                 <CardTitle className="font-display">All Conversations</CardTitle>
               </CardHeader>
               <CardContent className="p-0">
                 <ScrollArea className="h-[60vh] px-4">
                   {chats.map((chat) => (
                     <div key={chat.id} className="flex items-center gap-4 p-4 hover:bg-background rounded-2xl cursor-pointer transition-all mb-2" onClick={() => navigate(`/chat/${chat.participants.find(p => p !== user?.uid)}`)}>
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary">
                          {chat.participants.find(p => p !== user?.uid)?.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold truncate">Client {chat.participants.find(p => p !== user?.uid)?.slice(-4)}</span>
                            <span className="text-[10px] text-muted-foreground">
                              {chat.lastTimestamp ? new Date(chat.lastTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{chat.lastMessage}</p>
                        </div>
                     </div>
                   ))}
                 </ScrollArea>
               </CardContent>
             </Card>
             <Card className="md:col-span-2 rounded-3xl border-none shadow-xl bg-muted/30 flex items-center justify-center p-12 text-center">
                <div className="space-y-4">
                  <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <MessageSquare className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold font-display">Select a conversation</h3>
                  <p className="text-muted-foreground max-w-xs mx-auto">Click on a client from the list to view your chat history and respond to messages.</p>
                </div>
             </Card>
           </div>
        </TabsContent>

        <TabsContent value="services" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="lg:col-span-1 rounded-3xl border-none shadow-xl bg-muted/30">
              <CardHeader>
                <CardTitle className="font-display">Add New Service</CardTitle>
                <CardDescription>Create a new offering for your clients.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Service Name</Label>
                  <Input 
                    placeholder="e.g. Skin Fade" 
                    className="rounded-xl h-12 bg-background border-none"
                    value={newService.name}
                    onChange={(e) => setNewService(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Price ($)</Label>
                  <Input 
                    type="number" 
                    placeholder="35" 
                    className="rounded-xl h-12 bg-background border-none"
                    value={newService.price}
                    onChange={(e) => setNewService(prev => ({ ...prev, price: Number(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Duration (minutes)</Label>
                  <Input 
                    type="number" 
                    placeholder="45" 
                    className="rounded-xl h-12 bg-background border-none"
                    value={newService.duration}
                    onChange={(e) => setNewService(prev => ({ ...prev, duration: Number(e.target.value) }))}
                  />
                </div>
                <Button className="w-full h-12 rounded-xl font-bold mt-4" onClick={handleAddService}>
                  <Plus className="mr-2 h-5 w-5" />
                  Add Service
                </Button>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 rounded-3xl border-none shadow-xl bg-muted/30">
              <CardHeader>
                <CardTitle className="font-display">Active Services</CardTitle>
                <CardDescription>These services are visible to your clients.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {barberProfile?.services?.map((service) => (
                    <div key={service.id} className="flex items-center justify-between p-6 rounded-2xl bg-background/50 border border-transparent hover:border-primary/20 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Scissors className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-bold text-lg">{service.name}</p>
                          <p className="text-sm text-muted-foreground">{service.duration} mins • ${service.price}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="rounded-full text-red-500 hover:bg-red-50" onClick={() => handleRemoveService(service.id)}>
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  ))}
                  {(!barberProfile?.services || barberProfile.services.length === 0) && (
                    <div className="text-center py-12">
                      <Briefcase className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                      <p className="text-muted-foreground">No services added yet. Add your first service to start booking.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <Card className="rounded-[3rem] border-none shadow-2xl bg-muted/30 p-12 text-center">
            <TrendingUp className="h-16 w-16 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold font-display mb-4">Analytics Coming Soon</h2>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              We're building advanced insights to help you grow your business. Soon you'll be able to track earnings, client retention, and peak hours.
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
