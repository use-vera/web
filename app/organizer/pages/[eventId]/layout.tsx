import { PAGE_FONT_VARIABLES } from "@/lib/page-fonts";
import { type ReactNode } from "react";

/*
 * The preview renders the same blocks the published page does, so it needs the
 * same families in scope. Without this an organizer would be choosing type
 * they cannot see until they publish.
 */
const PageBuilderLayout = ({ children }: { children: ReactNode }) => (
  <div className={`${PAGE_FONT_VARIABLES} h-full`}>{children}</div>
);

export default PageBuilderLayout;
