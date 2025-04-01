'use client';

import { useEffect, useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { db } from '@/firebase';
import { useUser } from '@clerk/nextjs';
import {
  collection,
  getDocs,
  getDoc,
  doc as firestoreDoc,
} from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Button } from './button';
import { createNewDocument } from '@/actions/actions';

type Props = {
  open: boolean;
  onClose: () => void;
  youtubeUrl: string;
};

export default function VideoShareModal({ open, onClose, youtubeUrl }: Props) {
  const { user } = useUser();
  const router = useRouter();
  const [documents, setDocuments] = useState<{ id: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchDocs = async () => {
      setLoading(true);
      try {
        const userEmail = user.emailAddresses[0].emailAddress;
        console.log('📥 Fetching rooms for user:', userEmail);

        const roomSnapshot = await getDocs(
          collection(db, 'users', userEmail, 'rooms')
        );

        if (roomSnapshot.empty) {
          console.warn('⚠️ No rooms found for this user.');
        }

        const docs: { id: string; title: string }[] = [];

        for (const room of roomSnapshot.docs) {
          const roomId = room.data().roomId;
          console.log('📄 Found roomId:', roomId);

          if (!roomId) continue;

          try {
            const docRef = firestoreDoc(db, 'documents', roomId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
              const title = docSnap.data()?.title || '(제목 없음)';
              console.log(`✅ Document found: ${roomId}, title: ${title}`);
              docs.push({ id: roomId, title });
            } else {
              console.warn(`🚫 Document not found for roomId: ${roomId}`);
            }
          } catch (error) {
            console.error(`❌ Failed to fetch document ${roomId}:`, error);
          }
        }

        setDocuments(docs);
      } catch (error) {
        console.error('❌ Error while fetching rooms/documents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocs();
  }, [user]);

  const handleSelect = (docId: string) => {
    onClose();
    router.push(`/doc/${docId}?youtube=${encodeURIComponent(youtubeUrl)}`);
  };

  const handleCreateNew = async () => {
    const { docId } = await createNewDocument();
    onClose();
    router.push(`/doc/${docId}?youtube=${encodeURIComponent(youtubeUrl)}`);
  };

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-6">
            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 shadow-xl transition-all">
              <Dialog.Title className="text-lg font-semibold mb-4">
                문서를 선택하세요
              </Dialog.Title>

              {loading ? (
                <p className="text-sm text-gray-500">불러오는 중...</p>
              ) : (
                <>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {documents.map((doc) => (
                      <Button
                        key={doc.id}
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => handleSelect(doc.id)}
                      >
                        {doc.title}
                      </Button>
                    ))}
                    {documents.length === 0 && (
                      <p className="text-sm text-gray-500">표시할 문서가 없습니다.</p>
                    )}
                  </div>

                  <hr className="my-4" />

                  <Button
                    className="w-full"
                    onClick={handleCreateNew}
                  >
                    ➕ 새 문서로 만들기
                  </Button>
                </>
              )}
            </Dialog.Panel>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
