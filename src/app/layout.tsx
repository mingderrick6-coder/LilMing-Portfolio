import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LilMing Portfolio",
  description: "Editable motion designer portfolio framework inspired by pacomepertant.com",
  icons: { icon: "/favicon-lilming.png" }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
