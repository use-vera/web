import VendorWorkspaceShell from "@/components/vendors/vendor-workspace-shell";

/**
 * The vendor workspace. Web only: vendors manage their business here, the way
 * organizers do at /organizer. The app is for buying.
 */
export default function VendorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <VendorWorkspaceShell>{children}</VendorWorkspaceShell>;
}
