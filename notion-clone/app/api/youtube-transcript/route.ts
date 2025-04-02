// /app/api/youtube-transcript/route.ts
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { videoId } = await req.json();

  try {
    const res = await fetch(`https://yt.lemnoslife.com/videos?part=captions&id=${videoId}`);
    const data = await res.json();

    // 자막 ID 추출
    const captionId = data.items?.[0]?.captions?.playerCaptionsTracklistRenderer?.captionTracks?.[0]?.baseUrl;

    if (!captionId) return NextResponse.json({ error: 'No captions found' }, { status: 404 });

    const captionRes = await fetch(captionId);
    const text = await captionRes.text();

    return NextResponse.json({ transcript: text });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch transcript' }, { status: 500 });
  }
}
