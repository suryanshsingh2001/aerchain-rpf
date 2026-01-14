import type { Metadata } from "next";
import { Raleway } from "next/font/google";
import "./globals.css";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { Providers } from "@/components/providers";
import { Separator } from "@/components/ui/separator";

const raleway = Raleway({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});



export const metadata: Metadata = {
  title: "RFP Manager - AI-Powered Procurement",
  description: "Streamline your procurement workflow with AI-powered RFP management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${raleway.variable} font-sans antialiased`}
      >
        <Providers>
          <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
              {children}
            </SidebarInset>
          </SidebarProvider>
        </Providers>
      </body>
    </html>
  );
}
