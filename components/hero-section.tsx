'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ArrowRight, Zap } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-chart-3/10 rounded-full blur-3xl" />
      </div>

      {/* Grid pattern overlay */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      <div className="relative z-10 container mx-auto px-4 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">Powered by TensorFlow</span>
        </div>

        {/* Main heading */}
        <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6">
          <span className="text-foreground">Move Your</span>
          <br />
          <span className="bg-gradient-to-r from-primary via-chart-3 to-accent bg-clip-text text-transparent">
            Body to Play
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
          Experience the future of gaming. Use your body movements to control games 
          with real-time pose detection. No controllers needed.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild size="lg" className="text-lg px-8 py-6 group">
            <Link href="/auth/login">
              Start Playing
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 bg-transparent">
            <Link href="#how-it-works">
              How It Works
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-3 gap-8 max-w-xl mx-auto">
          {[
            { value: '6+', label: 'Mini Games' },
            { value: '30fps', label: 'Real-time' },
            { value: '17', label: 'Body Points' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl md:text-4xl font-bold font-serif text-primary">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating pose silhouette decoration */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl opacity-10">
        <svg viewBox="0 0 400 200" className="w-full h-auto">
          <g stroke="currentColor" strokeWidth="2" fill="none" className="text-primary">
            {/* Simplified human pose lines */}
            <circle cx="200" cy="30" r="15" />
            <line x1="200" y1="45" x2="200" y2="100" />
            <line x1="200" y1="60" x2="150" y2="90" />
            <line x1="200" y1="60" x2="250" y2="90" />
            <line x1="200" y1="100" x2="160" y2="160" />
            <line x1="200" y1="100" x2="240" y2="160" />
          </g>
        </svg>
      </div>
    </section>
  )
}
