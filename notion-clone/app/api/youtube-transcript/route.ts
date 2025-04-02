import { NextResponse } from 'next/server';
import { YoutubeTranscript } from 'youtube-transcript';

export async function POST(req: Request) {
  try {
    const { videoId } = await req.json();

    if (!videoId) {
      return NextResponse.json({ error: "Missing videoId" }, { status: 400 });
    }

    const transcript = await YoutubeTranscript.fetchTranscript(videoId);

    if (!transcript || transcript.length === 0) {
      return NextResponse.json({ error: "No transcript found" }, { status: 404 });
    }

    // 자막 배열을 하나의 문자열로 합치기
    const fullText = transcript.map(item => item.text).join(' ');

    return NextResponse.json({ transcript: fullText });
  } catch (err) {
    console.error("🔥 Failed to fetch transcript:", err);
    return NextResponse.json({ error: "Transcript fetch failed" }, { status: 500 });
  }
}
