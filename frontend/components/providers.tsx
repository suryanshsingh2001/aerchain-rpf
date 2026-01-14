'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    // <NextThemesProvider
    //   attribute="class"
    //   defaultTheme="light"
    //   disableTransitionOnChange
    // >
      <TooltipProvider>
        {children}
        <Toaster position="top-right" richColors />
      </TooltipProvider>
    // </NextThemesProvider>
  );
}
