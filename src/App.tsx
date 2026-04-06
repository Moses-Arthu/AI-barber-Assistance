import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from "react-router-dom";
import * as React from "react";
import { useState, useEffect, createContext, useContext } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth, db } from "@/src/firebase";
import { doc, getDoc } from "firebase/firestore";
import { motion, AnimatePresence } from "motion/react";
import { 
  Scissors, 
  User as UserIcon, 
  Calendar, 
  MessageSquare, 
  Camera, 
  MapPin, 
  LogOut, 
  Menu, 
  X,
  Sparkles,
  Bell,
  Settings,
  LayoutDashboard,
  ArrowRight,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { Auth } from "./components/Auth";
import { BarberList } from "./components/BarberList";
import { BarberDetail } from "./components/BarberDetail";
import { AIVisualizer } from "./components/AIVisualizer";
import { Chat } from "./components/Chat";
import { BarberDashboard } from "./components/BarberDashboard";
import { BarberProfileSetup } from "./components/BarberProfileSetup";
import { UserProfile } from "./types";

// Auth Context
const AuthContext = createContext<{
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
}>({ user: null, profile: null, loading: true });

export const useAuth = () => useContext(AuthContext);

const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");

  const categories = [
    { name: "Barbershop", icon: Scissors, color: "bg-blue-500" },
    { name: "Hair Salon", icon: Sparkles, color: "bg-pink-500" },
    { name: "Nails", icon: Sparkles, color: "bg-purple-500" },
    { name: "Skin Care", icon: Sparkles, color: "bg-green-500" },
    { name: "Eyebrows", icon: Sparkles, color: "bg-orange-500" },
    { name: "Massage", icon: Sparkles, color: "bg-teal-500" },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/barbers?q=${searchQuery}&l=${locationQuery}`);
  };

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Search Section */}
      <section className="relative h-[500px] flex items-center justify-center overflow-hidden rounded-[3rem] bg-slate-900">
        <div className="absolute inset-0 opacity-40">
          <img 
            src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=2000" 
            alt="Hero background" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900" />
        </div>
        
        <div className="relative z-10 w-full max-w-4xl px-6 text-center space-y-8">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-bold text-white tracking-tight font-display"
          >
            Find and book <br /> <span className="text-primary italic">local services</span>
          </motion.h1>
          
          <motion.form 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleSearch}
            className="flex flex-col md:flex-row gap-2 p-2 bg-white rounded-[2rem] shadow-2xl"
          >
            <div className="flex-1 flex items-center px-4 border-b md:border-b-0 md:border-r border-slate-100">
              <Search className="h-5 w-5 text-slate-400 mr-3" />
              <input 
                type="text" 
                placeholder="What service are you looking for?" 
                className="w-full h-14 bg-transparent outline-none text-slate-800 font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex-1 flex items-center px-4">
              <MapPin className="h-5 w-5 text-slate-400 mr-3" />
              <input 
                type="text" 
                placeholder="Where?" 
                className="w-full h-14 bg-transparent outline-none text-slate-800 font-medium"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
              />
            </div>
            <Button type="submit" size="lg" className="h-14 px-10 rounded-[1.5rem] text-lg font-bold">
              Search
            </Button>
          </motion.form>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-10 font-display">Explore categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((cat, i) => (
            <motion.div 
              key={cat.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -5 }}
              className="flex flex-col items-center gap-4 p-8 rounded-[2.5rem] bg-muted/30 cursor-pointer hover:bg-primary/5 transition-all group"
              onClick={() => navigate(`/barbers?cat=${cat.name}`)}
            >
              <div className={`h-16 w-16 rounded-2xl ${cat.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                <cat.icon className="h-8 w-8" />
              </div>
              <span className="font-bold text-lg">{cat.name}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Recommended Section */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold font-display">Recommended for you</h2>
            <p className="text-muted-foreground mt-2">Based on your location and preferences</p>
          </div>
          <Button variant="ghost" className="font-bold text-primary" onClick={() => navigate("/barbers")}>
            View all <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <BarberList limit={3} horizontal={true} />
        </div>
      </section>

      {/* App Promo Section */}
      <section className="container mx-auto px-4 rounded-[3rem] bg-primary p-12 md:p-24 text-primary-foreground flex flex-col md:flex-row items-center gap-12 overflow-hidden relative">
        <div className="flex-1 space-y-8 relative z-10">
          <h2 className="text-5xl md:text-6xl font-bold font-display leading-tight">Book your next <br /> appointment anywhere</h2>
          <p className="text-xl opacity-90 max-w-xl leading-relaxed">
            Download the TrimAI app for the best experience. Manage your bookings, get reminders, and discover new styles on the go.
          </p>
          <div className="flex gap-4">
            <Button variant="secondary" size="lg" className="h-16 px-8 rounded-2xl font-bold">App Store</Button>
            <Button variant="secondary" size="lg" className="h-16 px-8 rounded-2xl font-bold">Google Play</Button>
          </div>
        </div>
        <div className="flex-1 relative h-[400px] w-full md:h-auto">
          <motion.img 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=800" 
            alt="Mobile App" 
            className="absolute -bottom-24 right-0 w-[300px] rounded-[3rem] shadow-2xl border-8 border-slate-900"
          />
        </div>
      </section>
    </div>
  );
};

const Badge = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>
    {children}
  </span>
);

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await auth.signOut();
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-xl">
      <div className="container flex h-20 items-center justify-between mx-auto px-6">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center group-hover:rotate-12 transition-transform">
            <Scissors className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-2xl font-bold tracking-tight font-display">TrimAI</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/barbers" className="text-sm font-bold hover:text-primary transition-colors uppercase tracking-widest">Discover</Link>
          <Link to="/visualizer" className="text-sm font-bold hover:text-primary transition-colors uppercase tracking-widest">AI Visualizer</Link>
          <Link to="/appointments" className="text-sm font-bold hover:text-primary transition-colors uppercase tracking-widest">Bookings</Link>
          
          <div className="h-6 w-px bg-border mx-2" />
          
          {user ? (
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="rounded-full relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2 h-2 w-2 bg-primary rounded-full" />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full" onClick={() => navigate("/profile")}>
                <UserIcon className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
              {profile?.role === 'barber' && (
                <Button variant="secondary" className="rounded-xl font-bold" onClick={() => navigate("/dashboard")}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              )}
            </div>
          ) : (
            <Button className="rounded-xl px-6 h-11 font-bold" onClick={() => navigate("/login")}>Sign In</Button>
          )}
        </div>

        {/* Mobile Nav Toggle */}
        <button className="md:hidden p-2 rounded-xl bg-muted" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden border-b bg-background px-6 py-8 space-y-6"
          >
            <Link to="/barbers" className="block text-2xl font-bold font-display" onClick={() => setIsOpen(false)}>Discover</Link>
            <Link to="/visualizer" className="block text-2xl font-bold font-display" onClick={() => setIsOpen(false)}>AI Visualizer</Link>
            <Link to="/appointments" className="block text-2xl font-bold font-display" onClick={() => setIsOpen(false)}>My Bookings</Link>
            <div className="pt-6 flex flex-col gap-4">
              {user ? (
                <>
                  <Button variant="outline" className="h-14 rounded-2xl text-lg font-bold" onClick={() => { navigate("/profile"); setIsOpen(false); }}>Profile</Button>
                  <Button variant="destructive" className="h-14 rounded-2xl text-lg font-bold" onClick={handleLogout}>Logout</Button>
                </>
              ) : (
                <Button className="h-14 rounded-2xl text-lg font-bold" onClick={() => { navigate("/login"); setIsOpen(false); }}>Sign In</Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data() as UserProfile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, profile, loading }}>
      <Router>
        <div className="min-h-screen bg-background font-sans antialiased text-foreground selection:bg-primary selection:text-primary-foreground">
          <Navbar />
          <main className="container mx-auto px-6 py-12">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Auth />} />
              <Route path="/barbers" element={<BarberList />} />
              <Route path="/barber/:id" element={<BarberDetail />} />
              <Route path="/book/:id" element={<BarberDetail />} />
              <Route path="/visualizer" element={<AIVisualizer />} />
              <Route path="/chat/:id" element={<Chat />} />
              <Route path="/appointments" element={<div className="text-center py-20 text-2xl font-bold">My Appointments (Coming Soon)</div>} />
              <Route path="/profile" element={<div className="text-center py-20 text-2xl font-bold">Profile Page (Coming Soon)</div>} />
              <Route path="/dashboard" element={<BarberDashboard />} />
              <Route path="/setup-profile" element={<BarberProfileSetup />} />
            </Routes>
          </main>
          <Toaster position="top-center" richColors closeButton />
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

