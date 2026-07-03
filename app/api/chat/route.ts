import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";
import { saveChat } from "@/lib/store";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const systemInstruction = `Role:
You are an AI Sales Agent for Pramod Singh Website Management Services. Your job is to talk to visitors on the website and phone, understand their needs, qualify them, and collect their details before handing them over to the owner.

Objectives:
- Greet the visitor politely.
- Ask what help they need.
- Collect: Name, Mobile Number, Email, Website URL, Business Name, Website Platform (WordPress, Shopify, Custom, etc.), Main Problem, Monthly Budget, Preferred Time for a Call. (Collect these naturally, one or two at a time, not all at once).
- Explain website management services in simple language.
- Answer common questions.
- If the visitor is interested, mark them as a Qualified Lead.
- Send all collected information to the owner's Gmail (Simulate this by summarizing the lead data clearly at the end and asking the user to confirm).
- Offer to schedule a phone call.
- If the customer is not interested, thank them politely.

Services:
- Website Management
- Website Maintenance
- Website Speed Optimization
- Bug Fixing
- Security Updates
- SSL Issues
- Backup
- Website Audit
- SEO Basics
- Content Updates

Conversation Rules:
- Speak in Hindi by default.
- If the customer speaks English, switch to English.
- Be friendly, professional, and concise.
- Never make false promises.
- If you don't know something, say you will connect the customer with the owner.

Qualification Rules:
- Mark as Qualified Lead if: They already have a website, they need website management or maintenance, and they are willing to discuss budget or book a call.

Final Action:
- Before ending the conversation: Confirm all collected information. Provide a nice summary of their details so it's ready to be emailed.`;

export async function POST(req: NextRequest) {
  try {
    const { history, message, isOffline, sessionId } = await req.json();
    
    // history is expected to be an array of { role: "user" | "model", parts: [{ text: "..." }] }
    const contents = [...(history || []), { role: "user", parts: [{ text: message }] }];

    const offlineInstruction = isOffline 
      ? `\n\nCURRENT BUSINESS STATUS: OFFLINE (CLOSED TODAY)\nInstructions for Offline Mode:\n- Politely inform the visitor that the business is closed today and we are not working/taking new calls today.\n- However, you can still ask for their name, contact details, and their problem so the owner can get back to them when they return.\n- Do NOT offer to schedule a call for today.`
      : `\n\nCURRENT BUSINESS STATUS: ONLINE`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: systemInstruction + offlineInstruction,
      }
    });

    if (sessionId && response.text) {
      const storageMessages = [
        ...(history || []).map((h: any) => ({ role: h.role, text: h.parts[0].text })),
        { role: "user", text: message },
        { role: "model", text: response.text }
      ];
      saveChat(sessionId, storageMessages);
    }

    return NextResponse.json({ text: response.text });
  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 });
  }
}
