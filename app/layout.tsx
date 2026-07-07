import type { Metadata } from "next";
import localFont from "next/font/local";
import { ViewTransition } from "react";
import "./globals.css";
import Providers from "./providers";

const gilroy = localFont({
  variable: "--font-gilroy",
  display: "swap",
  src: [
    {
      path: "./fonts/gilroy/Gilroy-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/gilroy/Gilroy-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/gilroy/Gilroy-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/gilroy/Gilroy-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/gilroy/Gilroy-ExtraBold.ttf",
      weight: "800",
      style: "normal",
    },
  ],
});

const title = "Vera | Buy the ticket. Keep the moment.";
const description =
  "Vera is where you find events, grab tickets safely, and relive them through the moments your circle shares.";

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    siteName: "Vera",
    type: "website",
    locale: "en_NG",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${gilroy.variable} font-sans h-full antialiased`}
    >
      <head>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/brand/apple-touch-icon-180.png"
        />
        <link rel="icon" type="image/svg+xml" href="/brand/favicon.svg" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className="min-h-full flex flex-col">
        <Providers>
          <ViewTransition>{children}</ViewTransition>
        </Providers>
      </body>
    </html>
  );
}
