"use client";

import { OrganizerField, OrganizerTextarea } from "@/components/organizer/organizer-field";
import Button from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorMessage } from "@/lib/api/error-message";
import { useUploadImage } from "@/lib/hooks/use-organizer";
import {
  useChangePassword,
  useProfile,
  useUpdateProfile,
} from "@/lib/hooks/use-profile";
import { NIGERIAN_STATES } from "@/lib/nigerian-states";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  Key,
  Loader2,
  Lock,
  TerminalSquare,
  UserCog,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";

type Panel = "root" | "developer" | "profile" | "password";

interface ProfileForm {
  fullName: string;
  title: string;
  bio: string;
  phoneNumber: string;
  state: string;
  avatarUrl: string;
}

const PANEL_TITLES: Record<Panel, string> = {
  root: "Settings",
  developer: "Developer Portal",
  profile: "Profile",
  password: "Change password",
};

const Row = ({
  icon,
  title,
  description,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className="flex w-full cursor-pointer items-center gap-3.5 rounded-lg px-3 py-3 text-left transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-[0.99]"
  >
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
      {icon}
    </span>
    <span className="min-w-0 flex-1">
      <span className="block text-sm font-semibold">{title}</span>
      <span className="block text-xs text-muted-foreground">{description}</span>
    </span>
    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
  </button>
);

const AvatarUpload = ({
  value,
  name,
  onChange,
}: {
  value?: string;
  name: string;
  onChange: (url: string) => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadImage();

  const pick = async (file: File | undefined) => {
    if (!file) {
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Images need to be under 5MB");
      return;
    }

    try {
      const dataUri = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error("unreadable"));
        reader.readAsDataURL(file);
      });

      const asset = await upload.mutateAsync(dataUri);
      onChange(asset.url);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Couldn't upload that image"));
    }
  };

  return (
    <div className="flex items-center gap-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(event) => void pick(event.target.files?.[0])}
      />
      <span className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-lg font-bold text-muted-foreground outline outline-foreground/10 -outline-offset-1">
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="h-full w-full object-cover" />
        ) : (
          name
            .split(" ")
            .map((part) => part[0])
            .slice(0, 2)
            .join("")
        )}
        {upload.isPending ? (
          <span className="absolute inset-0 flex items-center justify-center bg-foreground/50">
            <Loader2 className="h-5 w-5 animate-spin text-background" />
          </span>
        ) : null}
      </span>
      <div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-9 text-xs"
          onClick={() => inputRef.current?.click()}
          disabled={upload.isPending}
        >
          Change photo
        </Button>
        <p className="mt-1.5 text-xs text-muted-foreground">
          JPG or PNG, up to 5MB.
        </p>
      </div>
    </div>
  );
};

