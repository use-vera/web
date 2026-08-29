/**
 * Cloudinary serves derived images from transforms in the URL path, so one
 * stored original can be delivered at whatever ratio each surface needs
 * instead of every surface cropping the same file differently in CSS.
 *
 * Non-Cloudinary URLs pass through untouched. Seed data and older uploads
 * still render, just without the derivation.
 */
const CLOUDINARY_HOST = "res.cloudinary.com";
const UPLOAD_SEGMENT = "/upload/";

export type ImageVariant = "hero" | "card" | "thumb" | "square";

/**
 * `c_fill` crops rather than letterboxes, and `g_auto` picks the subject, so a
 * face survives a 16:9 crop that would otherwise cut it off. `f_auto,q_auto`
 * let Cloudinary pick the format and quality per browser.
 */
const VARIANTS: Record<ImageVariant, string> = {
  hero: "c_fill,g_auto,ar_16:9,w_1600,f_auto,q_auto",
  card: "c_fill,g_auto,ar_16:9,w_800,f_auto,q_auto",
  thumb: "c_fill,g_auto,ar_1:1,w_200,f_auto,q_auto",
  square: "c_fill,g_auto,ar_1:1,w_600,f_auto,q_auto",
};

export const cloudinaryVariant = (
  url: string | undefined | null,
  variant: ImageVariant,
): string | undefined => {
  if (!url) {
    return undefined;
  }

  try {
    if (new URL(url).hostname !== CLOUDINARY_HOST) {
      return url;
    }
  } catch {
    return url;
  }

  const index = url.indexOf(UPLOAD_SEGMENT);

  if (index === -1) {
    return url;
  }

  const head = url.slice(0, index + UPLOAD_SEGMENT.length);
  const tail = url.slice(index + UPLOAD_SEGMENT.length);

  /* Don't stack a second transform onto a URL that already carries one. */
  if (/^[a-z]{1,3}_[^/]+\//.test(tail)) {
    return url;
  }

  return `${head}${VARIANTS[variant]}/${tail}`;
};

/** The ratio every event cover is cropped to at upload. */
export const COVER_ASPECT = 16 / 9;
