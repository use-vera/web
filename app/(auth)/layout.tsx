/**
 * Auth pages are their own surface: no site header or footer, so the page is
 * the form and the events beside it, with nothing else to click.
 */
export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="flex flex-1 flex-col">{children}</div>;
}
