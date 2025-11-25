"use client";

import { ClerkProvider } from "@clerk/nextjs";
import ClientProvider from "./ClientProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <ClerkProvider>
    <ClientProvider>
      {children}
    </ClientProvider>
  </ClerkProvider>;
}
