<<<<<<< HEAD
'use client'
import { useTransition } from 'react';
import { Button } from './ui/button'
import { useRouter } from 'next/navigation';
import { createNewDocument } from '@/actions/actions';

function NewDocumentButton() {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleCreateNewDocument= async () =>{
        startTransition(async () => {
            const{docId} = await createNewDocument();
            router.push(`/doc/${docId}`)
        })
    };
    return (
        <Button onClick={handleCreateNewDocument} disabled={isPending}>
            {isPending ? "Creating..." : "New Document"}
        </Button> 
    );
}

export default NewDocumentButton
=======
"use client";

import { useTransition } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "./ui/button";
import { createNewDocument } from "@/actions/actions";
import { useRouter } from "next/navigation";

function NewDocumentButton() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { t } = useTranslation();

  const handleCreateNewDocument = () => {
    startTransition(async () => {
      const { docId } = await createNewDocument();
      router.push(`/doc/${docId}`);
    });
  };

  return (
    <Button onClick={handleCreateNewDocument} disabled={isPending}>
      {isPending ? `${t("sidebar.newDocument")}...` : t("sidebar.newDocument")}
    </Button>
  );
}

export default NewDocumentButton;
>>>>>>> c350f983adaabd5b47b386329954a82136268f6f
