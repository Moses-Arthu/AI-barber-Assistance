import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, addDoc, collection } from "firebase/firestore";
import { BarberProfile, Service } from "../types";
import { useAuth } from "../App";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { 
  Star, 
  MapPin, 
  Clock, 
  MessageSquare, 
  ChevronLeft, 
  CheckCircle2, 
  Scissors, 
  Sparkles,
  Share2,
  Heart,
  CreditCard,
  ShieldCheck,
  ArrowRight,
  Info
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DEFAULT_SERVICES: Service[] = [
  { id: "s1", name: "Classic Haircut", duration: 45, price: 35, description: "A precision cut tailored to your style, includes a wash and style.", category: "Hair" },
  { id: "s2", name: "Beard Trim & Shape", duration: 30, price: 25, description: "Expert beard grooming, shaping, and line-up.", category: "Beard" },
  { id: "s3", name: "The Royal Treatment", duration: 75, price: 65, description: "Full haircut, beard grooming, and a relaxing hot towel shave.", category: "Hair" },
  { id: "s4", name: "Skin Fade", duration: 60, price: 45, description: "Modern skin fade with precision blending and styling.", category: "Hair" },
];

export function BarberDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [barber, setBarber] = useState<BarberProfile | null>(null);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [bookingStep, setBookingStep] = useState(1); // 1: Select, 2: Payment, 3: Success
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBarber = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, "barbers", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as BarberProfile;
          setBarber({ uid: docSnap.id, ...data } as BarberProfile);
          // Set first service as default if available
          if (data.services && data.services.length > 0) {
            setSelectedService(data.services[0]);
          } else {
            setSelectedService(DEFAULT_SERVICES[0]);
          }
        } else if (id.startsWith("mock")) {
          // Handle mock IDs for demo
          const mock = {
            uid: id,
            displayName: id === "mock1" ? "The Gent's Lounge" : id === "mock2" ? "Velvet & Steel" : "Urban Edge Studio",
            photoURL: id === "mock1" ? "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=800" : "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=800",
            rating: 4.9,
            reviewCount: 128,
            location: { address: "Downtown, New York", latitude: 0, longitude: 0 },
            specialties: ["Classic Cut", "Hot Shave", "Beard Trim"],
            bio: "Premium grooming experience for the modern gentleman.",
            portfolio: [
              "https://images.unsplash.com/photo-1599351431247-f10b218163e3?auto=format&fit=crop&q=80&w=400",
              "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=400",
              "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=400"
            ],
            services: DEFAULT_SERVICES,
            availability: {},
            role: "barber",
            email: "mock@example.com",
            createdAt: Date.now()
          } as BarberProfile;
          setBarber(mock);
          setSelectedService(DEFAULT_SERVICES[0]);
        }
      } catch (error) {
        console.error("Error fetching barber:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBarber();
  }, [id]);

  if (loading) return <div className="text-center py-20">Loading Barber Profile...</div>;
  if (!barber) return <div className="text-center py-20">Barber not found</div>;

  const services = barber.services && barber.services.length > 0 ? barber.services : DEFAULT_SERVICES;
  const timeSlots = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

  const handleBooking = async () => {
    if (!user) {
      toast.error("Please sign in to book an appointment.");
      navigate("/login");
      return;
    }
    if (!selectedTime || !date || !selectedService) {
      toast.error("Please select a service, date and time slot.");
      return;
    }
    setBookingStep(2);
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      const startTime = new Date(date!).setHours(parseInt(selectedTime!.split(":")[0]), 0, 0, 0);
      
      await addDoc(collection(db, "appointments"), {
        userId: user?.uid,
        barberId: barber.uid,
        serviceId: selectedService?.id,
        serviceName: selectedService?.name,
        price: selectedService?.price,
        startTime,
        endTime: startTime + (selectedService?.duration || 45) * 60 * 1000,
        status: 'pending',
        paymentStatus: 'paid',
        createdAt: Date.now()
      });

      setBookingStep(3);
      toast.success("Booking confirmed and payment successful!");
    } catch (error: any) {
      toast.error("Booking failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      <Button variant="ghost" className="mb-6 rounded-full" onClick={() => navigate("/barbers")}>
        <ChevronLeft className="mr-2 h-4 w-4" />
        Back to Barbers
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left: Info & Services */}
        <div className="lg:col-span-2 space-y-12">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative"
            >
              <img 
                src={barber.photoURL} 
                alt={barber.displayName} 
                className="w-48 h-48 rounded-[2.5rem] object-cover shadow-2xl border-4 border-background"
              />
              <div className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground shadow-lg">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </motion.div>
            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-5xl font-bold font-display">{barber.displayName}</h1>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" className="rounded-full"><Heart className="h-5 w-5" /></Button>
                  <Button variant="outline" size="icon" className="rounded-full"><Share2 className="h-5 w-5" /></Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 text-muted-foreground">
                <div className="flex items-center">
                  <Star className="h-5 w-5 mr-1 fill-primary text-primary" />
                  <span className="font-bold text-foreground">{barber.rating}</span>
                  <span className="ml-1">({barber.reviewCount} reviews)</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-1" />
                  {barber.location?.address}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {barber.specialties.map(s => (
                  <Badge key={s} variant="secondary" className="px-4 py-1.5 rounded-full text-sm">
                    {s}
                  </Badge>
                ))}
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
                {barber.bio}
              </p>
            </div>
          </div>

          <Tabs defaultValue="services" className="w-full">
            <TabsList className="bg-transparent border-b rounded-none w-full justify-start gap-8 h-12 p-0">
              <TabsTrigger value="services" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 text-lg font-semibold">Services</TabsTrigger>
              <TabsTrigger value="portfolio" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 text-lg font-semibold">Portfolio</TabsTrigger>
              <TabsTrigger value="reviews" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 text-lg font-semibold">Reviews</TabsTrigger>
            </TabsList>
            
            <TabsContent value="services" className="pt-8 space-y-4">
              {services.map((service) => (
                <Card 
                  key={service.id} 
                  className={`rounded-3xl border-2 transition-all cursor-pointer hover:shadow-md ${selectedService?.id === service.id ? "border-primary bg-primary/5" : "border-transparent bg-muted/30"}`}
                  onClick={() => setSelectedService(service)}
                >
                  <CardContent className="p-6 flex items-center justify-between">
                    <div className="space-y-1">
                      <h4 className="text-xl font-bold">{service.name}</h4>
                      <p className="text-sm text-muted-foreground">{service.duration} mins • {service.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">${service.price}</div>
                      <Button variant={selectedService?.id === service.id ? "default" : "outline"} size="sm" className="rounded-full mt-2">
                        {selectedService?.id === service.id ? "Selected" : "Select"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="portfolio" className="pt-8">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {barber.portfolio.map((img, i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ scale: 1.02 }}
                    className="aspect-square rounded-3xl overflow-hidden shadow-lg"
                  >
                    <img src={img} alt={`Work ${i}`} className="w-full h-full object-cover" />
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right: Booking Card */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {bookingStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="sticky top-24 rounded-[2.5rem] border-none shadow-2xl overflow-hidden bg-muted/30">
                  <CardHeader className="bg-primary text-primary-foreground p-8">
                    <CardTitle className="text-2xl font-display">Book Appointment</CardTitle>
                    <CardDescription className="text-primary-foreground/80">Select your preferred date and time</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 space-y-8">
                    <div className="space-y-4">
                      <Label className="text-lg font-medium">Select Date</Label>
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="rounded-2xl border bg-background/50"
                      />
                    </div>

                    <div className="space-y-4">
                      <Label className="text-lg font-medium">Select Time</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {timeSlots.map(time => (
                          <Button
                            key={time}
                            variant={selectedTime === time ? "default" : "outline"}
                            className="rounded-xl h-10"
                            onClick={() => setSelectedTime(time)}
                          >
                            {time}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4 pt-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Service: {selectedService?.name || "None selected"}</span>
                        <span className="font-bold">${selectedService?.price || 0}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Duration: {selectedService?.duration || 0} mins</span>
                      </div>
                      <div className="h-px bg-border" />
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span className="text-primary">${selectedService?.price || 0}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <Button className="w-full h-14 rounded-2xl text-lg font-bold" onClick={handleBooking}>
                        Continue to Payment
                      </Button>
                      <Button variant="outline" className="w-full h-14 rounded-2xl text-lg font-bold" onClick={() => navigate("/visualizer")}>
                        <Sparkles className="mr-2 h-5 w-5" />
                        Try AI Visualizer
                      </Button>
                      <Button variant="ghost" className="w-full h-12 rounded-2xl" onClick={() => navigate(`/chat/${barber.uid}`)}>
                        <MessageSquare className="mr-2 h-5 w-5" />
                        Chat with Barber
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {bookingStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card className="sticky top-24 rounded-[2.5rem] border-none shadow-2xl overflow-hidden bg-muted/30">
                  <CardHeader className="bg-primary text-primary-foreground p-8">
                    <CardTitle className="text-2xl font-display">Secure Payment</CardTitle>
                    <CardDescription className="text-primary-foreground/80">Complete your booking with a secure payment</CardDescription>
                  </CardHeader>
                  <CardContent className="p-8 space-y-8">
                    <div className="space-y-6">
                      <div className="p-6 rounded-2xl bg-background/50 border space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Service</span>
                          <span className="font-bold">{selectedService?.name}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Date</span>
                          <span className="font-bold">{date?.toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Time</span>
                          <span className="font-bold">{selectedTime}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Barber</span>
                          <span className="font-bold">{barber.displayName}</span>
                        </div>
                        <div className="h-px bg-border" />
                        <div className="flex justify-between items-center text-xl font-bold">
                          <span>Total to Pay</span>
                          <span className="text-primary">${selectedService?.price}</span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Payment Method</Label>
                        <div className="grid grid-cols-1 gap-3">
                          <Button variant="outline" className="h-16 rounded-2xl justify-between px-6 border-2 border-primary bg-primary/5">
                            <div className="flex items-center">
                              <CreditCard className="mr-3 h-6 w-6 text-primary" />
                              <span className="font-bold">Credit / Debit Card</span>
                            </div>
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                          </Button>
                          <Button variant="outline" className="h-16 rounded-2xl justify-start px-6 opacity-50 cursor-not-allowed">
                            <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-6 mr-3" />
                            <span className="font-bold">PayPal</span>
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 p-3 rounded-xl">
                        <ShieldCheck className="h-4 w-4 text-green-500" />
                        Your payment is secured with 256-bit SSL encryption.
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <Button className="w-full h-14 rounded-2xl text-lg font-bold" onClick={handlePayment} disabled={loading}>
                        {loading ? "Processing..." : `Pay $${selectedService?.price} & Confirm`}
                      </Button>
                      <Button variant="ghost" className="w-full h-12 rounded-2xl" onClick={() => setBookingStep(1)}>
                        Back to Selection
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {bookingStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card className="sticky top-24 rounded-[2.5rem] border-none shadow-2xl overflow-hidden bg-green-500 text-white">
                  <CardContent className="p-12 text-center space-y-6">
                    <div className="h-24 w-24 rounded-full bg-white/20 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="h-12 w-12" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold font-display mb-2">Booking Confirmed!</h2>
                      <p className="text-white/80">Your appointment with {barber.displayName} is all set for {date?.toLocaleDateString()} at {selectedTime}.</p>
                    </div>
                    <div className="pt-6 space-y-3">
                      <Button className="w-full h-14 rounded-2xl bg-white text-green-600 hover:bg-white/90 font-bold" onClick={() => navigate("/appointments")}>
                        View My Bookings
                      </Button>
                      <Button variant="ghost" className="w-full h-12 rounded-2xl text-white hover:bg-white/10" onClick={() => navigate("/")}>
                        Back to Home
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
