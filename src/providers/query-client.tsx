"use client";

import { getQueryClient } from "@/lib/get-query-client";
import { QueryClientProvider as ReactQueryClientProvider } from "@tanstack/react-query";
import type * as React from "react";

export default function QueryClientProvider({ children }: { children: React.ReactNode }) {
  const queryClient = getQueryClient();

  return <ReactQueryClientProvider client={queryClient}>{children}</ReactQueryClientProvider>;
}
