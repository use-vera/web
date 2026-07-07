import SiteFooter from "@/components/site-footer";
import SiteHeader from "@/components/site-header";

export default function OrganizationLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="dark flex flex-1 flex-col bg-background text-foreground">
      <SiteHeader inverted />
      {children}
      <SiteFooter />
    </div>
  );
}
