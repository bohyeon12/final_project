"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState, useTransition } from "react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { removeUserFromDocument } from "@/actions/actions";
import { useUser } from "@clerk/nextjs";
import { useRoom } from "@liveblocks/react";
import useOwner from "@/lib/useOwner";
import { useCollection } from "react-firebase-hooks/firestore";
import { collectionGroup, query, where } from "firebase/firestore";
import { db } from "@/firebase";
import { useTranslation } from "react-i18next";

function ManageUsers() {
  const { user } = useUser();
  const room = useRoom();
  const isOwner = useOwner();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { t } = useTranslation();

  const [usersInRoom] = useCollection(
    user && query(collectionGroup(db, "rooms"), where("roomId", "==", room.id))
  );

  const handleDelete = (userId: string) => {
    startTransition(async () => {
      if (!user) return;
      const { success } = await removeUserFromDocument(room.id, userId);
      if (success) {
        toast.success("User removed from room successfully");
      } else {
        toast.error("Failed to remove user from room!");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button asChild variant="outline">
        <DialogTrigger>
          {t("manageUsers.userCount")} {usersInRoom?.docs.length || 0}
        </DialogTrigger>
      </Button>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("manageUsers.dialogTitle")}</DialogTitle>
          <DialogDescription>{t("manageUsers.dialogDesc")}</DialogDescription>
        </DialogHeader>

        <hr className="my-2" />
        <div className="flex flex-col space-y-2">
          {usersInRoom?.docs.map((doc) => (
            <div key={doc.data().userId} className="flex items-center justify-between">
              <p className="font-light">
                {doc.data().userId === user?.emailAddresses?.[0]?.toString()
                  ? `You (${doc.data().userId})`
                  : doc.data().userId}
              </p>

              <div className="flex items-center gap-2">
                <Button variant="outline">
                  {doc.data().role === "owner"
                    ? t("manageUsers.owner")
                    : t("manageUsers.editor")}
                </Button>

                {isOwner && doc.data().userId !== user?.emailAddresses?.[0]?.toString() && (
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(doc.data().userId)}
                    disabled={isPending}
                    size="sm"
                  >
                    {isPending ? t("manageUsers.removing") : "X"}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ManageUsers;
