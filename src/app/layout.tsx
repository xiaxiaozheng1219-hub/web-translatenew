import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '个人翻译工作台',
  description: '专为个人日常跨语言交流打造的轻量翻译工作台',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}