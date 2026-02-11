export interface GamerProfile {
  id: number;
  username: string;
  avatar: string;
  banner: string;
  level: number;
  rank: string;
  status: "online" | "offline" | "in-game";
  mainGame: string;
  wins: number;
  kd: number;
  bio: string;
  joinedDate: string;
  totalMatches: number;
  hoursPlayed: number;
  winRate: number;
  headshots: number;
  longestStreak: number;
  topAgent: string;
  recentGames: {
    game: string;
    result: "win" | "loss";
    score: string;
    kda: string;
    date: string;
  }[];
  achievements: {
    name: string;
    description: string;
    rarity: "common" | "rare" | "epic" | "legendary";
  }[];
  friends: number[];
}

export const PROFILES: GamerProfile[] = [
  {
    id: 1,
    username: "PhantomStrike",
    avatar: "/avatars/avatar-1.jpg",
    banner: "/banners/banner-1.jpg",
    level: 72,
    rank: "Diamond",
    status: "online",
    mainGame: "Valorant",
    wins: 1284,
    kd: 2.14,
    bio: "Ex-pro turned content creator. If you hear the Phantom, it's already too late.",
    joinedDate: "Mar 2023",
    totalMatches: 2410,
    hoursPlayed: 1847,
    winRate: 53.3,
    headshots: 8921,
    longestStreak: 14,
    topAgent: "Jett",
    recentGames: [
      { game: "Valorant", result: "win", score: "13-7", kda: "24/11/6", date: "2h ago" },
      { game: "Valorant", result: "win", score: "13-10", kda: "19/14/8", date: "5h ago" },
      { game: "Valorant", result: "loss", score: "11-13", kda: "17/16/3", date: "8h ago" },
      { game: "Valorant", result: "win", score: "13-4", kda: "28/6/4", date: "1d ago" },
      { game: "Valorant", result: "loss", score: "9-13", kda: "12/15/5", date: "1d ago" },
    ],
    achievements: [
      { name: "Ace Machine", description: "Get 50 Aces in competitive matches", rarity: "legendary" },
      { name: "Headhunter", description: "Achieve 70% headshot rate in a match", rarity: "epic" },
      { name: "Diamond Tier", description: "Reach Diamond rank", rarity: "rare" },
      { name: "Century Club", description: "Win 100 competitive matches", rarity: "common" },
    ],
    friends: [2, 3, 5, 6],
  },
  {
    id: 2,
    username: "NovaBlaze",
    avatar: "/avatars/avatar-2.jpg",
    banner: "/banners/banner-1.jpg",
    level: 58,
    rank: "Platinum",
    status: "in-game",
    mainGame: "Apex Legends",
    wins: 892,
    kd: 1.87,
    bio: "Bangalore main. Smoke out, squad wipe in. Let's get to Predator this split.",
    joinedDate: "Jun 2023",
    totalMatches: 1540,
    hoursPlayed: 1120,
    winRate: 57.9,
    headshots: 5430,
    longestStreak: 11,
    topAgent: "Bangalore",
    recentGames: [
      { game: "Apex Legends", result: "win", score: "1st", kda: "8/2/5", date: "30m ago" },
      { game: "Apex Legends", result: "loss", score: "5th", kda: "3/3/2", date: "2h ago" },
      { game: "Apex Legends", result: "win", score: "1st", kda: "11/1/4", date: "4h ago" },
      { game: "Apex Legends", result: "win", score: "2nd", kda: "6/2/7", date: "6h ago" },
      { game: "Apex Legends", result: "loss", score: "8th", kda: "2/3/1", date: "1d ago" },
    ],
    achievements: [
      { name: "Smoke Screen", description: "Block 1000 enemy sightlines with smoke", rarity: "epic" },
      { name: "Platinum Push", description: "Reach Platinum rank in Ranked", rarity: "rare" },
      { name: "Squad Leader", description: "Win 50 matches as Jump Master", rarity: "rare" },
      { name: "First Blood", description: "Get 500 first knocks in a match", rarity: "common" },
    ],
    friends: [1, 4, 7],
  },
  {
    id: 3,
    username: "VoidRunner",
    avatar: "/avatars/avatar-3.jpg",
    banner: "/banners/banner-1.jpg",
    level: 91,
    rank: "Radiant",
    status: "online",
    mainGame: "CS2",
    wins: 2103,
    kd: 3.21,
    bio: "Top 500 Radiant. Pure aim, zero excuses. Currently grinding FPL.",
    joinedDate: "Jan 2023",
    totalMatches: 3890,
    hoursPlayed: 3200,
    winRate: 54.1,
    headshots: 19200,
    longestStreak: 22,
    topAgent: "AWPer",
    recentGames: [
      { game: "CS2", result: "win", score: "16-9", kda: "31/12/4", date: "1h ago" },
      { game: "CS2", result: "win", score: "16-12", kda: "25/16/7", date: "3h ago" },
      { game: "CS2", result: "win", score: "16-5", kda: "28/7/2", date: "6h ago" },
      { game: "CS2", result: "loss", score: "14-16", kda: "22/18/5", date: "1d ago" },
      { game: "CS2", result: "win", score: "16-11", kda: "27/14/6", date: "1d ago" },
    ],
    achievements: [
      { name: "Radiant Legend", description: "Reach Radiant rank", rarity: "legendary" },
      { name: "AWP God", description: "Get 5000 AWP kills", rarity: "legendary" },
      { name: "Clutch King", description: "Win 100 1v3+ clutches", rarity: "epic" },
      { name: "Veteran", description: "Play 3000+ matches", rarity: "rare" },
    ],
    friends: [1, 5, 7, 8],
  },
  {
    id: 4,
    username: "CrimsonFury",
    avatar: "/avatars/avatar-4.jpg",
    banner: "/banners/banner-1.jpg",
    level: 45,
    rank: "Gold",
    status: "offline",
    mainGame: "Overwatch 2",
    wins: 567,
    kd: 1.42,
    bio: "Tank main trying to climb. If we lose, it was the DPS diff. Just kidding... mostly.",
    joinedDate: "Sep 2023",
    totalMatches: 980,
    hoursPlayed: 620,
    winRate: 57.9,
    headshots: 2100,
    longestStreak: 8,
    topAgent: "Reinhardt",
    recentGames: [
      { game: "Overwatch 2", result: "loss", score: "1-2", kda: "14/8/22", date: "3h ago" },
      { game: "Overwatch 2", result: "win", score: "2-0", kda: "18/5/30", date: "5h ago" },
      { game: "Overwatch 2", result: "win", score: "2-1", kda: "21/9/25", date: "1d ago" },
      { game: "Overwatch 2", result: "loss", score: "0-2", kda: "8/10/15", date: "1d ago" },
      { game: "Overwatch 2", result: "win", score: "2-0", kda: "16/4/28", date: "2d ago" },
    ],
    achievements: [
      { name: "Shield Wall", description: "Block 100,000 damage as a Tank", rarity: "epic" },
      { name: "Gold Standard", description: "Reach Gold rank", rarity: "common" },
      { name: "Team Player", description: "Average 20+ assists per match over 50 games", rarity: "rare" },
      { name: "Earthshatter", description: "Hit 5+ enemies with a single ultimate", rarity: "rare" },
    ],
    friends: [2, 6],
  },
  {
    id: 5,
    username: "ShadowMeld",
    avatar: "/avatars/avatar-5.jpg",
    banner: "/banners/banner-1.jpg",
    level: 83,
    rank: "Immortal",
    status: "in-game",
    mainGame: "League of Legends",
    wins: 1876,
    kd: 2.89,
    bio: "Mid lane assassin. I don't gank, I haunt. Climbing to Challenger this season.",
    joinedDate: "Feb 2023",
    totalMatches: 3200,
    hoursPlayed: 2400,
    winRate: 58.6,
    headshots: 0,
    longestStreak: 18,
    topAgent: "Zed",
    recentGames: [
      { game: "League of Legends", result: "win", score: "Victory", kda: "12/3/8", date: "45m ago" },
      { game: "League of Legends", result: "win", score: "Victory", kda: "8/4/11", date: "2h ago" },
      { game: "League of Legends", result: "loss", score: "Defeat", kda: "5/7/3", date: "4h ago" },
      { game: "League of Legends", result: "win", score: "Victory", kda: "15/2/6", date: "7h ago" },
      { game: "League of Legends", result: "win", score: "Victory", kda: "10/5/9", date: "1d ago" },
    ],
    achievements: [
      { name: "Immortal Ascent", description: "Reach Immortal rank in Solo Queue", rarity: "legendary" },
      { name: "Shadow Step", description: "Get 1000 solo kills on assassins", rarity: "epic" },
      { name: "Pentakill", description: "Score a Pentakill in ranked", rarity: "epic" },
      { name: "Lane Dominator", description: "Win lane in 80% of games over 100 matches", rarity: "rare" },
    ],
    friends: [1, 3, 7],
  },
  {
    id: 6,
    username: "NeonWretch",
    avatar: "/avatars/avatar-6.jpg",
    banner: "/banners/banner-1.jpg",
    level: 67,
    rank: "Diamond",
    status: "online",
    mainGame: "Fortnite",
    wins: 1045,
    kd: 1.96,
    bio: "Creative warrior and build battle enthusiast. Zero build is for casuals.",
    joinedDate: "Apr 2023",
    totalMatches: 2100,
    hoursPlayed: 1500,
    winRate: 49.8,
    headshots: 6780,
    longestStreak: 12,
    topAgent: "Builder",
    recentGames: [
      { game: "Fortnite", result: "win", score: "Victory Royale", kda: "9/0/2", date: "1h ago" },
      { game: "Fortnite", result: "loss", score: "Top 5", kda: "4/1/1", date: "3h ago" },
      { game: "Fortnite", result: "win", score: "Victory Royale", kda: "12/0/3", date: "5h ago" },
      { game: "Fortnite", result: "loss", score: "Top 10", kda: "3/1/0", date: "8h ago" },
      { game: "Fortnite", result: "win", score: "Victory Royale", kda: "7/0/4", date: "1d ago" },
    ],
    achievements: [
      { name: "Build Master", description: "Build 50,000 structures", rarity: "epic" },
      { name: "Victory Royale x1000", description: "Win 1000 matches", rarity: "legendary" },
      { name: "Diamond Builder", description: "Reach Diamond in competitive", rarity: "rare" },
      { name: "Sniper Elite", description: "Get 500 eliminations with snipers", rarity: "rare" },
    ],
    friends: [1, 4, 8],
  },
  {
    id: 7,
    username: "IronVanguard",
    avatar: "/avatars/avatar-7.jpg",
    banner: "/banners/banner-1.jpg",
    level: 99,
    rank: "Challenger",
    status: "offline",
    mainGame: "R6 Siege",
    wins: 3210,
    kd: 4.05,
    bio: "Tactical operator. 10,000+ hours and still going. Support main who frags.",
    joinedDate: "Jan 2023",
    totalMatches: 5500,
    hoursPlayed: 4200,
    winRate: 58.4,
    headshots: 24500,
    longestStreak: 26,
    topAgent: "Thatcher",
    recentGames: [
      { game: "R6 Siege", result: "win", score: "4-2", kda: "10/3/4", date: "6h ago" },
      { game: "R6 Siege", result: "win", score: "4-0", kda: "12/1/3", date: "8h ago" },
      { game: "R6 Siege", result: "win", score: "4-3", kda: "8/5/6", date: "1d ago" },
      { game: "R6 Siege", result: "loss", score: "3-4", kda: "7/6/2", date: "1d ago" },
      { game: "R6 Siege", result: "win", score: "4-1", kda: "11/2/5", date: "2d ago" },
    ],
    achievements: [
      { name: "Challenger Elite", description: "Reach Challenger rank", rarity: "legendary" },
      { name: "Operator Mastery", description: "Max level on 10 operators", rarity: "legendary" },
      { name: "Tactical Genius", description: "Win 500 rounds with 0 team deaths", rarity: "epic" },
      { name: "Iron Will", description: "Play 5000+ matches", rarity: "epic" },
    ],
    friends: [2, 3, 5],
  },
  {
    id: 8,
    username: "VoltEdge",
    avatar: "/avatars/avatar-8.jpg",
    banner: "/banners/banner-1.jpg",
    level: 54,
    rank: "Platinum",
    status: "online",
    mainGame: "Rocket League",
    wins: 743,
    kd: 1.63,
    bio: "Ceiling shots and flip resets. Freestyler at heart, grinder by necessity.",
    joinedDate: "Jul 2023",
    totalMatches: 1350,
    hoursPlayed: 890,
    winRate: 55.0,
    headshots: 0,
    longestStreak: 9,
    topAgent: "Octane",
    recentGames: [
      { game: "Rocket League", result: "win", score: "5-2", kda: "3G/1A/1S", date: "2h ago" },
      { game: "Rocket League", result: "win", score: "3-1", kda: "2G/1A/0S", date: "4h ago" },
      { game: "Rocket League", result: "loss", score: "2-4", kda: "1G/1A/2S", date: "6h ago" },
      { game: "Rocket League", result: "win", score: "6-0", kda: "4G/2A/0S", date: "1d ago" },
      { game: "Rocket League", result: "loss", score: "1-3", kda: "0G/1A/1S", date: "1d ago" },
    ],
    achievements: [
      { name: "Ceiling Master", description: "Score 500 aerial goals", rarity: "epic" },
      { name: "Platinum Wheels", description: "Reach Platinum rank in competitive", rarity: "rare" },
      { name: "Hat Trick Hero", description: "Score 3+ goals in 100 matches", rarity: "rare" },
      { name: "Rocket Rookie", description: "Play 1000 matches", rarity: "common" },
    ],
    friends: [3, 6],
  },
];

export function getProfileById(id: number): GamerProfile | undefined {
  return PROFILES.find((p) => p.id === id);
}
