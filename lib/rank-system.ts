// Rank system based on total XP earned
export interface Rank {
  name: string
  minXP: number
  maxXP: number
  level: number
}

export const RANKS: Rank[] = [
  { name: 'Novice', minXP: 0, maxXP: 499, level: 1 },
  { name: 'Beginner', minXP: 500, maxXP: 999, level: 5 },
  { name: 'Rising Star', minXP: 1000, maxXP: 2499, level: 10 },
  { name: 'Skilled', minXP: 2500, maxXP: 4999, level: 15 },
  { name: 'Expert', minXP: 5000, maxXP: 9999, level: 20 },
  { name: 'Master', minXP: 10000, maxXP: 19999, level: 30 },
  { name: 'Champion', minXP: 20000, maxXP: 39999, level: 40 },
  { name: 'Legend', minXP: 40000, maxXP: 79999, level: 50 },
  { name: 'Mythic', minXP: 80000, maxXP: 149999, level: 60 },
  { name: 'Immortal', minXP: 150000, maxXP: Infinity, level: 70 },
]

export function getRankFromXP(totalXP: number): Rank {
  for (const rank of RANKS) {
    if (totalXP >= rank.minXP && totalXP <= rank.maxXP) {
      return rank
    }
  }
  return RANKS[0] // Default to Novice
}

export function getLevelFromXP(totalXP: number): number {
  // Level = floor(sqrt(totalXP / 50)) + 1
  return Math.floor(Math.sqrt(totalXP / 50)) + 1
}

export function getXPForLevel(level: number): number {
  // Inverse of level formula: XP = (level - 1)^2 * 50
  return Math.pow(level - 1, 2) * 50
}

export function getXPToNextLevel(currentXP: number): number {
  const currentLevel = getLevelFromXP(currentXP)
  const nextLevelXP = getXPForLevel(currentLevel + 1)
  return nextLevelXP - currentXP
}

export function getCurrentLevelXP(currentXP: number): number {
  const currentLevel = getLevelFromXP(currentXP)
  const currentLevelBaseXP = getXPForLevel(currentLevel)
  return currentXP - currentLevelBaseXP
}
