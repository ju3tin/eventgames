// pages/page.tsx
import WebcamCanvas from '@/components/WebcamCanvas';

const Page = () => {
  return (
    <div>
      <h1 style={{ textAlign: 'center', marginTop: '20px' }}>Webcam Canvas</h1>
      <WebcamCanvas />
    </div>
  );
};

export default Page;
