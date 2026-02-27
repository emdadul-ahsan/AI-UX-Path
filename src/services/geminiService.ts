import { GoogleGenAI, Type } from '@google/genai';

// We must create a new instance right before making an API call to ensure it uses the most up-to-date API key.
const getGenAI = () => {
  // process.env.API_KEY is injected automatically when user selects a key via openSelectKey
  return new GoogleGenAI({ apiKey: process.env.API_KEY || process.env.GEMINI_API_KEY });
};

export interface RoadmapNode {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'done';
}

export interface Roadmap {
  title: string;
  nodes: RoadmapNode[];
}

export interface Resource {
  title: string;
  url: string;
  type: 'video' | 'article' | 'course';
  description: string;
}

export const generateRoadmap = async (topic: string): Promise<Roadmap> => {
  const ai = getGenAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-lite',
    contents: `Generate a detailed learning roadmap for a designer focusing on: ${topic}. Break it down into 5 to 8 sequential steps.`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: 'Title of the roadmap' },
          nodes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                status: { type: Type.STRING, description: 'Always "pending"' }
              },
              required: ['id', 'title', 'description', 'status']
            }
          }
        },
        required: ['title', 'nodes']
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error('No response from AI');
  return JSON.parse(text) as Roadmap;
};

export const generateResources = async (nodeTitle: string, nodeDescription: string): Promise<Resource[]> => {
  const ai = getGenAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-lite',
    contents: `Suggest 3 to 5 high-quality learning resources (especially YouTube videos, articles, or courses) for a UX/Product designer learning about: ${nodeTitle}. Context: ${nodeDescription}. Provide real or highly realistic titles and URLs (e.g., youtube.com/watch?v=...).`,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            url: { type: Type.STRING },
            type: { type: Type.STRING, description: '"video", "article", or "course"' },
            description: { type: Type.STRING }
          },
          required: ['title', 'url', 'type', 'description']
        }
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error('No response from AI');
  return JSON.parse(text) as Resource[];
};

export const generateImage = async (prompt: string, size: '1K' | '2K' | '4K'): Promise<string> => {
  const ai = getGenAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [{ text: prompt }]
    },
    config: {
      imageConfig: {
        aspectRatio: '16:9',
        imageSize: size
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error('Failed to generate image');
};

export const createChatSession = () => {
  const ai = getGenAI();
  return ai.chats.create({
    model: 'gemini-3.1-pro-preview',
    config: {
      systemInstruction: 'You are an expert AI mentor for UX and Product Designers. You provide concise, actionable, and insightful advice on design principles, AI tools for design, career growth, and portfolio building.'
    }
  });
};
