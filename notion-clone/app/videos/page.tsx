'use client';

import { useEffect, useState, FormEvent, useTransition } from 'react';
import { db } from '@/firebase';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { useUser } from '@clerk/nextjs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import VideoShareModal from '@/components/ui/VideoShareModal';

type Video = {
  id: string;
  title: string;
  url: string;
  createdAt: Timestamp;
  createdBy: string;
};

export default function VideoListPage() {
  const { user } = useUser();
  const [videos, setVideos] = useState<Video[]>([]);
  const [url, setUrl] = useState('');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  const fetchVideos = async () => {
    if (!user) return;

    const q = query(
      collection(db, 'videos'),
      where('createdBy', '==', user.emailAddresses[0].emailAddress)
    );
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Video, 'id'>),
    }));
    setVideos(data);
  };

  useEffect(() => {
    if (user) fetchVideos();
  }, [user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!url || !user) return;

    const title = await fetchYoutubeTitle(url);
    if (!title) {
      alert('유효한 유튜브 URL이 아니거나 제목을 가져올 수 없습니다.');
      return;
    }

    startTransition(async () => {
      await addDoc(collection(db, 'videos'), {
        title,
        url,
        createdAt: Timestamp.now(),
        createdBy: user.emailAddresses[0].emailAddress,
      });
      setUrl('');
      await fetchVideos();
    });
  };

  const handleDelete = async (videoId: string) => {
    const confirm = window.confirm('정말로 이 영상을 삭제하시겠습니까?');
    if (!confirm) return;

    await deleteDoc(doc(db, 'videos', videoId));
    await fetchVideos();
  };

  const fetchYoutubeTitle = async (url: string): Promise<string | null> => {
    const videoId = extractYouTubeId(url);
    if (!videoId) return null;

    try {
      const res = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
      const data = await res.json();
      return data.title || null;
    } catch (err) {
      console.error('Failed to fetch title:', err);
      return null;
    }
  };

  const extractYouTubeId = (url: string) => {
    const regExp =
      /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
    const match = url.match(regExp);
    return match?.[1] ?? '';
  };

  const handleSummarize = async (youtubeUrl: string) => {
    const videoId = extractYouTubeId(youtubeUrl);
    const res1 = await fetch('/api/youtube-transcript', {
      method: 'POST',
      body: JSON.stringify({ videoId }),
    });
    const { transcript } = await res1.json();
  
    const res2 = await fetch('/api/summarize', {
      method: 'POST',
      body: JSON.stringify({ transcript }),
    });
    const { summary } = await res2.json();
  
    alert(summary); // 또는 모달에 표시
  };
  
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold">🎥 Video Gallery</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="YouTube URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <Button type="submit" disabled={isPending || !url}>
          {isPending ? 'Uploading...' : 'Upload Video'}
        </Button>
      </form>

      <hr />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {videos.map((video) => {
          const videoId = extractYouTubeId(video.url);
          return (
            <div
              key={video.id}
              className="border rounded-lg p-3 shadow hover:shadow-md transition"
            >
              <Link href={`/videos/${video.id}`}>
                <img
                  src={`https://img.youtube.com/vi/${videoId}/0.jpg`}
                  alt={video.title}
                  className="w-full rounded-md mb-2"
                />
              </Link>
              <h2 className="font-semibold">{video.title}</h2>
              <p className="text-sm text-gray-500">{video.createdBy}</p>

              <div className="mt-2 flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedVideo(video)}
                  className="flex items-center gap-1"
                >
                  <PlusCircle className="w-4 h-4" />
                  내 문서에 추가
                </Button>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(video.id)}
                  className="flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  삭제
                </Button>

                <Button 
                  variant="destructive"
                  size="sm"
                  onClick={() => handleSummarize(video.url)}
                  className="flex items-center gap-1"
                >
                  <PlusCircle className="w-4 h-4" />
                  AI 요약
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 공유용 모달 */}
      {selectedVideo && (
        <VideoShareModal
          open={!!selectedVideo}
          onClose={() => setSelectedVideo(null)}
          youtubeUrl={selectedVideo.url}
        />
      )}
    </div>
  );
}
