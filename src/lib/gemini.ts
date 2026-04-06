import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateHairstylePreview(imageBuffer: string, prompt: string) {
  const model = "gemini-2.5-flash-image";
  
  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        {
          inlineData: {
            data: imageBuffer,
            mimeType: "image/png",
          },
        },
        {
          text: `Apply the following hairstyle to the person in the image: ${prompt}. 
                 Maintain the face features and only change the hair. 
                 Return the modified image.`,
        },
      ],
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  
  return null;
}

export async function recommendHairstyle(faceShape: string, preferences: string) {
  const model = "gemini-3-flash-preview";
  
  const response = await ai.models.generateContent({
    model,
    contents: `Recommend 3 best hairstyles for a person with a ${faceShape} face shape and preferences: ${preferences}. 
               Return the response as a JSON array of objects with 'name', 'description', and 'why' fields.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            why: { type: Type.STRING }
          },
          required: ["name", "description", "why"]
        }
      }
    }
  });

  return JSON.parse(response.text);
}
