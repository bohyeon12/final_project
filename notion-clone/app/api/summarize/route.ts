// /app/api/summarize/route.ts
import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  const { transcript } = await req.json();

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'user',
          content: `다음 유튜브 영상 자막을 간결하게 요약해줘:\n\n${transcript}`,
        },
      ],
    });

    return NextResponse.json({ summary: completion.choices[0].message.content });
  } catch (err) {
    return NextResponse.json({ error: 'OpenAI request failed' }, { status: 500 });
  }
}
