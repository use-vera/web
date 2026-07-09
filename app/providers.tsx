"use client";

import { AuthModalProvider } from "@/components/auth/auth-modal-provider";
import SmoothScrollProvider from "@/components/smooth-scroll-provider";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

const Providers = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <SmoothScrollProvider>
        <AuthModalProvider>{children}</AuthModalProvider>
      </SmoothScrollProvider>
      <Toaster />
    </QueryClientProvider>
  );
};

export default Providers;
