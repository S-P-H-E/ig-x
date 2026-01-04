import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

export const revalidate = 0;

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "ig-x",
	description: "Programmatically send DMs on Instagram.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${geistSans.variable} antialiased`}>
        {children}
      </body>
		</html>
	);
}