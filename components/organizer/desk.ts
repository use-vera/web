/**
 * Page padding inside a dashboard desk. Kept out of organizer-primitives
 * (a "use client" module) so server pages can import the string itself
 * rather than a client reference, which would render as no class at all.
 */
export const DESK = "mx-auto w-full max-w-[1280px] px-[clamp(16px,3vw,40px)]";
