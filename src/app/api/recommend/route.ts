import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { dorms } from "@/data";

export async function POST(request: Request) {
  try {
    const { messages }: { messages: { role: "user" | "assistant"; content: string }[] } = await request.json();

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GROQ_API_KEY is missing" }, { status: 500 });
    }

    const groq = new Groq({ apiKey: apiKey });

    const dormDatabaseContext = dorms.map(d => 
      `Name: ${d.name} | Price: Rp ${d.price} | AC: ${d.hasAC ? "Yes" : "No"} | Distance: ${d.distanceKm}km | Gender: ${d.gender} | Rating: ${d.rating}/5`
    ).join("\n");

    const systemPrompt = `You are the KostMatch AI Concierge for Telkom University.
    Recommend dorms from this database based on the user's request:
    ${dormDatabaseContext}
    
    CRITICAL RULES:
    1. IF THE USER ASKS FOR "THE BEST", "WHICH IS BETTER", OR ASKS YOU TO CHOOSE ONE: You MUST pick ONLY ONE dorm. Do not list two.
    2. If they just ask for general options, you may recommend 1 or 2.
    3. DO NOT use section headers like "Rekomendasi Terbaik:" or "Kenapa ini cocok:". Just write a short, friendly opening sentence.
    4. Use a simple bullet point (-) to list the dorm. Use **bold** ONLY for the dorm name and price.
    5. Keep it very short and conversational (Aku/Kamu). Under 45 words.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        ...messages
      ],
      model: "openai/gpt-oss-120b", 
      temperature: 0.7,
      max_tokens: 4096,
    });

    const reply = chatCompletion.choices[0]?.message?.content || "Maaf, aku belum bisa bantu itu.";
    return NextResponse.json({ reply });

  } catch (error: any) {
    console.error("Recommendation Error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}