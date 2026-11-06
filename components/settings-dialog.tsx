"use client";

import { MenuLabel, MenuTile } from "@/components/header-menu";
import { OrganizerField, OrganizerTextarea } from "@/components/organizer/organizer-field";
import { SELECT_FIELD } from "@/components/organizer/organizer-primitives";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Button from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { POSTER_TONES, type PosterTone } from "@/components/vera/event-poster";
import { getApiErrorMessage } from "@/lib/api/error-message";
import { useUploadImage } from "@/lib/hooks/use-organizer";
import { useChangePassword, useProfile, useUpdateProfile } from "@/lib/hooks/use-profile";
import { NIGERIAN_STATES } from "@/lib/nigerian-states";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Camera,
  ChevronDown,
  ChevronRight,
  Key,
  Loader2,
  Lock,
  TerminalSquare,
  UserCog,
  X,
  type LucideIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, type ReactNode } from "react";
import { toast } from "sonner";

type Section = "profile" | "password" | "developer";

interface ProfileForm {
  fullName: string;
  title: string;
  bio: string;
  phoneNumber: string;
  state: string;
  avatarUrl: string;
}

const SECTIONS: { id: Section; title: string; description: string; icon: LucideIcon; tone: PosterTone; lead: string; accent: string }[] = [
  { id: "profile", title: "Profile", description: "Name, photo, how people see you", icon: UserCog, tone: "green", lead: "your", accent: "profile." },
  { id: "password", title: "Password", description: "Change how you sign in", icon: Lock, tone: "yellow", lead: "your", accent: "password." },
  { id: "developer", title: "Developer portal", description: "API keys, docs and the sandbox", icon: TerminalSquare, tone: "blue", lead: "build on", accent: "vera." },
];

const FieldLabel = ({ children, hint }: { children: ReactNode; hint?: string }) => (
  <span className="mb-2 block">
    <span className="block text-sm font-bold">{children}</span>
    {hint ? <span className="mt-0.5 block text-[13px] text-muted-foreground">{hint}</span> : null}
  </span>
);

/** A link out of the dialog, drawn like a header menu row. */
const LinkRow = ({ icon, tone, title, description, onClick }: { icon: LucideIcon; tone: PosterTone; title: string; description: string; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex w-full cursor-pointer items-center gap-3.5 rounded-[22px] border-[1.5px] border-border p-3 text-left transition-colors hover:border-foreground focus-visible:border-foreground focus-visible:outline-none"
  >
    <MenuTile icon={icon} tone={tone} />
    <MenuLabel title={title} description={description} />
    <ArrowUpRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground" />
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
      <span
        className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full text-xl font-extrabold outline outline-foreground/10 -outline-offset-1"
        style={{ backgroundColor: POSTER_TONES.green.bg, color: POSTER_TONES.green.fg }}
      >
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
        <Button type="button" size="sm" variant="line" onClick={() => inputRef.current?.click()} disabled={upload.isPending}>
          <Camera className="h-4 w-4" />
          Change photo
        </Button>
        <p className="mt-2 text-[13px] text-muted-foreground">
          JPG or PNG, up to 5MB.
        </p>
      </div>
    </div>
  );
};

/**
 * Account settings: a side list of sections and the open one beside it, like
 * the dashboards it opens from. On a phone the list comes first and a section
 * opens over it with a back button.
 */
