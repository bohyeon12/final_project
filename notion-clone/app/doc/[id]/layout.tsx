<<<<<<< HEAD
import { auth } from '@clerk/nextjs/server';
import RoomProvider  from '@/components/ui/RoomProvider';
import React from 'react'

function DocLayout({children, params:{id}}:{
    children:React.ReactNode;
    params:{id:string};
}) {
    auth.protect();
    return <RoomProvider roomId={id}>{children}</RoomProvider>;
}
export default DocLayout;
=======
import RoomProvider from "@/components/ui/RoomProvider";
import React from "react";

export default async function DocLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const { id } = await Promise.resolve(params); //params 오류 회피

  return <RoomProvider roomId={id}>{children}</RoomProvider>;
}
>>>>>>> c350f983adaabd5b47b386329954a82136268f6f