export const SettingsDialog = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const router = useRouter();
  const [panel, setPanel] = useState<Panel>("root");
  const profileQuery = useProfile();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  /* The form is derived, not synced: saved values come from the query and
     edits layer on top. Untouched fields therefore pick up a refetch, and no
     effect has to copy server state into local state. */
  const [edits, setEdits] = useState<Partial<ProfileForm>>({});
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
  });

  const profile = profileQuery.data;

  const form: ProfileForm = {
    fullName: edits.fullName ?? profile?.fullName ?? "",
    title: edits.title ?? profile?.title ?? "",
    bio: edits.bio ?? profile?.bio ?? "",
    phoneNumber: edits.phoneNumber ?? profile?.phoneNumber ?? "",
    state: edits.state ?? profile?.state ?? "",
    avatarUrl: edits.avatarUrl ?? profile?.avatarUrl ?? "",
  };

  const setForm = (patch: Partial<ProfileForm>) =>
    setEdits((current) => ({ ...current, ...patch }));

  /* Closing resets the dialog for its next open, without an effect. */
  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setPanel("root");
      setPasswords({ currentPassword: "", newPassword: "" });
    }

    onOpenChange(next);
  };

  const go = (href: string) => {
    handleOpenChange(false);
    router.push(href);
  };

  const saveProfile = async () => {
    try {
      await updateProfile.mutateAsync({
        fullName: form.fullName.trim(),
        title: form.title.trim() || undefined,
        bio: form.bio.trim() || undefined,
        phoneNumber: form.phoneNumber.trim() || undefined,
        state: form.state.trim() || undefined,
        avatarUrl: form.avatarUrl || undefined,
      });
      toast.success("Profile saved");
      setPanel("root");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Couldn't save your profile"));
    }
  };

  const savePassword = async () => {
    if (passwords.newPassword.length < 8) {
      toast.error("New passwords need at least 8 characters");
      return;
    }

    try {
      await changePassword.mutateAsync(passwords);
      toast.success("Password changed");
      setPasswords({ currentPassword: "", newPassword: "" });
      setPanel("profile");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Couldn't change your password"));
    }
  };

  const isSub = panel !== "root";

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent showClose={false} className="max-w-[440px] p-0">
        <header className="flex items-center gap-2.5 px-5 pt-5 pb-4">
          {isSub ? (
            <button
              type="button"
              aria-label="Back to settings"
              onClick={() => setPanel(panel === "password" ? "profile" : "root")}
              className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          ) : null}
          <h2 className="text-base font-bold tracking-[-0.01em]">
            {PANEL_TITLES[panel]}
          </h2>
        </header>

        <hr className="ticket-perforation" />

        <div
          key={panel}
          className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-right-2 motion-safe:duration-200 max-h-[70vh] overflow-y-auto p-3"
        >
          {panel === "root" ? (
            <div className="flex flex-col gap-0.5">
              <Row
                icon={<TerminalSquare className="h-[18px] w-[18px]" />}
                title="Developer Portal"
                description="API keys, documentation and the sandbox"
                onClick={() => setPanel("developer")}
              />
              <Row
                icon={<UserCog className="h-[18px] w-[18px]" />}
                title="Profile"
                description="Your name, photo and how organizers see you"
                onClick={() => setPanel("profile")}
              />
            </div>
          ) : null}

          {panel === "developer" ? (
            <div className="flex flex-col gap-0.5">
              <Row
                icon={<Key className="h-[18px] w-[18px]" />}
                title="API keys"
                description="Create, reveal and revoke keys"
                onClick={() => go("/developers/keys")}
              />
              <Row
                icon={<BookOpen className="h-[18px] w-[18px]" />}
                title="Documentation"
                description="Every endpoint, with examples"
                onClick={() => go("/developers/docs")}
              />
              <Row
                icon={<TerminalSquare className="h-[18px] w-[18px]" />}
                title="Sandbox"
                description="Try a request without writing code"
                onClick={() => go("/developers/sandbox")}
              />
            </div>
          ) : null}

          {panel === "profile" ? (
            profileQuery.isLoading ? (
              <div className="flex flex-col gap-4 p-2">
                <Skeleton className="h-16 w-full rounded-md" />
                <Skeleton className="h-12 w-full rounded-md" />
                <Skeleton className="h-12 w-full rounded-md" />
              </div>
            ) : (
              <div className="flex flex-col gap-4 p-2">
                <AvatarUpload
                  value={form.avatarUrl}
                  name={form.fullName || "V"}
                  onChange={(url) =>
                    setForm({ avatarUrl: url })
                  }
                />

                <label className="block">
                  <span className="mb-2 block text-[13px] font-semibold">
                    Full name
                  </span>
                  <OrganizerField
                    value={form.fullName}
                    onChange={(input) =>
                      setForm({ fullName: input.target.value })
                    }
                    maxLength={120}
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-[13px] font-semibold">
                    Title
                  </span>
                  <OrganizerField
                    value={form.title}
                    onChange={(input) =>
                      setForm({ title: input.target.value })
                    }
                    placeholder="Event producer"
                    maxLength={120}
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-[13px] font-semibold">
                    Bio
                  </span>
                  <OrganizerTextarea
                    value={form.bio}
                    rows={3}
                    maxLength={280}
                    placeholder="A line about what you put on."
                    onChange={(input) =>
                      setForm({ bio: input.target.value })
                    }
                  />
                </label>

                <div className="flex gap-3">
                  <label className="flex-1">
                    <span className="mb-2 block text-[13px] font-semibold">
                      Phone
                    </span>
                    <OrganizerField
                      value={form.phoneNumber}
                      inputMode="tel"
                      maxLength={32}
                      onChange={(input) =>
                        setForm({ phoneNumber: input.target.value })
                      }
                    />
                  </label>
                  <label className="flex-1">
                    <span className="mb-2 block text-[13px] font-semibold">
                      State
                    </span>
                    <div className="relative">
                      <select
                        value={form.state}
                        aria-label="State"
                        onChange={(input) =>
                          setForm({ state: input.target.value })
                        }
                        className="h-12 w-full cursor-pointer appearance-none rounded-md border border-border bg-background px-4 pr-9 text-sm transition-colors focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:outline-none"
                      >
                        <option value="">Select…</option>
                        {NIGERIAN_STATES.map((state) => (
                          <option key={state} value={state}>
                            {state}
                          </option>
                        ))}
                      </select>
                    </div>
                  </label>
                </div>

                <button
                  type="button"
                  onClick={() => setPanel("password")}
                  className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1 py-2 text-left text-[13px] font-semibold text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Lock className="h-4 w-4" />
                  Change password
                  <ChevronRight className="ml-auto h-4 w-4" />
                </button>

                <Button
                  className="w-full"
                  loading={updateProfile.isPending}
                  disabled={form.fullName.trim().length < 2}
                  onClick={saveProfile}
                >
                  Save changes
                </Button>
              </div>
            )
          ) : null}

          {panel === "password" ? (
            <div className="flex flex-col gap-4 p-2">
              <label className="block">
                <span className="mb-2 block text-[13px] font-semibold">
                  Current password
                </span>
                <OrganizerField
                  type="password"
                  value={passwords.currentPassword}
                  autoComplete="current-password"
                  onChange={(input) =>
                    setPasswords((current) => ({
                      ...current,
                      currentPassword: input.target.value,
                    }))
                  }
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-[13px] font-semibold">
                  New password
                </span>
                <OrganizerField
                  type="password"
                  value={passwords.newPassword}
                  autoComplete="new-password"
                  onChange={(input) =>
                    setPasswords((current) => ({
                      ...current,
                      newPassword: input.target.value,
                    }))
                  }
                />
                <span className="mt-1.5 block text-xs text-muted-foreground">
                  At least 8 characters.
                </span>
              </label>
              <Button
                className="w-full"
                loading={changePassword.isPending}
                disabled={
                  !passwords.currentPassword || passwords.newPassword.length < 8
                }
                onClick={savePassword}
              >
                Change password
              </Button>
            </div>
          ) : null}
        </div>

        {panel === "root" ? (
          <div className="bg-muted/50 px-5 py-3.5">
            <p className="text-xs text-muted-foreground">
              Signed in as{" "}
              <span className={cn("font-semibold text-foreground")}>
                {profile?.email ?? "…"}
              </span>
            </p>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};
