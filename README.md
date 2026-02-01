# Move Your Body to Play

**Experience the future of gaming — control games with your body movements!**  
No controllers. No keyboard. Just you and real-time pose detection.

https://github.com/your-username/move-your-body-to-play

<p align="center">
  <img src="https://via.placeholder.com/800x450.png?text=Gameplay+Demo+(replace+with+real+screenshot)" alt="Gameplay screenshot" width="800"/>
</p>

## 🎮 What is this?

A collection of fun, browser-based mini-games that use **TensorFlow.js** + **pose detection** (MoveNet or BlazePose) to track your body movements in real-time and turn them into game controls.

Wave your arms, jump, squat, dance — the game sees you and reacts instantly.

## ✨ Features

- Real-time human pose estimation right in the browser  
- No installation — works on phones, tablets, laptops with webcam  
- Multiple mini-games (growing collection!)  
- Clean, modern UI with mobile-friendly design  
- Built with TensorFlow.js + MoveNet (lightning/fast variant)  
- Optional webcam mirror / silhouette / skeleton debug view  

## 🎲 Included Games (so far)

| Game              | Control Style             | Difficulty | Status     |
|-------------------|---------------------------|------------|------------|
| Jump Duck         | Jump to avoid / duck      | ★★☆☆☆      | playable   |
| Air Drums         | Hit invisible drums       | ★☆☆☆☆      | fun demo   |
| Body Pong         | Move paddle with hip/shoulder | ★★★☆☆  | in progress|
| Shape Matcher     | Make shapes with arms     | ★★☆☆☆      | planned    |

(Feel free to add your own games via pull request!)

## 🚀 Live Demo

→ **[Try it live!](https://your-username.github.io/move-your-body-to-play/)** ←  
*(replace with your actual GitHub Pages link once deployed)*

Best experienced on a device with a **front-facing camera** and decent lighting.

## Tech Stack

- **TensorFlow.js** + **@tensorflow-models/pose-detection** (MoveNet Lightning)
- Vanilla JavaScript / HTML5 / Canvas
- p5.js or plain Canvas for game rendering (depending on game)
- Tailwind CSS or plain CSS for styling
- Vite / Parcel / static hosting

## Quick Start (Local Development)

```bash
# 1. Clone the repo
git clone https://github.com/your-username/move-your-body-to-play.git
cd move-your-body-to-play

# 2. Install dependencies (if using npm + Vite/Parcel)
npm install

# 3. Start development server
npm run dev

# → open http://localhost:5173 (or the port shown)