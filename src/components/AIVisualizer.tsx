import * as React from "react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Upload, Sparkles, RefreshCw, Download, Scissors } from "lucide-react";
import { generateHairstylePreview, recommendHairstyle } from "@/src/lib/gemini";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

export function AIVisualizer() {
  const [image, setImage] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setPreview(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!image || !prompt) {
      toast.error("Please upload an image and enter a hairstyle prompt.");
      return;
    }

    setLoading(true);
    try {
      const base64Data = image.split(",")[1];
      const result = await generateHairstylePreview(base64Data, prompt);
      if (result) {
        setPreview(result);
        toast.success("Hairstyle preview generated!");
      } else {
        toast.error("Failed to generate preview. Please try again.");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRecommend = async () => {
    setLoading(true);
    try {
      const result = await recommendHairstyle("oval", "modern, low maintenance");
      setRecommendations(result);
      toast.success("Recommendations generated!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Side: Controls */}
        <div className="space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">AI Haircut <span className="text-primary italic">Visualizer</span></h1>
            <p className="text-muted-foreground text-lg">
              Upload a photo of yourself and see how different hairstyles look on you instantly.
            </p>
          </div>

          <Card className="rounded-3xl border-none shadow-xl bg-muted/30">
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-4">
                <Label className="text-lg font-medium">1. Upload your photo</Label>
                <div 
                  className="border-2 border-dashed border-muted-foreground/20 rounded-3xl p-12 text-center hover:border-primary/50 transition-colors cursor-pointer bg-background/50"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                  />
                  {image ? (
                    <img src={image} alt="Upload" className="max-h-64 mx-auto rounded-2xl shadow-lg" />
                  ) : (
                    <div className="space-y-4">
                      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                        <Upload className="h-8 w-8 text-primary" />
                      </div>
                      <p className="text-muted-foreground">Click to upload or drag and drop</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-lg font-medium">2. Describe the hairstyle</Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="e.g. Low fade with textured crop" 
                    className="h-12 rounded-xl"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                  <Button 
                    className="h-12 rounded-xl px-6" 
                    onClick={handleGenerate}
                    disabled={loading || !image}
                  >
                    {loading ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5 mr-2" />}
                    Preview
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {["Buzz Cut", "Pompadour", "Mullet", "Side Part", "Man Bun"].map((style) => (
                    <button 
                      key={style}
                      onClick={() => setPrompt(style)}
                      className="px-4 py-1.5 rounded-full bg-background border border-border text-sm hover:border-primary transition-colors"
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold">AI Recommendations</h3>
              <Button variant="ghost" size="sm" onClick={handleRecommend} disabled={loading}>
                Get Suggestions
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recommendations.map((rec, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-4 rounded-2xl bg-muted/50 border border-border"
                >
                  <h4 className="font-bold text-primary mb-1">{rec.name}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2">{rec.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Preview */}
        <div className="relative">
          <AnimatePresence mode="wait">
            {preview ? (
              <motion.div 
                key="preview"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="sticky top-24 space-y-6"
              >
                <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-background aspect-[3/4]">
                  <img src={preview} alt="AI Preview" className="w-full h-full object-cover" />
                  <div className="absolute bottom-6 right-6 flex gap-2">
                    <Button size="icon" className="rounded-full h-12 w-12 bg-white text-black hover:bg-white/90 shadow-lg">
                      <Download className="h-6 w-6" />
                    </Button>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Button className="flex-1 h-14 rounded-2xl text-lg font-bold" size="lg">
                    <Scissors className="mr-2 h-6 w-6" />
                    Book with this style
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="sticky top-24 h-[600px] rounded-[2.5rem] border-4 border-dashed border-muted-foreground/10 flex flex-col items-center justify-center text-center p-12"
              >
                <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-6">
                  <Camera className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Preview Area</h3>
                <p className="text-muted-foreground max-w-xs">
                  Your AI-generated hairstyle preview will appear here after you upload a photo and select a style.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
