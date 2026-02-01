import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Play, Clock, Flame, Users } from 'lucide-react'
import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'

export interface GameCardProps {
  id: string
  title: string
  description: string
  icon: LucideIcon
  difficulty: 'Easy' | 'Medium' | 'Hard'
  duration: string
  calories: string
  players: string
  color: string
  link: string
  isLocked?: boolean
}

export function GameCard({
  id,
  title,
  description,
  icon: Icon,
  difficulty,
  duration,
  calories,
  players,
  color,
  link,
  isLocked = false,
}: GameCardProps) {
  const difficultyColors = {
    Easy: 'bg-chart-1/10 text-chart-1 border-chart-1/20',
    Medium: 'bg-accent/10 text-accent border-accent/20',
    Hard: 'bg-destructive/10 text-destructive border-destructive/20',
  }

  return (
    <div className="group relative rounded-2xl bg-card border border-border overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5">
      {/* Color accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${color}`} />
      
      {/* Content */}
      <div className="p-6">
        {/* Icon and Badge */}
        <div className="flex items-start justify-between mb-4">
          <div className={`w-14 h-14 rounded-xl ${color} bg-opacity-20 flex items-center justify-center`}>
            <Icon className="w-7 h-7 text-foreground" />
          </div>
          <Badge variant="outline" className={difficultyColors[difficulty]}>
            {difficulty}
          </Badge>
        </div>

        {/* Title and Description */}
        <h3 className="font-serif text-xl font-bold mb-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed mb-4">
          {description}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-6">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <Flame className="w-3.5 h-3.5" />
            <span>{calories}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            <span>{players}</span>
          </div>
        </div>

        {/* Play Button */}
        {isLocked ? (
          <Button disabled className="w-full" variant="secondary">
            Coming Soon
          </Button> 
        ) : (
          <Button asChild className="w-full group/btn">
<<<<<<< HEAD
            <Link href={`/${link}`}>
=======
            <Link href={`${link}`}>
>>>>>>> 9f132844b668bd7384662840e569caab250e03cb
              <Play className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform" />
              Play Now
            </Link>
          </Button>
        )}
      </div>

      {/* Hover glow effect */}
      <div className={`absolute inset-0 ${color} opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none`} />
    </div>
  )
}
