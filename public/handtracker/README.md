<div align="center">

# [Hand-Tracker](https://thatsinewave.github.io/Hand-Tracker)

![Hand-Tracker](https://raw.githubusercontent.com/ThatSINEWAVE/Hand-Tracker/refs/heads/main/.github/SCREENSHOTS/Hand-Tracker.png)

Hand Tracker is a web application that uses MediaPipe's Hand Tracking solution to detect and recognize hand gestures in real-time through your device's camera. The application provides visual feedback, finger counting, and gesture recognition with a clean, responsive interface.

</div>

## Features

- Real-time hand tracking with landmark visualization
- Finger counting (0-5 fingers per hand)
- Gesture recognition (OK sign, rock on, fist, open hand, thumbs up/down, etc.)
- Multiple camera support with device selection
- Detailed hand data display (landmark coordinates, confidence scores)
- Visual finger representation
- Responsive design that works on desktop and mobile devices

## How It Works

The application uses:
- MediaPipe Hands for hand landmark detection
- Custom algorithms for finger counting and gesture recognition
- WebRTC for camera access
- Canvas API for real-time drawing of hand landmarks

## Installation

To run locally:

1. Clone the repository:
   ```bash
   git clone https://github.com/ThatSINEWAVE/hand-tracker.git
   ```

2. Open `index.html` in your browser (no server required as it uses CDN resources)

## Usage

1. Click "Start Tracking" to begin
2. Allow camera access when prompted
3. Show your hand to the camera
4. View real-time tracking, finger count, and gesture recognition
5. Click "Stop Tracking" when finished

## File Structure

```
hand-tracker/
├── index.html          # Main HTML file
├── script.js           # Main JavaScript logic
├── style.css           # Styling
└── site-data/          # Static assets
    ├── favicon.ico
    ├── apple-touch-icon.png
    └── ...
```

## Dependencies

- [MediaPipe Hands](https://google.github.io/mediapipe/solutions/hands.html)
- [Font Awesome](https://fontawesome.com/) for icons
- Modern browser with WebRTC support

## Browser Support

The application works best on Chrome, Firefox, Edge, and other modern browsers that support:
- WebRTC
- ES6 JavaScript
- CSS Flexbox/Grid

## Contributing

Contributions are welcome! If you want to contribute, feel free to fork the repository, make your changes, and submit a pull request.

## License

This project is licensed under the GPL-3.0 License - see the [LICENSE](LICENSE) file for details.
