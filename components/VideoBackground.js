// components/VideoBackground.js
import React from 'react';
import styles from './VideoBackground.module.css';

const VideoBackground = () => {
  return (
    <div className={styles.videoContainer}>
      <video className={styles.video} autoPlay loop muted>
        <source src="/videos/1.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className={styles.overlay}></div>
    </div>
  );
};

export default VideoBackground;
