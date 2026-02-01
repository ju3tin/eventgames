import { Camera, Cpu, Gamepad2, Users, Wifi, Zap } from 'lucide-react'

const features = [
  {
    icon: Camera,
    title: 'Webcam Tracking',
    description: 'Uses your webcam to detect body movements in real-time with no additional hardware.',
  },
  {
    icon: Cpu,
    title: 'AI-Powered',
    description: 'TensorFlow.js pose detection identifies 17 key body points with high accuracy.',
  },
  {
    icon: Zap,
    title: 'Instant Response',
    description: 'Low-latency processing ensures your movements translate to game actions instantly.',
  },
  {
    icon: Gamepad2,
    title: 'Multiple Games',
    description: 'Choose from various mini games designed for different movement styles and fitness levels.',
  },
  {
    icon: Wifi,
    title: 'No Downloads Required',
    description: 'Play directly in your browser. No installations or plugins required.',
  },
  {
    icon: Users,
    title: 'For Everyone',
    description: 'Games suitable for all ages and fitness levels. Get active while having fun!',
  },
]

export function FeaturesSection() {
  return (
    <section id="how-it-works" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl md:text-5xl font-bold mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Our motion detection technology transforms your body into a game controller
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-serif text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}