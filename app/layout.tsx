import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'ApexProof - Marathon SWE Agent Benchmark Engine',
  description: 'Frontier evaluation and deterministic benchmarking engine for AI software engineering coding agents on marathon tasks in complex real repositories.',
  openGraph: {
    title: 'ApexProof - Marathon SWE Agent Benchmark Engine',
    description: 'Frontier evaluation and deterministic benchmarking engine for AI software engineering coding agents on marathon tasks in complex real repositories.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ApexProof - Marathon SWE Agent Benchmark Engine',
    description: 'Frontier evaluation and deterministic benchmarking engine for AI software engineering coding agents on marathon tasks in complex real repositories.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
