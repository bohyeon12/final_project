'use client';

import { useEffect, useState, FormEvent, useTransition } from 'react';
import { db } from '@/firebase';
import {
  addDoc,
  collection,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { useUser } from '@clerk/nextjs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

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

  const fetchVideos = async () => {
    const snapshot = await getDocs(collection(db, 'videos'));
    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Video, 'id'>),
    }));
    setVideos(data);
  };

  useEffect(() => {
    fetchVideos();
  }, []);

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

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold">🎥 Video Gallery</h1>

      {/* 업로드 폼 */}
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

      {/* 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {videos.map((video) => {
          const videoId = extractYouTubeId(video.url);
          return (
            <Link
              key={video.id}
              href={`/videos/${video.id}`}
              className="border rounded-lg p-3 shadow hover:shadow-md transition"
            >
              <img
                src={`https://img.youtube.com/vi/${videoId}/0.jpg`}
                alt={video.title}
                className="w-full rounded-md mb-2"
              />
              <h2 className="font-semibold">{video.title}</h2>
              <p className="text-sm text-gray-500">{video.createdBy}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
