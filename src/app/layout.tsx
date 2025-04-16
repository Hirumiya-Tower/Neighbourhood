import "@mantine/core/styles.css";
import {
	MantineProvider,
	ColorSchemeScript,
	mantineHtmlProps,
} from "@mantine/core";
import { Geist, Geist_Mono } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import Sidebar from "@/ui/navigation";
import "../ui/globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="ja" {...mantineHtmlProps}>
			<head>
				<ColorSchemeScript />
			</head>
			<SessionProvider>
				<body
					className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0f3d33] text-gray-100`}
				>
					<div className="flex flex-col md:flex-row h-screen overflow-hidden">
						<Sidebar />
						<main className="flex-grow p-2 md:p-4 overflow-y-auto">
							<MantineProvider>{children}</MantineProvider>
							<Toaster richColors position={"bottom-center"} />
						</main>
					</div>
				</body>
			</SessionProvider>
		</html>
	);
}
