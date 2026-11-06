import QrCodePlaceholder from "@/components/qr-code-placeholder";
import DisplayHeading from "@/components/vera/display-heading";
import AppStore from "./assets/other/app-store.";
import PlayStore from "./assets/other/play-store";

/**
 * The closing call to action on every public page: the app's sign-off line,
 * the store badges, and a code to scan from a laptop. Stays ink on both the
 * light and the dark (organizer and vendor) pages.
 */
const DownloadBand = () => {
  return (
    <section className="mx-auto max-w-[1240px] px-[clamp(16px,4vw,40px)] py-[clamp(48px,7vw,96px)]">
      <div className="dark flex flex-wrap items-center justify-between gap-10 rounded-[36px] bg-background p-[clamp(28px,5vw,64px)] text-foreground">
        <div className="flex min-w-0 flex-[1_1_420px] flex-col items-start gap-7">
          <DisplayHeading lead="your next plan is" accent="in here." breakBeforeAccent className="text-[clamp(44px,6vw,88px)]" />
          <p className="max-w-sm text-lg text-muted-foreground">Browse what&apos;s on, hold your ticket, and go with your friends, all from one app.</p>
          <div className="flex flex-wrap items-center gap-3">
            <AppStore />
            <PlayStore />
          </div>
        </div>
        <div className="flex flex-col items-center gap-3">
          <QrCodePlaceholder className="h-44 w-44 rounded-3xl p-3 sm:h-56 sm:w-56" />
          <span className="text-sm font-semibold text-muted-foreground">Scan to download</span>
        </div>
      </div>
    </section>
  );
};

export default DownloadBand;
