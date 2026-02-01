import { Hand, Target, Swords, Music, Dumbbell, Bird } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface Game {
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
  comingSoon?: boolean
}

export const games: Game[] = [
  {
    id: 'catch-the-fruit',
    title: 'Catch the Fruit',
    description: 'Move your hands to catch falling fruits. Speed increases as you score more points!',
    icon: Hand,
    difficulty: 'Easy',
    duration: '2-5 min',
    calories: '50-100',
    players: '1 Player',
    color: 'bg-chart-1',
    comingSoon: true,
    link: '/game1/index.html',
  },
  {
    id: 'punch-targets',
    title: 'Punch the Targets',
    description: 'Use your fists to punch targets that appear on screen. Build combos for bonus points!',
    icon: Target,
    difficulty: 'Medium',
    duration: '1 min',
    calories: '80-120',
    players: '1 Player',
    color: 'bg-accent',
    link: '/game2/index.html',
  },
  {
    id: 'dodge-master',
    title: 'Dodge Master',
    description: 'Duck, jump, and weave to avoid incoming obstacles. How long can you survive?',
    icon: Swords,
    difficulty: 'Hard',
    duration: '2-4 min',
    calories: '100-150',
    players: '1 Player',
    color: 'bg-chart-4',
    comingSoon: true,
    link: '/game3/index.html',
  },
  {
    id: 'rhythm-move',
    title: 'Rhythm Move',
    description: 'Follow the beat and match poses to the music. Perfect for dance lovers!',
    icon: Music,
    difficulty: 'Medium',
    duration: '3-6 min',
    calories: '120-200',
    players: '1-2 Players',
    color: 'bg-chart-3',
    comingSoon: true,
    link: '/game4/index.html',
  },
  {
    id: 'fitness-challenge',
    title: 'Fitness Challenge',
    description: 'Complete exercises like squats, jumping jacks, and stretches. Get fit while gaming!',
    icon: Dumbbell,
    difficulty: 'Hard',
    duration: '5-10 min',
    calories: '150-300',
    players: '1 Player',
    color: 'bg-destructive',
    isLocked: true,
    link: '/game5/index.html',
  },
  {
    id: 'flappy-arms',
    title: 'Flappy Arms',
    description: 'Flap your arms like a bird to fly through obstacles. A fun twist on the classic!',
    icon: Bird,
    difficulty: 'Easy',
    duration: '2-5 min',
    calories: '60-100',
    players: '1 Player',
    color: 'bg-chart-5',
    isLocked: true,
    link: '/game6/index.html',
  },
]
