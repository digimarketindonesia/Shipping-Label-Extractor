
import { GoogleGenAI, Type } from "@google/genai";
import type { LabelData } from '../types';

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      } else {
        resolve(''); // Should not happen with readAsDataURL
      }
    };
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

const LABEL_SCHEMA = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      trackingNumber: { type: Type.STRING, description: 'The main tracking number or No. Resi.' },
      orderId: { type: Type.STRING, description: 'The order ID or No. Pesanan.' },
      recipientName: { type: Type.STRING, description: 'The name of the recipient (Penerima).' },
      recipientAddress: { type: Type.STRING, description: 'The full shipping address of the recipient, including street, city, and province.' },
      courier: { type: Type.STRING, description: 'The courier service (e.g., J&T EXPRESS, SPX, Anteraja).' },
      platform: { type: Type.STRING, description: 'The e-commerce platform where the order was placed (e.g., Shopee, Tokopedia, TikTok Shop).' },
      products: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: 'The name of the product.' },
            quantity: { type: Type.INTEGER, description: 'The quantity of the product.' },
            sku: { type: Type.STRING, description: 'The SKU of the product, if available. Return null if not found.' }
          },
          required: ['name', 'quantity']
        }
      }
    },
    required: ['trackingNumber', 'orderId', 'recipientName', 'recipientAddress', 'courier', 'platform', 'products']
  }
};

export const extractDataFromImages = async (files: File[]): Promise<LabelData[]> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const imageParts = await Promise.all(files.map(fileToGenerativePart));

  const prompt = `You are an expert data entry specialist. Your task is to accurately extract structured information from the provided shipping label images.
  Analyze each image and extract the fields as defined in the JSON schema.
  If a piece of information is not present on a label, return null or an empty string for that field.
  Consolidate the data from all images into a single JSON array.`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: { parts: [{ text: prompt }, ...imageParts] },
    config: {
      responseMimeType: "application/json",
      responseSchema: LABEL_SCHEMA,
    },
  });

  try {
    const jsonString = response.text.trim();
    const data = JSON.parse(jsonString);
    return data as LabelData[];
  } catch (e) {
    console.error("Failed to parse Gemini response:", e);
    console.error("Raw response text:", response.text);
    throw new Error("Could not parse the data from the AI. The response might be malformed.");
  }
};
