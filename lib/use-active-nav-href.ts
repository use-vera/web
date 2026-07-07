"use client";

import { usePathname } from "next/navigation";

/** Returns a matcher for nav-link active state, based on the current route. */
export const useActiveNavHref = () => {
  const pathname = usePathname();

  return (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };
};
