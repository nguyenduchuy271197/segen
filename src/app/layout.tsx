import "./globals.css";
import type { Metadata } from "next";
import { Nunito_Sans } from "next/font/google";

const nunitoSans = Nunito_Sans({ subsets: ["vietnamese"] });

export const metadata: Metadata = {
  title: "EduSeries",
  description: "Tạo Series Kiến Thức với AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={nunitoSans.className}>{children}</body>
    </html>
  );
}
