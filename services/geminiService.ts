import { GoogleGenAI } from "@google/genai";

// Ensure API Key is available
const apiKey = process.env.API_KEY;

let ai: GoogleGenAI | null = null;
if (apiKey) {
    ai = new GoogleGenAI({ apiKey });
}

export const editImageWithGemini = async (
    base64Image: string,
    prompt: string
): Promise<string> => {
    if (!ai) {
        throw new Error("Gemini API Key is missing.");
    }

    try {
        // Strip the data URL prefix if present to get just the base64 data
        const base64Data = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, "");
        
        // Correct model for editing/manipulation via prompting
        const modelId = 'gemini-2.5-flash-image';

        const response = await ai.models.generateContent({
            model: modelId,
            contents: {
                parts: [
                    {
                        inlineData: {
                            mimeType: 'image/png',
                            data: base64Data
                        }
                    },
                    {
                        text: prompt
                    }
                ]
            }
        });

        // The model returns the edited image in the candidates
        const parts = response.candidates?.[0]?.content?.parts;
        if (parts) {
            for (const part of parts) {
                if (part.inlineData && part.inlineData.data) {
                    return `data:image/png;base64,${part.inlineData.data}`;
                }
            }
        }

        throw new Error("No image data returned from Gemini.");
    } catch (error) {
        console.error("Gemini Image Edit Error:", error);
        throw error;
    }
};