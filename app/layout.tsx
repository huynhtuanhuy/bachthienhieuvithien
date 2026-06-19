import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "\"BÁCH THIỆN HIẾU VI TIÊN\" – LỄ TRI ÂN CHA MẸ, ĐÀ NẴNG 2026",
  description: "Đăng ký tham gia Lễ tri ân Cha Mẹ 2026",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={roboto.className}>{children}</body>
    </html>
  );
}
