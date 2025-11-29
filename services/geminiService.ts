import { GoogleGenAI, Type } from "@google/genai";
import { Guide, SearchResult } from "../types";

// Initialize Gemini
// Note: process.env.API_KEY is assumed to be available as per instructions.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const searchGuidesWithAI = async (
  query: string,
  allGuides: Guide[]
): Promise<SearchResult[]> => {
  if (!query.trim()) return [];

  // If we have a massive number of guides, sending them all in context might be expensive.
  // For this app (Google Sheet based), we assume < 20k tokens of text, which fits easily in Flash.
  // We will map the guides to a lighter format to save tokens.
  const guidesContext = allGuides.map(g => ({
    id: g.id,
    title: g.title,
    description: g.description,
    category: g.category,
    tags: g.tags.join(", ")
  }));

  const systemInstruction = `
    You are an intelligent librarian for a guide database. 
    Your goal is to find the most relevant guides for a user's query.
    You must analyze the user's intent, even if they use vague terms, and match it to the available guides.
    Return a ranked list of relevant guides. 
    For each match, provide a 'relevanceScore' (0-100) and a brief 'reasoning' (one sentence) explaining why it matches.
    Only return guides that are actually relevant. If none are relevant, return an empty array.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
        User Query: "${query}"

        Available Guides (JSON):
        ${JSON.stringify(guidesContext)}
      `,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              relevanceScore: { type: Type.NUMBER },
              reasoning: { type: Type.STRING },
            },
            required: ["id", "relevanceScore", "reasoning"],
          },
        },
      },
    });

    const resultText = response.text;
    if (!resultText) return [];

    const aiResults = JSON.parse(resultText) as { id: string; relevanceScore: number; reasoning: string }[];

    // Merge AI results back with full guide objects
    const results: SearchResult[] = aiResults
      .map(aiRes => {
        const originalGuide = allGuides.find(g => g.id === aiRes.id);
        if (!originalGuide) return null;
        return {
          ...originalGuide,
          relevanceScore: aiRes.relevanceScore,
          reasoning: aiRes.reasoning
        };
      })
      .filter((item): item is SearchResult => item !== null)
      .sort((a, b) => b.relevanceScore - a.relevanceScore);

    return results;

  } catch (error) {
    console.error("Gemini Search Error:", error);
    // Fallback: Simple keyword matching if AI fails
    const lowerQuery = query.toLowerCase();
    return allGuides
      .filter(g => 
        g.title.toLowerCase().includes(lowerQuery) || 
        g.description.toLowerCase().includes(lowerQuery) ||
        g.tags.some(t => t.toLowerCase().includes(lowerQuery))
      )
      .map(g => ({
        ...g,
        relevanceScore: 50,
        reasoning: "Keyword match fallback."
      }));
  }
};
