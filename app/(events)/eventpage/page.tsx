"use client"
import dynamic from 'next/dynamic';

const WebcamCanvas = dynamic(
  () => import('@/components/WebcamCanvas'),
  { ssr: false }
);

export default function Home() {
  return <WebcamCanvas />;
}
