import type { CoupleKeepsakeData } from '../types/keepsake';

export const VANISH_DISCORD_ID = '1560175530911858743';
export const CHI_DISCORD_ID = '1488594276949430375';

export const DEFAULT_PIC_1 =
  'https://cdn.discordapp.com/avatars/1560175530911858743/e2817da5631f4373b3b2c5acc5db9410.png?size=512';
export const DEFAULT_PIC_2 =
  'https://cdn.discordapp.com/avatars/1488594276949430375/2bb37ef52477acd4355ffc7284558fc1.png?size=512';

export const DEFAULT_KEEPSAKE_DATA: CoupleKeepsakeData = {
  titleLine1: 'vanish',
  titleLine2: 'nd chi',
  photos: [
    {
      id: 'pic-1',
      discordId: VANISH_DISCORD_ID,
      src: DEFAULT_PIC_1,
      label: 'vanish',
      title: 'i love u baby chi mwa',
      caption: 'Server tag · saur',
      alt: 'vanish Discord profile picture',
      discordDisplayName: 'vanish',
      discordUsername: 'lowstate',
      discordStatus: 'dnd',
      guildTag: 'saur',
      discordUrl: `https://discord.com/users/${VANISH_DISCORD_ID}`,
    },
    {
      id: 'pic-2',
      discordId: CHI_DISCORD_ID,
      src: DEFAULT_PIC_2,
      label: 'chi',
      title: 'i love u baby vanish',
      caption: 'Server tag · fvck',
      alt: 'chi Discord profile picture',
      discordDisplayName: '𐙚 endo chi',
      discordUsername: 'mira_shxz',
      discordStatus: 'offline',
      guildTag: 'fvck',
      discordUrl: `https://discord.com/users/${CHI_DISCORD_ID}`,
    },
  ],
  loveLetter: {
    envelopeLabel: 'For vanish & chi',
    envelopeHint: 'Click to open my note',
    salutation: 'My sweetest love,',
    paragraphs: [
      'Every little moment with you feels like my favorite page in a story I never want to end. Even on the quietest days, just knowing you are mine makes everything softer, warmer, and infinitely brighter.',
      'Thank you for being my safe place, my favorite laugh, and the person my heart reaches for first. No matter where time carries us, I am endlessly grateful that it is you and me.',
    ],
    signOff: 'Always & forever yours,',
    signature: 'with all my love',
  },
};
