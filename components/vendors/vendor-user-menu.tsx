"use client";

import { ConfirmDialog } from "@/components/confirm-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLogout, useSession } from "@/lib/hooks/use-auth";
import { ROUTES } from "@/lib/utils";
import { ArrowLeft, ChevronDown, LogOut, Ticket } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * The signed-in menu inside the vendor workspace.
 *
 * Without it the workspace reads as a logged-out page: there is nothing on
 * screen saying whose account this is, or any way out other than the browser's
 * back button.
 */
const VendorUserMenu = () => {
  const router = useRouter();
  const sessionQuery = useSession();
  const logout = useLogout();
  const [confirmLogout, setConfirmLogout] = useState(false);

  const user = sessionQuery.data?.user;

  if (!user) {
    return null;
  }

  return (
    <>
      <ConfirmDialog
        open={confirmLogout}
        onOpenChange={setConfirmLogout}
        title="Sign out of Vera?"
        description="Your vendor account and menu stay as they are. You will just need to sign back in."
        confirmLabel="Sign out"
        cancelLabel="Stay signed in"
        loading={logout.isPending}
        onConfirm={() =>
          logout.mutate(undefined, {
            onSuccess: () => {
              setConfirmLogout(false);
              router.push("/");
            },
          })
        }
      />

      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 rounded-full border border-border bg-secondary py-1 pr-3 pl-1 text-sm font-semibold text-foreground">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatarUrl} />
            <AvatarFallback>
              {user.fullName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="hidden max-w-32 truncate sm:inline">
            {user.fullName}
          </span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </DropdownMenuTrigger>

        <DropdownMenuContent>
          <DropdownMenuItem render={<Link href={ROUTES.TICKETS} />}>
            <Ticket className="h-4 w-4" />
            My tickets
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/" />}>
            <ArrowLeft className="h-4 w-4" />
            Back to Vera
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setConfirmLogout(true)}
            className="text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default VendorUserMenu;
