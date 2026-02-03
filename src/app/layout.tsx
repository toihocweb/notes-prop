import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";

const outfit = Outfit({
    subsets: ["latin"],
    variable: "--font-outfit",
});

export const metadata: Metadata = {
    title: "Notes Pro - Quản lý ghi chú chuyên nghiệp",
    description: "Ứng dụng ghi chú chuyên nghiệp với editor giàu tính năng, hỗ trợ đa chủ đề và PWA",
    manifest: "/manifest.json",
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "Notes Pro",
    },
    keywords: ["notes", "ghi chú", "editor", "productivity", "pwa"],
    authors: [{ name: "Notes Pro Team" }],
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    themeColor: "#f59e0b",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="vi" className={outfit.variable} suppressHydrationWarning>
            <head>
                <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
                <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png" />
                <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="default" />
            </head>
            <body className="font-sans">
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                    <TooltipProvider delayDuration={200}>
                        {children}
                    </TooltipProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
