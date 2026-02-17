// NFT Metadata structure for Solana NFTs (Metaplex standard)
export interface NFTMetadata {
  name: string
  symbol: string
  description: string
  image: string
  external_url?: string
  attributes: NFTAttribute[]
  properties: {
    files: NFTFile[]
    category: string
    creators: NFTCreator[]
  }
}

export interface NFTAttribute {
  trait_type: string
  value: string | number
}

export interface NFTFile {
  uri: string
  type: string
}

export interface NFTCreator {
  address: string
  share: number
}

export function generateAchievementMetadata(
  achievementName: string,
  description: string,
  rarity: string,
  xp: number,
  gameId: string,
  badgeImageUrl: string,
  walletAddress: string
): NFTMetadata {
  return {
    name: `Motion Play: ${achievementName}`,
    symbol: 'MOTION',
    description: description,
    image: badgeImageUrl,
    external_url: 'https://motionplay.gg',
    attributes: [
      {
        trait_type: 'Achievement',
        value: achievementName,
      },
      {
        trait_type: 'Rarity',
        value: rarity,
      },
      {
        trait_type: 'XP Value',
        value: xp,
      },
      {
        trait_type: 'Game',
        value: gameId,
      },
      {
        trait_type: 'Category',
        value: 'Achievement Badge',
      },
      {
        trait_type: 'Unlock Date',
        value: new Date().toISOString(),
      },
    ],
    properties: {
      files: [
        {
          uri: badgeImageUrl,
          type: 'image/jpeg',
        },
      ],
      category: 'image',
      creators: [
        {
          address: walletAddress,
          share: 100,
        },
      ],
    },
  }
}

// Rarity drop rates for future random achievement drops
export const RARITY_DROP_RATES = {
  Common: 0.50, // 50%
  Rare: 0.30, // 30%
  Epic: 0.15, // 15%
  Legendary: 0.05, // 5%
}

// Estimated market value multipliers based on rarity
export const RARITY_VALUE_MULTIPLIERS = {
  Common: 1.0,
  Rare: 2.5,
  Epic: 5.0,
  Legendary: 15.0,
}
