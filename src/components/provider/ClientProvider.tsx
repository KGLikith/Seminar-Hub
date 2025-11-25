"use client"
import queryclient from "@/client/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export default function ClientProvider({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <QueryClientProvider client={queryclient}>
            {children}
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
};