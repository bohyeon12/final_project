"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FormEvent, useState, useTransition } from "react";
import { Button } from "./ui/button";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { inviteUserToDocument } from "@/actions/actions";
import { Input } from "./ui/input";
import { useTranslation } from "react-i18next";

function InviteUser() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const pathname = usePathname();
  const { t } = useTranslation();

  const handleInvite = (e: FormEvent) => {
    e.preventDefault();
    const roomId = pathname.split("/").pop();
    if (!roomId) return;

    startTransition(async () => {
      const { success } = await inviteUserToDocument(roomId, email);
      if (success) {
        setIsOpen(false);
        setEmail("");
        toast.success(t("inviteUser.inviteSuccess"));
      } else {
        toast.error(t("inviteUser.inviteFail"));
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button asChild variant="outline">
        <DialogTrigger>{t("document.invite")}</DialogTrigger>
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("inviteUser.dialogTitle")}</DialogTitle>
          <DialogDescription>{t("inviteUser.dialogDesc")}</DialogDescription>
        </DialogHeader>

        <form className="flex gap-2" onSubmit={handleInvite}>
          <Input
            type="email"
            placeholder={t("inviteUser.email") as string}
            className="w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit" disabled={!email || isPending}>
            {isPending ? t("inviteUser.inviting") : t("inviteUser.invite")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default InviteUser;
