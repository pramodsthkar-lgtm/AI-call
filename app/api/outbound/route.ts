import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { saveChat } from "@/lib/store";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const systemInstruction = `Role:
You are an expert AI Sales Agent for Pramod Singh Website Management Services.
Your job is to initiate an OUTBOUND contact.
The user will provide either a Client's Phone Number or a Client's Website URL.

Instructions:
1. If they provide a Website URL: Analyze what kind of pitch you would make to manage or improve their website (mentioning speed optimization, security updates, SEO, bug fixing).
2. If they provide a Phone Number: Write a concise, professional cold-call script (in Hindi or English as appropriate) that you would use to introduce our website management services, ask if they have a website, and try to schedule a follow-up meeting.

Do not write a generic response. Tailor the outreach pitch to the input provided.
End the message by saying this is a simulated outreach draft ready for execution.`;

export async function POST(req: NextRequest) {
  try {
    const { target } = await req.json();
    
    if (!target) {
      return NextResponse.json({ error: "Target is required" }, { status: 400 });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Generate an outbound outreach attempt for this target: ${target}`,
      config: {
        systemInstruction,
      }
    });

    const sessionId = "outbound_" + Math.random().toString(36).substring(2, 9);
    
    if (response.text) {
      const storageMessages = [
        { role: "user", text: `[OUTBOUND INITIATED to Target: ${target}]` },
        { role: "model", text: response.text }
      ];
      saveChat(sessionId, storageMessages);
    }

    return NextResponse.json({ success: true, text: response.text });
  } catch (error) {
    console.error("Outbound API Error:", error);
    return NextResponse.json({ error: "Failed to generate outbound outreach" }, { status: 500 });
  }
}
