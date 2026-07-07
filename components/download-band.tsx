import QrCodePlaceholder from "@/components/qr-code-placeholder";
import AppStore from "./assets/other/app-store.";
import PlayStore from "./assets/other/play-store";

const DownloadBand = () => {
  return (
    <section className="mx-auto max-w-6xl sm:px-6 sm:py-20">
      <div className="dark grid overflow-hidden rounded-3xl bg-background text-foreground md:grid-cols-[1.3fr_auto_1fr]">
        <div className="flex flex-col items-start gap-6 p-10 sm:p-12">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Get Vera on your phone.
          </h2>
          <p className="max-w-sm text-muted-foreground">
            Browse events, hold your ticket, and post the moment after, all from
            one app.
          </p>

          <div className="flex flex-col items-start gap-3 sm:flex-row">
            <AppStore />
            <PlayStore />
          </div>
        </div>

        <div className="ticket-perforation-vertical hidden md:block" />

        <div className="flex flex-col items-center justify-center gap-3 border-t border-border p-10 md:border-t-0">
          <QrCodePlaceholder className="h-38 w-38 sm:h-64 sm:w-64" />
          <span className="text-xs font-semibold text-muted-foreground">
            Scan to download
          </span>
        </div>
      </div>
    </section>
  );
};

export default DownloadBand;
