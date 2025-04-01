'use client'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { FormEvent, useState, useTransition } from "react";
import { Button } from "./ui/button";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { inviteUserToDocument } from "@/actions/actions";
import { Input } from "./ui/input";

function InviteUser() {
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [email, setEmail] = useState("")
    const pathname = usePathname();

    const handleInvite = async (e:FormEvent) => {
        e.preventDefault();
        const roomId = pathname.split("/").pop();
        if(!roomId) return;

        startTransition(async() => {
            const {success} = await inviteUserToDocument(roomId,email);

            if(success) {
                setIsOpen(false);
                setEmail('');
                toast.success("Invited User successfully");
            } else { 
                toast.error("failed to invite User");
            }
        })
    }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <Button asChild variant="outline">
            <DialogTrigger>Invite</DialogTrigger>
        </Button>
        <DialogContent>
        <DialogHeader>
            <DialogTitle>Invite a User to collaborate</DialogTitle>
            <DialogDescription>
            Enter the email of the user you want to invite.
            </DialogDescription>
        </DialogHeader>

        <form className="flex gap-2"onSubmit={handleInvite}>
            <Input
            type="email"
            placeholder="Email"
            className="w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}/>
            <Button type="submit" disabled={!email || isPending}>
                {isPending ? "Inviting.." : "Invite"}
            </Button>
        </form>
        </DialogContent>
    </Dialog>

  )}

export default InviteUser;