export const SettingsDialog = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const router = useRouter();
  const [section, setSection] = useState<Section>("profile");
  /* Phones only: whether a section is open over the list. Wider screens always show both. */
  const [detailOpen, setDetailOpen] = useState(false);
  const profileQuery = useProfile();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  /* The form is derived, not synced: saved values come from the query and
     edits layer on top. Untouched fields therefore pick up a refetch, and no
     effect has to copy server state into local state. */
  const [edits, setEdits] = useState<Partial<ProfileForm>>({});
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "" });

  const profile = profileQuery.data;

  const form: ProfileForm = {
    fullName: edits.fullName ?? profile?.fullName ?? "",
    title: edits.title ?? profile?.title ?? "",
    bio: edits.bio ?? profile?.bio ?? "",
    phoneNumber: edits.phoneNumber ?? profile?.phoneNumber ?? "",
    state: edits.state ?? profile?.state ?? "",
    avatarUrl: edits.avatarUrl ?? profile?.avatarUrl ?? "",
  };

  const setForm = (patch: Partial<ProfileForm>) => setEdits((current) => ({ ...current, ...patch }));

  /* Closing resets the dialog for its next open, without an effect. */
  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setSection("profile");
      setDetailOpen(false);
      setPasswords({ currentPassword: "", newPassword: "" });
    }

    onOpenChange(next);
  };

  const openSection = (next: Section) => {
    setSection(next);
    setDetailOpen(true);
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
      setEdits({});
      toast.success("Profile saved");
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
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Couldn't change your password"));
    }
  };

  const current = SECTIONS.find((item) => item.id === section) ?? SECTIONS[0];
  const profileDirty = Object.keys(edits).length > 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showClose={false}
        className={cn(
          "flex max-w-[820px] flex-col overflow-hidden rounded-[32px] border-[1.5px] border-border bg-background p-0 shadow-[0_24px_60px_-24px_rgba(22,21,15,0.4)] sm:h-[min(640px,90vh)] sm:flex-row",
          /* A phone's list sizes to its rows; an open section needs the full height for its scroll and save bar. */
          detailOpen && "h-[min(640px,90vh)]",
        )}
      >
        {/* The list. Always on wide screens; on a phone it hides while a section is open. */}
        <nav
          aria-label="Settings sections"
          className={cn("flex min-h-0 flex-col gap-1 p-3 sm:w-[268px] sm:shrink-0 sm:border-r-[1.5px] sm:border-border", detailOpen ? "hidden sm:flex" : "flex flex-1")}
        >
          <div className="flex items-center justify-between px-3 pt-3 pb-5">
            <DialogTitle style={{ lineHeight: 0.95 }} className="text-[34px] font-extrabold tracking-[-0.045em]">
              <span className="text-primary">settings.</span>
            </DialogTitle>
            <CloseButton className="sm:hidden" />
          </div>

          {SECTIONS.map((item) => {
            const active = item.id === section;
            return (
              <button
                key={item.id}
                type="button"
                aria-current={active ? "page" : undefined}
                onClick={() => openSection(item.id)}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-3 rounded-[20px] p-2 text-left transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  active ? "sm:bg-secondary" : "hover:bg-secondary",
                )}
              >
                <MenuTile icon={item.icon} tone={item.tone} />
                <MenuLabel title={item.title} description={item.description} />
                <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground sm:hidden" />
              </button>
            );
          })}

          <div className="mt-4 flex items-center gap-3 rounded-[20px] border-[1.5px] border-border p-2.5 sm:mt-auto">
            <Avatar size="lg">
              <AvatarImage src={profile?.avatarUrl} />
              <AvatarFallback>{(profile?.fullName ?? "V").charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-bold">{profile?.fullName ?? "…"}</span>
              <span className="truncate text-xs text-muted-foreground">{profile?.email ?? "…"}</span>
            </span>
          </div>
        </nav>

        <div className={cn("min-h-0 min-w-0 flex-1 flex-col", detailOpen ? "flex" : "hidden sm:flex")}>
          <header className="flex items-start gap-3 px-5 pt-5 pb-2 sm:px-7 sm:pt-7">
            <button
              type="button"
              aria-label="Back to settings"
              onClick={() => setDetailOpen(false)}
              className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border-[1.5px] border-border transition-colors hover:border-foreground sm:hidden"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <h3 style={{ lineHeight: 0.95 }} className="min-w-0 flex-1 pt-1 text-[clamp(28px,3vw,36px)] font-extrabold tracking-[-0.045em] sm:pt-0">
              {current.lead} <span className="text-primary">{current.accent}</span>
            </h3>
            <CloseButton className="hidden sm:flex" />
          </header>

          <div
            key={section}
            data-lenis-prevent
            className="min-h-0 flex-1 overflow-y-auto px-5 pt-4 pb-5 motion-safe:animate-in motion-safe:duration-200 motion-safe:fade-in sm:px-7"
          >
            {section === "profile" ? (
              profileQuery.isLoading ? (
                <div className="flex flex-col gap-4">
                  <Skeleton className="h-20 w-full rounded-[22px]" />
                  <Skeleton className="h-12 w-full rounded-2xl" />
                  <Skeleton className="h-12 w-full rounded-2xl" />
                </div>
              ) : (
                <div className="flex flex-col gap-5">
                  <AvatarUpload value={form.avatarUrl} name={form.fullName || "V"} onChange={(url) => setForm({ avatarUrl: url })} />

                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="block">
                      <FieldLabel>Full name</FieldLabel>
                      <OrganizerField value={form.fullName} onChange={(input) => setForm({ fullName: input.target.value })} maxLength={120} autoComplete="name" />
                    </label>
                    <label className="block">
                      <FieldLabel>Title</FieldLabel>
                      <OrganizerField value={form.title} onChange={(input) => setForm({ title: input.target.value })} placeholder="Event producer" maxLength={120} />
                    </label>
                  </div>

                  <label className="block">
                    <FieldLabel hint="Shows on your public profile.">Bio</FieldLabel>
                    <OrganizerTextarea value={form.bio} rows={3} maxLength={280} placeholder="A line about what you put on." onChange={(input) => setForm({ bio: input.target.value })} />
                  </label>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="block">
                      <FieldLabel>Phone</FieldLabel>
                      <OrganizerField
                        value={form.phoneNumber}
                        inputMode="tel"
                        autoComplete="tel"
                        maxLength={32}
                        onChange={(input) => setForm({ phoneNumber: input.target.value })}
                      />
                    </label>
                    <label className="block">
                      <FieldLabel>State</FieldLabel>
                      <span className="relative block">
                        <select value={form.state} onChange={(input) => setForm({ state: input.target.value })} className={SELECT_FIELD}>
                          <option value="">Select…</option>
                          {NIGERIAN_STATES.map((state) => (
                            <option key={state} value={state}>
                              {state}
                            </option>
                          ))}
                        </select>
                        <ChevronDown aria-hidden="true" className="pointer-events-none absolute top-1/2 right-4 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      </span>
                    </label>
                  </div>
                </div>
              )
            ) : null}

            {section === "password" ? (
              <div className="flex max-w-md flex-col gap-5">
                <p className="text-[15px] text-muted-foreground">You&apos;ll stay signed in here. Other devices keep working until their session ends.</p>
                <label className="block">
                  <FieldLabel>Current password</FieldLabel>
                  <OrganizerField
                    type="password"
                    value={passwords.currentPassword}
                    autoComplete="current-password"
                    onChange={(input) => setPasswords((value) => ({ ...value, currentPassword: input.target.value }))}
                  />
                </label>
                <label className="block">
                  <FieldLabel hint="At least 8 characters.">New password</FieldLabel>
                  <OrganizerField
                    type="password"
                    value={passwords.newPassword}
                    autoComplete="new-password"
                    onChange={(input) => setPasswords((value) => ({ ...value, newPassword: input.target.value }))}
                  />
                </label>
              </div>
            ) : null}

            {section === "developer" ? (
              <div className="flex flex-col gap-2.5">
                <p className="mb-2 text-[15px] text-muted-foreground">Pull your events, tickets and sales into your own tools.</p>
                <LinkRow icon={Key} tone="yellow" title="API keys" description="Create, reveal and revoke keys" onClick={() => go("/developers/keys")} />
                <LinkRow icon={BookOpen} tone="pink" title="Documentation" description="Every endpoint, with examples" onClick={() => go("/developers/docs")} />
                <LinkRow icon={TerminalSquare} tone="blue" title="Sandbox" description="Try a request without writing code" onClick={() => go("/developers/sandbox")} />
              </div>
            ) : null}
          </div>

          {section === "profile" && !profileQuery.isLoading ? (
            <footer className="flex items-center justify-end gap-2 border-t-[1.5px] border-border px-5 py-4 sm:px-7">
              {profileDirty ? (
                <Button variant="ghost" onClick={() => setEdits({})} disabled={updateProfile.isPending}>
                  Discard
                </Button>
              ) : null}
              <Button variant="ink" loading={updateProfile.isPending} disabled={!profileDirty || form.fullName.trim().length < 2} onClick={saveProfile}>
                Save changes
              </Button>
            </footer>
          ) : null}

          {section === "password" ? (
            <footer className="flex items-center justify-end border-t-[1.5px] border-border px-5 py-4 sm:px-7">
              <Button variant="ink" loading={changePassword.isPending} disabled={!passwords.currentPassword || passwords.newPassword.length < 8} onClick={savePassword}>
                Change password
              </Button>
            </footer>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const CloseButton = ({ className }: { className?: string }) => (
  <DialogClose
    aria-label="Close settings"
    className={cn(
      "flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full border-[1.5px] border-border transition-colors hover:border-foreground",
      className,
    )}
  >
    <X className="h-4 w-4" />
  </DialogClose>
);
