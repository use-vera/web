import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const ROUTES = Object.freeze({
  DOWNLOAD: "/download",
  TICKETS: "/tickets",
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
