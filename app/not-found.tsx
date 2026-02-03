// app/not-found.tsx
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black flex flex-col items-center justify-center text-white px-6">
      <h1 className="text-8xl md:text-9xl font-bold mb-4 animate-pulse">404</h1>

      <div className="text-center max-w-lg">
        <h2 className="text-3xl md:text-4xl font-semibold mb-6">
          Oops! Page not found
        </h2>

        <p className="text-lg md:text-xl text-gray-300 mb-10">
          The page you're looking for seems to have taken an unexpected detour...
          maybe it's surfing somewhere else!
        </p>

        <Link
          href="/"
          className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-10 rounded-full text-lg transition-all transform hover:scale-105 shadow-lg"
        >
          Back to Home
        </Link>
      </div>

      {/* Optional: fun easter egg or animation */}
      <div className="mt-16 text-sm text-gray-500">
        Lost? Even trains sometimes miss the station.
      </div>
    </div>
  );
}

// Optional: better SEO & social sharing
export const metadata = {
  title: '404 - Page Not Found',
  description: "Looks like you've ventured off the tracks. Let's get you back!",
};