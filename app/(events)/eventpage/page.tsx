// pages/page.tsx
"use client"
import Head from 'next/head';
import WebcamCanvas from '@/components/WebcamCanvas';

const Page = () => {
  return (
    <div>
       <Head>
        {/* Load TensorFlow.js from CDN */}
        <script
          src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@3.0.0/dist/tf.min.js"
          type="text/javascript"
        />
        {/* Load MoveNet model from TensorFlow.js */}
        <script
          src="https://cdn.jsdelivr.net/npm/@tensorflow-models/pose-detection@2.0.0/dist/pose-detection.min.js"
          type="text/javascript"
        />
      </Head>
      
      {/* <h1 style={{ textAlign: 'center', marginTop: '20px' }}>Webcam Canvas</h1> */}
      <WebcamCanvas />
    </div>
  );
};

export default Page;
