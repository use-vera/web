import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const ROUTES = Object.freeze({
  DOWNLOAD: "/download",
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
