import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, query, where, limit as firestoreLimit } from "firebase/firestore";
import { BarberProfile } from "../types";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, MapPin, Clock, Search, Filter, ChevronRight, User, Scissors } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion } from "motion/react";
import { useNavigate, useSearchParams } from "react-router-dom";

interface BarberListProps {
  limit?: number;
  horizontal?: boolean;
}

const MOCK_BARBERS_FALLBACK: BarberProfile[] = [
  {
    uid: "mock1",
    displayName: "The Gent's Lounge",
    email: "gent@example.com",
    photoURL: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=800",
    role: "barber",
    bio: "Premium grooming experience for the modern gentleman. Specializing in classic cuts and hot towel shaves.",
    rating: 4.9,
    reviewCount: 128,
    specialties: ["Classic Cut", "Hot Shave", "Beard Trim"],
    category: "Barbershop",
    services: [],
    portfolio: [],
    createdAt: Date.now(),
    availability: {}
  },
  {
    uid: "mock2",
    displayName: "Velvet & Steel",
    email: "velvet@example.com",
    photoURL: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=800",
    role: "barber",
    bio: "Where edge meets elegance. Expert stylists for all hair types and contemporary styles.",
    rating: 4.8,
    reviewCount: 95,
    specialties: ["Skin Fade", "Hair Coloring", "Styling"],
    category: "Hair Salon",
    services: [],
    portfolio: [],
    createdAt: Date.now(),
    availability: {}
  },
  {
    uid: "mock3",
    displayName: "Urban Edge Studio",
    email: "urban@example.com",
    photoURL: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=800",
    role: "barber",
    bio: "Modern cuts for the urban lifestyle. Fast, precise, and always on trend.",
    rating: 4.7,
    reviewCount: 210,
    specialties: ["Buzz Cut", "Line Up", "Taper Fade"],
    category: "Barbershop",
    services: [],
    portfolio: [],
    createdAt: Date.now(),
    availability: {}
  }
];

export function BarberList({ limit, horizontal }: BarberListProps) {
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [barbers, setBarbers] = useState<BarberProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let q = query(collection(db, "barbers"));
    
    if (limit) {
      q = query(q, firestoreLimit(limit));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const b = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as BarberProfile));
      
      // Fallback to mock data if empty (for demo/booksy feel)
      if (b.length === 0) {
        setBarbers(MOCK_BARBERS_FALLBACK);
      } else {
        setBarbers(b);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [limit]);

  const filteredBarbers = barbers.filter(b => 
    b.displayName?.toLowerCase().includes(search.toLowerCase()) ||
    b.specialties?.some(s => s.toLowerCase().includes(search.toLowerCase())) ||
    b.category?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <Card key={i} className="h-[400px] rounded-[2rem] bg-muted animate-pulse border-none" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {!limit && (
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search barbers, styles, or specialties..." 
              className="pl-10 h-12 rounded-2xl bg-muted/50 border-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            {["Barbershop", "Hair Salon", "Nails", "Skin Care", "Massage"].map((tag) => (
              <Badge 
                key={tag} 
                variant={search === tag ? "default" : "secondary"} 
                className="px-4 py-2 rounded-full cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors whitespace-nowrap"
                onClick={() => setSearch(tag === search ? "" : tag)}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      <div className={`grid grid-cols-1 ${limit ? "md:grid-cols-3" : "md:grid-cols-2 lg:grid-cols-3"} gap-8`}>
        {filteredBarbers.map((barber, i) => (
          <motion.div
            key={barber.uid}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="rounded-[2.5rem] overflow-hidden border-none shadow-lg hover:shadow-2xl transition-all duration-500 group cursor-pointer bg-card" onClick={() => navigate(`/barber/${barber.uid}`)}>
              <div className="relative h-72 overflow-hidden">
                <img 
                  src={barber.photoURL} 
                  alt={barber.displayName} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-4 right-4">
                  <Badge className="bg-white/95 text-black backdrop-blur-sm border-none px-4 py-1.5 rounded-full font-bold shadow-lg">
                    <Star className="h-4 w-4 mr-1 fill-primary text-primary" />
                    {barber.rating}
                  </Badge>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/90 via-black/40 to-transparent text-white">
                  <Badge variant="secondary" className="mb-3 bg-primary/20 text-primary-foreground border-none backdrop-blur-md">
                    {barber.category || "Barbershop"}
                  </Badge>
                  <h3 className="text-3xl font-bold font-display">{barber.displayName}</h3>
                  <div className="flex items-center text-sm opacity-90 mt-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    {barber.location?.address || "Downtown, New York"}
                  </div>
                </div>
              </div>
              <CardContent className="p-8">
                <div className="flex flex-wrap gap-2 mb-6">
                  {barber.specialties.slice(0, 3).map(s => (
                    <Badge key={s} variant="outline" className="rounded-full border-muted-foreground/20 px-3">
                      {s}
                    </Badge>
                  ))}
                  {barber.specialties.length > 3 && (
                    <span className="text-xs text-muted-foreground self-center">+{barber.specialties.length - 3} more</span>
                  )}
                </div>
                <p className="text-muted-foreground line-clamp-2 text-base leading-relaxed">
                  {barber.bio}
                </p>
              </CardContent>
              <CardFooter className="px-8 pb-8 pt-0 flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Starts from</span>
                  <span className="text-2xl font-bold text-primary">$35.00</span>
                </div>
                <Button className="rounded-2xl h-12 px-6 font-bold group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                  Book Now
                  <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredBarbers.length === 0 && (
        <div className="text-center py-20 space-y-4">
          <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mx-auto">
            <Search className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-2xl font-bold">No results found</h3>
          <p className="text-muted-foreground">Try adjusting your search or filters to find what you're looking for.</p>
          <Button variant="outline" className="rounded-xl" onClick={() => setSearch("")}>Clear all filters</Button>
        </div>
      )}
    </div>
  );
}
