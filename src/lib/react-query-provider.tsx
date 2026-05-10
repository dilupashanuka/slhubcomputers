"use client";

// =============================================================================
// SL HUB COMPUTER - React Query Provider
// =============================================================================
// Purpose: Configure TanStack React Query for client-side caching & state
// Features:
//   - Stale time: 30 seconds (data considered fresh)
//   - Cache time: 5 minutes (garbage collected after)
//   - Refetch on window focus for real-time feel
//   - Retry: 1 (quick failure, don't keep users waiting)
// =============================================================================

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function ReactQueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data is considered fresh for 30 seconds
            staleTime: 30 * 1000,
            // Unused data is garbage collected after 5 minutes
            gcTime: 5 * 60 * 1000,
            // Refetch when the user comes back to the tab
            refetchOnWindowFocus: true,
            // Only retry once - don't keep users waiting
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
