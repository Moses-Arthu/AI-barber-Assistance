import { BarberProfile } from "../types";

export const MOCK_BARBERS: BarberProfile[] = [
  {
    uid: "barber1",
    displayName: "Alex 'The Blade' Rivera",
    email: "alex@trimai.com",
    photoURL: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=400&h=400",
    role: "barber",
    bio: "Master barber with 15 years of experience in classic fades and beard sculpting. Specializing in modern textures and traditional straight razor shaves.",
    portfolio: [
      "https://images.unsplash.com/photo-1599351431247-f13b3828e239?auto=format&fit=crop&q=80&w=400&h=400",
      "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=400&h=400",
      "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=400&h=400"
    ],
    rating: 4.9,
    reviewCount: 128,
    specialties: ["Skin Fade", "Beard Trim", "Hot Towel Shave"],
    category: "Barbershop",
    services: [
      { id: "s1", name: "Classic Haircut", duration: 45, price: 35, description: "A precision cut tailored to your style.", category: "Hair" },
      { id: "s2", name: "Beard Trim", duration: 30, price: 25, description: "Expert beard grooming.", category: "Beard" }
    ],
    location: {
      latitude: 51.5074,
      longitude: -0.1278,
      address: "123 Grooming St, London"
    },
    availability: {
      monday: { start: "09:00", end: "18:00", active: true },
      tuesday: { start: "09:00", end: "18:00", active: true },
      wednesday: { start: "09:00", end: "18:00", active: true },
      thursday: { start: "09:00", end: "18:00", active: true },
      friday: { start: "09:00", end: "18:00", active: true },
      saturday: { start: "10:00", end: "16:00", active: true },
      sunday: { start: "00:00", end: "00:00", active: false }
    },
    createdAt: Date.now()
  },
  {
    uid: "barber2",
    displayName: "Sarah 'Style' Jenkins",
    email: "sarah@trimai.com",
    photoURL: "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?auto=format&fit=crop&q=80&w=400&h=400",
    role: "barber",
    bio: "Creative stylist focusing on long hair textures and artistic designs. I believe every haircut is a unique piece of art tailored to your face shape.",
    portfolio: [
      "https://images.unsplash.com/photo-1592647425447-18256434740b?auto=format&fit=crop&q=80&w=400&h=400",
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=400&h=400"
    ],
    rating: 4.8,
    reviewCount: 95,
    specialties: ["Long Hair", "Hair Coloring", "Artistic Designs"],
    category: "Hair Salon",
    services: [
      { id: "s3", name: "Hair Coloring", duration: 120, price: 85, description: "Full head color treatment.", category: "Hair" },
      { id: "s4", name: "Artistic Design", duration: 60, price: 55, description: "Custom hair patterns.", category: "Hair" }
    ],
    location: {
      latitude: 51.5154,
      longitude: -0.1418,
      address: "45 Fashion Ave, London"
    },
    availability: {
      monday: { start: "10:00", end: "19:00", active: true },
      tuesday: { start: "10:00", end: "19:00", active: true },
      wednesday: { start: "10:00", end: "19:00", active: true },
      thursday: { start: "10:00", end: "19:00", active: true },
      friday: { start: "10:00", end: "19:00", active: true },
      saturday: { start: "11:00", end: "17:00", active: true },
      sunday: { start: "00:00", end: "00:00", active: false }
    },
    createdAt: Date.now()
  }
];
