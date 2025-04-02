import RoomProvider from "@/components/ui/RoomProvider";
import React from "react";

export default async function DocLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const { id } = await Promise.resolve(params);

  return <RoomProvider roomId={id}>{children}</RoomProvider>;
}
