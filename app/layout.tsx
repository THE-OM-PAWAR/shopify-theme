import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FrameCraft - Premium Photo Frames & Custom Framing',
  description: 'Discover our collection of premium photo frames and create custom frames with your photos. Handcrafted with sustainable materials.',
  keywords: 'photo frames, custom framing, picture frames, handcrafted frames, sustainable materials',
  authors: [{ name: 'FrameCraft' }],
  openGraph: {
    title: 'FrameCraft - Premium Photo Frames & Custom Framing',
    description: 'Discover our collection of premium photo frames and create custom frames with your photos.',
    url: 'https://framecraft.com',
    siteName: 'FrameCraft',
    images: [
      {
        url: 'https://images.pexels.com/photos/1070945/pexels-photo-1070945.jpeg?auto=compress&cs=tinysrgb&w=1200',
        width: 1200,
        height: 630,
        alt: 'FrameCraft Premium Photo Frames',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FrameCraft - Premium Photo Frames & Custom Framing',
    description: 'Discover our collection of premium photo frames and create custom frames with your photos.',
    images: ['https://images.pexels.com/photos/1070945/pexels-photo-1070945.jpeg?auto=compress&cs=tinysrgb&w=1200'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}