import { db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { notFound } from "next/navigation";

type Props = {
  params: { id: string };
};

const getYoutubeEmbedUrl = (url: string) => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^"&?\/\s]{11})/i,
    /youtube\.com\/shorts\/([^"&?\/\s]{11})/i,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
  }

  return null;
};

export default async function VideoDetailPage({ params }: Props) {
  // ✅ Next.js 경고 회피용 비동기 패턴
  const { id: videoId } = await Promise.resolve(params);

  const docRef = doc(db, "videos", videoId);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) {
    notFound();
  }

  const data = snapshot.data();
  const embedUrl = getYoutubeEmbedUrl(data.url);

  if (!embedUrl) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <p className="text-red-600 font-semibold">Invalid YouTube URL</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">{data.title}</h1>
      <div className="relative" style={{ paddingBottom: "56.25%", height: 0 }}>
        <iframe
          className="absolute top-0 left-0 w-full h-full rounded-md shadow"
          src={embedUrl}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={data.title}
        />
      </div>
      <p className="text-sm text-gray-500">Uploaded by {data.createdBy}</p>
    </div>
  );
}
