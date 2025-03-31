// components/Sidebar.tsx
"use client";

import { MenuIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import NewDocumentButton from "./NewDocumentButton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useUser } from "@clerk/nextjs";
import { collectionGroup, query, where } from "firebase/firestore";
import { useCollection } from "react-firebase-hooks/firestore";
import { db } from "@/firebase";
import { useEffect, useState } from "react";
import SidebarOption from "./SidebarOption";

interface RoomDocument {
  createdAt: string;
  role: "owner" | "editor";
  roomId: string;
  userId: string;
  id?: string;
}

function Sidebar() {
  const { user } = useUser();
  const { t } = useTranslation();
  const [groupedData, setGroupedData] = useState<{
    owner: RoomDocument[];
    editor: RoomDocument[];
  }>({ owner: [], editor: [] });

  const [data] = useCollection(
    user &&
      query(collectionGroup(db, "rooms"), where("userId", "==", user.emailAddresses?.[0]?.toString() || ""))
  );

  useEffect(() => {
    if (!data) return;
    const grouped = data.docs.reduce<{
      owner: RoomDocument[];
      editor: RoomDocument[];
    }>((acc, curr) => {
      const roomData = curr.data() as RoomDocument;
      if (roomData.role === "owner") {
        acc.owner.push({ id: curr.id, ...roomData });
      } else {
        acc.editor.push({ id: curr.id, ...roomData });
      }
      return acc;
    }, { owner: [], editor: [] });
    setGroupedData(grouped);
  }, [data]);

  const menuOptions = (
    <>
      <NewDocumentButton />
      <div className="flex py-4 flex-col space-y-4 md:max-w-36">
        {/* 소유 문서 */}
        {groupedData.owner.length === 0 ? (
          <h2 className="text-gray-500 font-semibold text-sm">
            {t("sidebar.noDocument")}
          </h2>
        ) : (
          <>
            <h2 className="text-gray-500 font-semibold text-sm">
              {t("sidebar.myDocuments")}
            </h2>
            {groupedData.owner.map((doc) => (
              <SidebarOption key={doc.id} id={doc.id!} href={`/doc/${doc.id}`} />
            ))}
          </>
        )}
        {/* 공유 문서 */}
        {groupedData.editor.length > 0 && (
          <>
            <h2 className="text-gray-500 font-semibold text-sm">
              {t("sidebar.sharedWithMe")}
            </h2>
            {groupedData.editor.map((doc) => (
              <SidebarOption key={doc.id} id={doc.id!} href={`/doc/${doc.id}`} />
            ))}
          </>
        )}
      </div>
    </>
  );

  return (
    <div className="p-2 md:p-5 bg-gray-200 relative">
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger>
            <MenuIcon className="p-2 hover:opacity-30 rounded-lg" size={40} />
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>{t("header.home")}</SheetTitle>
              <div>{menuOptions}</div>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      </div>

      <div className="hidden md:inline">{menuOptions}</div>
    </div>
  );
}

export default Sidebar;
