// /app/api/summarize/route.ts
import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { transcript } = await req.json();

    if (!transcript || transcript.trim() === '') {
      return NextResponse.json({ error: "Transcript is empty" }, { status: 400 });
    }

    console.log("🧠 Summarizing transcript");

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: `다음 유튜브 영상 자막 내용을 한국어로 간결하게 요약해줘:\n\n${transcript}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    const summary = completion.choices[0]?.message?.content;

    if (!summary) {
      return NextResponse.json({ error: "AI 응답이 비었습니다." }, { status: 500 });
    }

    console.log("✅ Summary complete");
    return NextResponse.json({ summary });
  } catch (err) {
    console.error("🔥 Error in /api/summarize:", err);
    return NextResponse.json({ error: "OpenAI summarization failed" }, { status: 500 });
  }
}
