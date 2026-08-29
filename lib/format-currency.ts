export const formatNaira = (amountNaira: number) => {
  if (amountNaira <= 0) {
    return "Free";
  }

  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amountNaira);
};

/**
 * Like formatNaira but never collapses zero to "Free". A revenue figure of
 * ₦0 is a real number, not a free ticket.
 */
export const formatNairaAmount = (amountNaira: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amountNaira);

/** Compact form for dashboard tiles: ₦6.2M, ₦645K, ₦900. */
export const formatNairaCompact = (amountNaira: number) => {
  const abs = Math.abs(amountNaira);

  if (abs >= 1_000_000) {
    return `₦${(amountNaira / 1_000_000).toFixed(abs >= 10_000_000 ? 0 : 1)}M`;
  }

  if (abs >= 1_000) {
    return `₦${(amountNaira / 1_000).toFixed(abs >= 100_000 ? 0 : 1)}K`;
  }

  return `₦${Math.round(amountNaira)}`;
};
