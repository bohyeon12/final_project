<<<<<<< HEAD
'use client'

import Document from "@/components/Document"
import { use } from "react";

function DocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const {id} = use(params);
    return (
    <div className="flex flex-col flex-1 min-h-screen">
      <Document id={id}/> 
    </div> 
  )
}

export default DocumentPage
=======
import Document from "@/components/Document";

export default async function DocumentPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = await Promise.resolve(params); //params 오류 회피

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      <Document id={id} />
    </div>
  );
}
>>>>>>> c350f983adaabd5b47b386329954a82136268f6f
