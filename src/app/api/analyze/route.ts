import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import type { Dorm } from "@/data";

export async function POST(request: Request) {
  try {
    const { dorm, messages }: { dorm: Dorm; messages: { role: "user" | "assistant"; content: string }[] } = await request.json();

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "GROQ_API_KEY is missing" }, { status: 500 });
    }

    const groq = new Groq({ apiKey: apiKey });

    const systemPrompt = `You are an elite housing inspector at Telkom University. The user is asking about "${dorm.name}".
    Intel:
    - Price: Rp ${dorm.price} | AC: ${dorm.hasAC ? "Yes" : "No"} | Distance: ${dorm.distanceKm} km
    - Reviews: ${dorm.googleReviews.join(" | ")}
    
    RULES:
    1. Keep formatting minimal. DO NOT use headers. Use simple bullet points (-) if listing pros/cons.
    2. Use **bold** for key facts.
    3. Speak in Indonesian (Aku/Kamu). Keep it under 50 words.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        ...messages 
      ],
      model: "openai/gpt-oss-120b", 
      temperature: 0.7,
      max_tokens: 4096, 
    });

    const reply = chatCompletion.choices[0]?.message?.content || "Maaf, aku tidak bisa menjawab itu.";
    return NextResponse.json({ reply });

  } catch (error: any) {
    console.error("Backend Error:", error.message);
    return NextResponse.json(
      { error: error.message || "Failed to generate response" },
      { status: 500 }
    );
  }
}