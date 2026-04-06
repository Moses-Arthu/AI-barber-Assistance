import * as React from "react";
import { useState, useEffect } from "react";
import { useAuth } from "../App";
import { db } from "../firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Scissors, 
  Camera, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  Star,
  Plus,
  X,
  DollarSign,
  Briefcase
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { BarberProfile, Service } from "../types";

export function BarberProfileSetup() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<Partial<BarberProfile>>({
    bio: "",
    category: "Barbershop",
    specialties: [],
    portfolio: [],
    services: [],
    availability: {
      monday: { start: "09:00", end: "18:00", active: true },
      tuesday: { start: "09:00", end: "18:00", active: true },
      wednesday: { start: "09:00", end: "18:00", active: true },
      thursday: { start: "09:00", end: "18:00", active: true },
      friday: { start: "09:00", end: "18:00", active: true },
      saturday: { start: "10:00", end: "16:00", active: true },
      sunday: { start: "00:00", end: "00:00", active: false }
    }
  });

  const [newSpecialty, setNewSpecialty] = useState("");
  const [newPortfolioUrl, setNewPortfolioUrl] = useState("");
  const [newService, setNewService] = useState<Partial<Service>>({
    name: "",
    price: 0,
    duration: 30,
    description: "",
    category: "Hair"
  });

  useEffect(() => {
    if (!user || profile?.role !== 'barber') {
      navigate("/");
      return;
    }

    const fetchBarberData = async () => {
      const docRef = doc(db, "barbers", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.bio && data.services?.length > 0) {
          // Profile already setup, redirect to dashboard
          navigate("/dashboard");
        } else {
          setFormData(prev => ({ ...prev, ...data }));
        }
      }
    };

    fetchBarberData();
  }, [user, profile, navigate]);

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const addSpecialty = () => {
    if (newSpecialty && !formData.specialties?.includes(newSpecialty)) {
      setFormData(prev => ({
        ...prev,
        specialties: [...(prev.specialties || []), newSpecialty]
      }));
      setNewSpecialty("");
    }
  };

  const removeSpecialty = (s: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties?.filter(item => item !== s)
    }));
  };

  const addService = () => {
    if (newService.name && newService.price) {
      const service: Service = {
        id: Math.random().toString(36).substr(2, 9),
        name: newService.name,
        price: Number(newService.price),
        duration: Number(newService.duration),
        description: newService.description || "",
        category: newService.category || "Hair"
      };
      setFormData(prev => ({
        ...prev,
        services: [...(prev.services || []), service]
      }));
      setNewService({ name: "", price: 0, duration: 30, description: "", category: "Hair" });
    }
  };

  const removeService = (id: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services?.filter(s => s.id !== id)
    }));
  };

  const addPortfolio = () => {
    if (newPortfolioUrl) {
      setFormData(prev => ({
        ...prev,
        portfolio: [...(prev.portfolio || []), newPortfolioUrl]
      }));
      setNewPortfolioUrl("");
    }
  };

  const removePortfolio = (url: string) => {
    setFormData(prev => ({
      ...prev,
      portfolio: prev.portfolio?.filter(item => item !== url)
    }));
  };

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await setDoc(doc(db, "barbers", user.uid), {
        ...formData,
        uid: user.uid,
        rating: 5.0,
        reviewCount: 0,
        displayName: profile?.displayName || "Barber",
        photoURL: profile?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`
      }, { merge: true });
      
      toast.success("Profile setup complete!");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error("Failed to save profile: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { title: "Basics", icon: Scissors, desc: "Tell us about yourself" },
    { title: "Services", icon: Briefcase, desc: "What do you offer?" },
    { title: "Specialties", icon: Star, desc: "What are you best at?" },
    { title: "Portfolio", icon: Camera, desc: "Show off your work" },
    { title: "Availability", icon: Clock, desc: "When can clients book?" }
  ];

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="mb-12">
        <div className="flex justify-between items-center mb-8">
          {steps.map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-2 flex-1 relative">
              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center z-10 transition-all duration-500 ${step > i + 1 ? 'bg-green-500 text-white' : step === i + 1 ? 'bg-primary text-primary-foreground scale-110 shadow-xl' : 'bg-muted text-muted-foreground'}`}>
                {step > i + 1 ? <CheckCircle2 className="h-6 w-6" /> : <s.icon className="h-6 w-6" />}
              </div>
              <span className={`text-xs font-bold uppercase tracking-widest ${step === i + 1 ? 'text-primary' : 'text-muted-foreground'}`}>{s.title}</span>
              {i < steps.length - 1 && (
                <div className={`absolute top-6 left-[60%] w-[80%] h-0.5 -z-0 transition-all duration-500 ${step > i + 1 ? 'bg-green-500' : 'bg-muted'}`} />
              )}
            </div>
          ))}
        </div>
        <div className="text-center">
          <h1 className="text-4xl font-bold font-display">{steps[step-1].title}</h1>
          <p className="text-muted-foreground text-lg">{steps[step-1].desc}</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="rounded-[2.5rem] border-none shadow-2xl overflow-hidden bg-muted/30">
            <CardContent className="p-10">
              {step === 1 && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-lg font-bold">Business Category</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {["Barbershop", "Hair Salon", "Nails", "Skin Care", "Massage", "Other"].map((cat) => (
                        <Button
                          key={cat}
                          variant={formData.category === cat ? "default" : "outline"}
                          className="rounded-xl h-12"
                          onClick={() => setFormData(prev => ({ ...prev, category: cat }))}
                        >
                          {cat}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-lg font-bold">Your Bio</Label>
                    <Textarea 
                      id="bio" 
                      placeholder="Tell your clients about your experience, style, and why they should book with you..."
                      className="min-h-[150px] rounded-2xl bg-background/50 border-none p-6 text-lg"
                      value={formData.bio}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-lg font-bold">Shop Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input 
                        id="address" 
                        placeholder="123 Barber St, City, State"
                        className="pl-12 h-14 rounded-2xl bg-background/50 border-none text-lg"
                        value={formData.location?.address}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: { ...prev.location, address: e.target.value, latitude: 0, longitude: 0 } }))}
                      />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-8">
                  <div className="p-6 rounded-3xl bg-background/50 space-y-4">
                    <h3 className="text-xl font-bold">Add a Service</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Service Name</Label>
                        <Input 
                          placeholder="e.g. Classic Haircut"
                          className="h-12 rounded-xl bg-muted/50 border-none"
                          value={newService.name}
                          onChange={(e) => setNewService(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Price ($)</Label>
                        <Input 
                          type="number"
                          placeholder="35"
                          className="h-12 rounded-xl bg-muted/50 border-none"
                          value={newService.price}
                          onChange={(e) => setNewService(prev => ({ ...prev, price: Number(e.target.value) }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Duration (mins)</Label>
                        <Input 
                          type="number"
                          placeholder="45"
                          className="h-12 rounded-xl bg-muted/50 border-none"
                          value={newService.duration}
                          onChange={(e) => setNewService(prev => ({ ...prev, duration: Number(e.target.value) }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Input 
                          placeholder="e.g. Hair, Beard"
                          className="h-12 rounded-xl bg-muted/50 border-none"
                          value={newService.category}
                          onChange={(e) => setNewService(prev => ({ ...prev, category: e.target.value }))}
                        />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <Label>Description</Label>
                        <Input 
                          placeholder="Briefly describe the service..."
                          className="h-12 rounded-xl bg-muted/50 border-none"
                          value={newService.description}
                          onChange={(e) => setNewService(prev => ({ ...prev, description: e.target.value }))}
                        />
                      </div>
                    </div>
                    <Button className="w-full h-12 rounded-xl mt-4" onClick={addService}>
                      <Plus className="mr-2 h-5 w-5" />
                      Add Service
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-bold">Your Services</h3>
                    <div className="space-y-3">
                      {formData.services?.map((s) => (
                        <div key={s.id} className="flex items-center justify-between p-4 rounded-2xl bg-background/50 border border-transparent hover:border-primary/20 transition-all">
                          <div>
                            <p className="font-bold text-lg">{s.name}</p>
                            <p className="text-sm text-muted-foreground">{s.duration} mins • ${s.price}</p>
                          </div>
                          <Button variant="ghost" size="icon" className="rounded-full text-red-500 hover:bg-red-50" onClick={() => removeService(s.id)}>
                            <X className="h-5 w-5" />
                          </Button>
                        </div>
                      ))}
                      {formData.services?.length === 0 && (
                        <p className="text-center py-8 text-muted-foreground italic">Add at least one service to continue.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-8">
                  <div className="space-y-4">
                    <Label className="text-lg font-bold">Add Your Specialties</Label>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="e.g. Skin Fade, Beard Trim, Hot Towel Shave"
                        className="h-14 rounded-2xl bg-background/50 border-none text-lg"
                        value={newSpecialty}
                        onChange={(e) => setNewSpecialty(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addSpecialty()}
                      />
                      <Button className="h-14 w-14 rounded-2xl" onClick={addSpecialty}>
                        <Plus className="h-6 w-6" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {formData.specialties?.map(s => (
                      <Badge key={s} className="px-6 py-3 rounded-full bg-primary text-primary-foreground text-lg font-bold group">
                        {s}
                        <button onClick={() => removeSpecialty(s)} className="ml-2 hover:text-red-400">
                          <X className="h-4 w-4" />
                        </button>
                      </Badge>
                    ))}
                    {formData.specialties?.length === 0 && (
                      <p className="text-muted-foreground italic">Add at least 3 specialties to stand out.</p>
                    )}
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-8">
                  <div className="space-y-4">
                    <Label className="text-lg font-bold">Portfolio Images (URLs)</Label>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Paste image URL here..."
                        className="h-14 rounded-2xl bg-background/50 border-none text-lg"
                        value={newPortfolioUrl}
                        onChange={(e) => setNewPortfolioUrl(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addPortfolio()}
                      />
                      <Button className="h-14 w-14 rounded-2xl" onClick={addPortfolio}>
                        <Plus className="h-6 w-6" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {formData.portfolio?.map((url, i) => (
                      <div key={i} className="relative aspect-square rounded-3xl overflow-hidden group">
                        <img src={url} alt={`Portfolio ${i}`} className="w-full h-full object-cover" />
                        <button 
                          onClick={() => removePortfolio(url)}
                          className="absolute top-2 right-2 h-8 w-8 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    {formData.portfolio?.length === 0 && (
                      <div className="col-span-full py-12 text-center border-2 border-dashed rounded-3xl border-muted-foreground/20">
                        <Camera className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                        <p className="text-muted-foreground">Add photos of your best haircuts to attract clients.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-6">
                  {Object.entries(formData.availability || {}).map(([day, config]: [string, any]) => (
                    <div key={day} className="flex items-center justify-between p-6 rounded-2xl bg-background/50">
                      <div className="flex items-center gap-4">
                        <Button 
                          variant={config.active ? "default" : "outline"}
                          className="h-10 w-10 rounded-xl p-0"
                          onClick={() => setFormData(prev => ({
                            ...prev,
                            availability: {
                              ...prev.availability,
                              [day]: { ...config, active: !config.active }
                            }
                          }))}
                        >
                          {config.active ? <CheckCircle2 className="h-5 w-5" /> : <X className="h-5 w-5" />}
                        </Button>
                        <span className="text-xl font-bold capitalize w-24">{day}</span>
                      </div>
                      {config.active && (
                        <div className="flex items-center gap-4">
                          <Input 
                            type="time" 
                            className="bg-muted border-none rounded-xl w-32"
                            value={config.start}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              availability: {
                                ...prev.availability,
                                [day]: { ...config, start: e.target.value }
                              }
                            }))}
                          />
                          <span className="text-muted-foreground">to</span>
                          <Input 
                            type="time" 
                            className="bg-muted border-none rounded-xl w-32"
                            value={config.end}
                            onChange={(e) => setFormData(prev => ({
                              ...prev,
                              availability: {
                                ...prev.availability,
                                [day]: { ...config, end: e.target.value }
                              }
                            }))}
                          />
                        </div>
                      )}
                      {!config.active && <span className="text-muted-foreground font-medium italic">Closed</span>}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="p-10 pt-0 flex justify-between">
              <Button 
                variant="ghost" 
                className="h-14 px-8 rounded-2xl text-lg font-bold"
                onClick={handleBack}
                disabled={step === 1}
              >
                <ChevronLeft className="mr-2 h-5 w-5" />
                Back
              </Button>
              {step < 5 ? (
                <Button 
                  className="h-14 px-10 rounded-2xl text-lg font-bold"
                  onClick={handleNext}
                  disabled={(step === 1 && !formData.bio) || (step === 2 && formData.services?.length === 0)}
                >
                  Next Step
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              ) : (
                <Button 
                  className="h-14 px-10 rounded-2xl text-lg font-bold"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Complete Setup"}
                  <CheckCircle2 className="ml-2 h-5 w-5" />
                </Button>
              )}
            </CardFooter>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
