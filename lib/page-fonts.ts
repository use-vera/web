import {
  Anton,
  Archivo,
  Archivo_Black,
  Barlow,
  Bebas_Neue,
  DM_Serif_Display,
  Fraunces,
  Karla,
  Libre_Baskerville,
  Lora,
  Nunito_Sans,
  Outfit,
  Playfair_Display,
  Sora,
  Space_Mono,
  Syne,
} from "next/font/google";

/*
 * next/font reads its arguments at build time, so every call needs a literal
 * object; a shared `...options` spread fails to compile. `preload: false`
 * because a page uses one pairing of twelve, and a browser only fetches a font
 * file once something renders in that family.
 */
const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-playfair",
});
const lora = Lora({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-lora",
});
const anton = Anton({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  weight: "400",
  variable: "--font-anton",
});
const archivo = Archivo({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-archivo",
});
const archivoBlack = Archivo_Black({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  weight: "400",
  variable: "--font-archivo-black",
});
const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-fraunces",
});
const nunito = Nunito_Sans({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-nunito",
});
const spaceMono = Space_Mono({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  weight: ["400", "700"],
  variable: "--font-space-mono",
});
const sora = Sora({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-sora",
});
const baskerville = Libre_Baskerville({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  weight: ["400", "700"],
  variable: "--font-baskerville",
});
const bebas = Bebas_Neue({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  weight: "400",
  variable: "--font-bebas",
});
const barlow = Barlow({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  weight: ["400", "500", "600", "700"],
  variable: "--font-barlow",
});
const syne = Syne({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-syne",
});
const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-outfit",
});
const dmSerif = DM_Serif_Display({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  weight: "400",
  variable: "--font-dm-serif",
});
const karla = Karla({
  subsets: ["latin"],
  display: "swap",
  preload: false,
  variable: "--font-karla",
});

export const PAGE_FONT_VARIABLES = [
  playfair,
  lora,
  anton,
  archivo,
  archivoBlack,
  fraunces,
  nunito,
  spaceMono,
  sora,
  baskerville,
  bebas,
  barlow,
  syne,
  outfit,
  dmSerif,
  karla,
]
  .map((font) => font.variable)
  .join(" ");
