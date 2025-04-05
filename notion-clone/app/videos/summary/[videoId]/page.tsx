import { db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { OpenAI } from "openai";
import React from "react";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const getTranscript = async (videoId: string): Promise<string> => {
  const { YoutubeTranscript } = await import("youtube-transcript");
  const transcript = await YoutubeTranscript.fetchTranscript(videoId);
  return transcript.map((item) => item.text).join(" ");
};

const getSummary = async (text: string): Promise<string> => {
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: `다음 유튜브 영상 자막 내용을 항목별로 요약 정리해줘.

형식은 다음과 같아:

1. 주요 주제명
1-1. 하위 주제
- 핵심 포인트 1
- 핵심 포인트 2

가능하면 짧고 간결하게 정리하고, 내용이 많을 경우 최대한 구조화해서 보여줘.

<자막 내용>
${text}
`,
      },
    ],
    temperature: 0.5,
    max_tokens: 1000,
  });

  return completion.choices[0].message.content ?? "";
};

export default async function SummaryPage({ params }: { params: { videoId: string } }) {
  const { videoId: paramVideoId } = await Promise.resolve(params);

  const docRef = doc(db, "videos", paramVideoId);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) {
    return <p className="text-center p-10 text-red-500">❌ 해당 영상을 찾을 수 없습니다.</p>;
  }

  const { title, url } = snapshot.data() as { title: string; url: string };
  const embeddedVideoId = (url.split("v=")[1]?.split("&")[0] ?? url.split("/").pop()) as string;

  let summary = "요약 정보를 불러오는 중...";

  try {
    const transcript = await getTranscript(embeddedVideoId);
    summary = await getSummary(transcript);
  } catch (e) {
    summary = "⚠️ 자막이 없거나 요약 중 오류가 발생했습니다.";
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">🎬 {title}</h1>
      <iframe
        className="w-full aspect-video rounded-md shadow"
        src={`https://www.youtube.com/embed/${embeddedVideoId}`}
        allowFullScreen
      />
      <div className="bg-white p-5 rounded-lg shadow space-y-3 border border-gray-200">
        <h2 className="text-xl font-semibold">📄 요약 보기</h2>
        <div className="text-gray-800 whitespace-pre-line leading-relaxed font-sans text-[15px]">
          {summary}
        </div>
      </div>
    </div>
  );
}
