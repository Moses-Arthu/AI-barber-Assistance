import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { io, Socket } from "socket.io-client";
import { auth, db } from "@/src/firebase";
import { doc, getDoc, setDoc, collection, query, where, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Send, 
  Image as ImageIcon, 
  ChevronLeft, 
  MoreVertical, 
  Phone, 
  Video,
  Smile,
  Paperclip
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { UserProfile, Message } from "../types";

export function Chat() {
  const { id } = useParams(); // This is the ID of the person we are chatting with
  const navigate = useNavigate();
  const [otherUser, setOtherUser] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchOtherUser = async () => {
      if (!id) return;
      try {
        // Check users collection first
        const userDoc = await getDoc(doc(db, "users", id));
        if (userDoc.exists()) {
          setOtherUser(userDoc.data() as UserProfile);
        } else {
          // Check barbers collection
          const barberDoc = await getDoc(doc(db, "barbers", id));
          if (barberDoc.exists()) {
            setOtherUser(barberDoc.data() as UserProfile);
          }
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOtherUser();
  }, [id]);

  useEffect(() => {
    if (!auth.currentUser || !id) return;

    const newSocket = io(window.location.origin);
    setSocket(newSocket);

    // Consistent roomId: sort IDs to ensure same room for both parties
    const participants = [auth.currentUser.uid, id].sort();
    const roomId = `chat_${participants[0]}_${participants[1]}`;
    
    newSocket.emit("join-room", roomId);

    newSocket.on("receive-message", (message: any) => {
      setMessages(prev => [...prev, message]);
    });

    newSocket.on("user-typing", (data: { isTyping: boolean }) => {
      setIsTyping(data.isTyping);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !socket || !auth.currentUser || !id) return;

    const participants = [auth.currentUser.uid, id].sort();
    const roomId = `chat_${participants[0]}_${participants[1]}`;

    const messageData = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: auth.currentUser.uid,
      text: input,
      timestamp: Date.now(),
      roomId
    };

    socket.emit("send-message", messageData);
    setMessages(prev => [...prev, messageData]);
    
    // Update Firestore for persistence and dashboard preview
    try {
      const chatRef = doc(db, "chats", roomId);
      await setDoc(chatRef, {
        id: roomId,
        participants,
        lastMessage: input,
        lastTimestamp: Date.now()
      }, { merge: true });
    } catch (error) {
      console.error("Error updating chat in Firestore:", error);
    }

    setInput("");
    socket.emit("typing", { roomId, isTyping: false });
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    if (!socket || !auth.currentUser || !id) return;
    const participants = [auth.currentUser.uid, id].sort();
    const roomId = `chat_${participants[0]}_${participants[1]}`;
    socket.emit("typing", { roomId, isTyping: e.target.value.length > 0 });
  };

  if (loading) return <div className="text-center py-20">Loading Chat...</div>;
  if (!otherUser) return <div className="text-center py-20">User not found</div>;

  return (
    <div className="max-w-4xl mx-auto h-[80vh] flex flex-col">
      <Card className="flex-1 flex flex-col rounded-[2.5rem] border-none shadow-2xl overflow-hidden bg-muted/30">
        <CardHeader className="bg-primary text-primary-foreground p-6 flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full text-primary-foreground hover:bg-primary-foreground/10" onClick={() => navigate(-1)}>
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Avatar className="h-12 w-12 border-2 border-primary-foreground/20">
              <AvatarImage src={otherUser.photoURL} />
              <AvatarFallback>{otherUser.displayName[0]}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl font-display">{otherUser.displayName}</CardTitle>
              <p className="text-xs text-primary-foreground/70 flex items-center">
                <span className="h-2 w-2 rounded-full bg-green-400 mr-2 animate-pulse" />
                Online
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full text-primary-foreground hover:bg-primary-foreground/10"><Phone className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon" className="rounded-full text-primary-foreground hover:bg-primary-foreground/10"><Video className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon" className="rounded-full text-primary-foreground hover:bg-primary-foreground/10"><MoreVertical className="h-5 w-5" /></Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-0 flex flex-col bg-background/50 backdrop-blur-sm">
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              <div className="text-center">
                <span className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">Today</span>
              </div>
              
              {messages.map((msg, i) => {
                const isMe = msg.senderId === auth.currentUser?.uid;
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div className={`max-w-[70%] p-4 rounded-3xl shadow-sm ${
                      isMe 
                        ? "bg-primary text-primary-foreground rounded-tr-none" 
                        : "bg-muted text-foreground rounded-tl-none"
                    }`}>
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                      <p className={`text-[10px] mt-2 opacity-60 ${isMe ? "text-right" : "text-left"}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-muted p-3 rounded-2xl rounded-tl-none flex gap-1">
                    <span className="h-1.5 w-1.5 bg-muted-foreground/40 rounded-full animate-bounce" />
                    <span className="h-1.5 w-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="h-1.5 w-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          <div className="p-6 border-t bg-muted/20">
            <form onSubmit={handleSendMessage} className="flex items-center gap-3">
              <Button type="button" variant="ghost" size="icon" className="rounded-full text-muted-foreground">
                <Paperclip className="h-5 w-5" />
              </Button>
              <div className="relative flex-1">
                <Input 
                  placeholder="Type a message..." 
                  className="h-14 rounded-2xl pr-12 bg-background border-none shadow-inner"
                  value={input}
                  onChange={handleTyping}
                />
                <Button type="button" variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full text-muted-foreground">
                  <Smile className="h-5 w-5" />
                </Button>
              </div>
              <Button type="submit" size="icon" className="h-14 w-14 rounded-2xl shadow-lg" disabled={!input.trim()}>
                <Send className="h-6 w-6" />
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
