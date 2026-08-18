/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ArtistSlideData {
  id: string;
  artistName: string;
  categoryTag: string;
  headline: string;
  description: string;
  imageUrl: string;
  gradientTheme: {
    from: string;
    via: string;
    to: string;
    accentColor: string;
    badgeBg: string;
    badgeText: string;
  };
  primaryHit: {
    title: string;
    album: string;
    duration: number;
    genre: string;
    artworkUrl: string;
  };
  topHits: Array<{
    title: string;
    album: string;
    duration: number;
  }>;
}

// 15 curated artist slide presets featuring beautiful anime scenery backgrounds that dynamically rotate in groups
export const ALL_ARTIST_SLIDE_PRESETS: ArtistSlideData[] = [
  {
    id: 'shubh-hits',
    artistName: 'Shubh',
    categoryTag: 'Celestial Anime Skies',
    headline: 'SHUBH STILL ROLLIN',
    description: 'Chart-dominating Punjabi trap anthems beneath a cosmic starry anime night sky.',
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=1600',
    gradientTheme: {
      from: 'from-indigo-950/95',
      via: 'via-purple-950/80',
      to: 'to-black/60',
      accentColor: '#818cf8',
      badgeBg: 'bg-indigo-500/20 border-indigo-400/30',
      badgeText: 'text-indigo-300',
    },
    primaryHit: {
      title: 'Cheques',
      album: 'Still Rollin',
      duration: 183,
      genre: 'Punjabi Hip-Hop',
      artworkUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&q=80&w=600',
    },
    topHits: [
      { title: 'Cheques', album: 'Still Rollin', duration: 183 },
      { title: 'Baller', album: 'No Love', duration: 148 },
      { title: 'Elevated', album: 'No Love', duration: 200 },
      { title: 'No Love', album: 'No Love', duration: 170 },
    ],
  },
  {
    id: 'krsna-drill',
    artistName: 'KR$NA',
    categoryTag: 'Cyberpunk Neon Tokyo',
    headline: 'KR$NA FAR FROM OVER',
    description: 'Unmatched lyricism over ferocious drill beats framed by rainy neon anime streets.',
    imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&q=80&w=1600',
    gradientTheme: {
      from: 'from-sky-950/95',
      via: 'via-cyan-950/80',
      to: 'to-black/60',
      accentColor: '#38bdf8',
      badgeBg: 'bg-sky-500/20 border-sky-400/30',
      badgeText: 'text-sky-300',
    },
    primaryHit: {
      title: 'Prarthana',
      album: 'Far From Over',
      duration: 196,
      genre: 'Desi Drill / Rap',
      artworkUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&q=80&w=600',
    },
    topHits: [
      { title: 'Prarthana', album: 'Far From Over', duration: 196 },
      { title: 'Saza-e-Maut', album: 'Hard Drive Vol. 1', duration: 215 },
      { title: 'Blow Up', album: 'Still Here', duration: 180 },
      { title: 'Hola Amigo', album: 'Far From Over', duration: 210 },
    ],
  },
  {
    id: 'nazz-hustle',
    artistName: 'NAZZ',
    categoryTag: 'Ghibli Emerald Meadow',
    headline: 'NAZZ BHAARI HAI',
    description: 'Lightning-fast delivery and street punchlines surrounded by lush anime mountain hills.',
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=1600',
    gradientTheme: {
      from: 'from-emerald-950/95',
      via: 'via-teal-950/80',
      to: 'to-black/60',
      accentColor: '#10b981',
      badgeBg: 'bg-emerald-500/20 border-emerald-400/30',
      badgeText: 'text-emerald-300',
    },
    primaryHit: {
      title: 'Bhaari Hai',
      album: 'MTV Hustle 2.0',
      duration: 165,
      genre: 'Desi Rap / Hustle',
      artworkUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=600',
    },
    topHits: [
      { title: 'Bhaari Hai', album: 'MTV Hustle 2.0', duration: 165 },
      { title: 'Kala Jadu', album: 'Hustle Anthem', duration: 172 },
      { title: 'Gunehgar', album: 'Hustle Cypher', duration: 180 },
    ],
  },
  {
    id: 'dhanda-nyoliwala',
    artistName: 'Dhanda Nyoliwala',
    categoryTag: 'Sunset Anime Horizon',
    headline: 'DHANDA NYOLIWALA DRILL',
    description: 'Raw regional rap energy meets heavy 808s alongside a golden anime coastal sunset.',
    imageUrl: 'https://images.unsplash.com/photo-1509023464722-18d996393ca8?auto=format&fit=crop&q=80&w=1600',
    gradientTheme: {
      from: 'from-orange-950/95',
      via: 'via-amber-950/80',
      to: 'to-black/60',
      accentColor: '#f97316',
      badgeBg: 'bg-orange-500/20 border-orange-400/30',
      badgeText: 'text-orange-300',
    },
    primaryHit: {
      title: 'Up To U',
      album: 'Single',
      duration: 188,
      genre: 'Haryanvi Drill',
      artworkUrl: 'https://images.unsplash.com/photo-1509023464722-18d996393ca8?auto=format&fit=crop&q=80&w=600',
    },
    topHits: [
      { title: 'Up To U', album: 'Single', duration: 188 },
      { title: 'Russian Bandana', album: 'Haryanvi Drill', duration: 195 },
      { title: 'Block', album: 'Single', duration: 160 },
    ],
  },
  {
    id: 'arijit-singh',
    artistName: 'Arijit Singh',
    categoryTag: 'Sakura Blossom Shrine',
    headline: 'ARIJIT SINGH HITS',
    description: 'Soul-stirring romantic ballads beneath floating Japanese cherry blossom petals at dusk.',
    imageUrl: 'https://images.unsplash.com/photo-1528164344705-475426879c0d?auto=format&fit=crop&q=80&w=1600',
    gradientTheme: {
      from: 'from-rose-950/95',
      via: 'via-purple-950/80',
      to: 'to-black/60',
      accentColor: '#f43f5e',
      badgeBg: 'bg-rose-500/20 border-rose-400/30',
      badgeText: 'text-rose-300',
    },
    primaryHit: {
      title: 'Tum Hi Ho',
      album: 'Aashiqui 2',
      duration: 262,
      genre: 'Bollywood / Romantic',
      artworkUrl: 'https://images.unsplash.com/photo-1528164344705-475426879c0d?auto=format&fit=crop&q=80&w=600',
    },
    topHits: [
      { title: 'Tum Hi Ho', album: 'Aashiqui 2', duration: 262 },
      { title: 'Kesariya', album: 'Brahmāstra', duration: 268 },
      { title: 'Channa Mereya', album: 'Ae Dil Hai Mushkil', duration: 289 },
      { title: 'Apna Bana Le', album: 'Bhediya', duration: 261 },
    ],
  },
  {
    id: 'kk-hits',
    artistName: 'K.K. (Krishnakumar Kunnath)',
    categoryTag: 'Mount Fuji Anime Sunrise',
    headline: 'K.K. TIMELESS NOSTALGIA',
    description: 'Pure rock passion and anthems of friendship framed by misty dawn over Mount Fuji.',
    imageUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=1600',
    gradientTheme: {
      from: 'from-amber-950/95',
      via: 'via-orange-950/80',
      to: 'to-black/60',
      accentColor: '#f59e0b',
      badgeBg: 'bg-amber-500/20 border-amber-400/30',
      badgeText: 'text-amber-300',
    },
    primaryHit: {
      title: 'Zara Sa',
      album: 'Jannat',
      duration: 303,
      genre: 'Bollywood / Pop-Rock',
      artworkUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&q=80&w=600',
    },
    topHits: [
      { title: 'Zara Sa', album: 'Jannat', duration: 303 },
      { title: 'Kya Mujhe Pyaar Hai', album: 'Woh Lamhe', duration: 284 },
      { title: 'Yaaron', album: 'Pal', duration: 278 },
      { title: 'Tu Hi Meri Shab Hai', album: 'Gangster', duration: 390 },
    ],
  },
  {
    id: 'atif-aslam',
    artistName: 'Atif Aslam',
    categoryTag: 'Enchanted Forest Realm',
    headline: 'ATIF ASLAM ESSENTIALS',
    description: 'Acoustic Sufi serenity floating through sunlit anime glades and glowing forest mist.',
    imageUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&q=80&w=1600',
    gradientTheme: {
      from: 'from-emerald-950/95',
      via: 'via-teal-950/80',
      to: 'to-black/60',
      accentColor: '#10b981',
      badgeBg: 'bg-emerald-500/20 border-emerald-400/30',
      badgeText: 'text-emerald-300',
    },
    primaryHit: {
      title: 'Jeena Jeena',
      album: 'Badlapur',
      duration: 229,
      genre: 'Sufi / Romance',
      artworkUrl: 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&q=80&w=600',
    },
    topHits: [
      { title: 'Jeena Jeena', album: 'Badlapur', duration: 229 },
      { title: 'Tajdar-e-Haram', album: 'Coke Studio', duration: 618 },
      { title: 'Pehli Nazar Mein', album: 'Race', duration: 314 },
      { title: 'Tere Sang Yaara', album: 'Rustom', duration: 290 },
    ],
  },
  {
    id: 'shreya-ghoshal',
    artistName: 'Shreya Ghoshal',
    categoryTag: 'Twilight Anime Clouds',
    headline: 'SHREYA GHOSHAL CLASSICS',
    description: 'Pristine vocal agility echoing across ethereal lavender twilight anime skies.',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=1600',
    gradientTheme: {
      from: 'from-fuchsia-950/95',
      via: 'via-violet-950/80',
      to: 'to-black/60',
      accentColor: '#d946ef',
      badgeBg: 'bg-fuchsia-500/20 border-fuchsia-400/30',
      badgeText: 'text-fuchsia-300',
    },
    primaryHit: {
      title: 'Sunn Raha Hai Na Tu',
      album: 'Aashiqui 2',
      duration: 314,
      genre: 'Bollywood / Semi-Classical',
      artworkUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=600',
    },
    topHits: [
      { title: 'Sunn Raha Hai Na Tu', album: 'Aashiqui 2', duration: 314 },
      { title: 'Deewani Mastani', album: 'Bajirao Mastani', duration: 340 },
      { title: 'Ghar More Pardesiya', album: 'Kalank', duration: 319 },
      { title: 'Teri Ore', album: 'Singh Is Kinng', duration: 338 },
    ],
  },
  {
    id: 'ar-rahman',
    artistName: 'A.R. Rahman',
    categoryTag: 'Luminescent Cosmic Aurora',
    headline: 'A.R. RAHMAN SONIC VOYAGE',
    description: 'Oscar-winning symphony orchestrations reflecting upon a glowing aurora borealis lake.',
    imageUrl: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?auto=format&fit=crop&q=80&w=1600',
    gradientTheme: {
      from: 'from-cyan-950/95',
      via: 'via-blue-950/80',
      to: 'to-black/60',
      accentColor: '#06b6d4',
      badgeBg: 'bg-cyan-500/20 border-cyan-400/30',
      badgeText: 'text-cyan-300',
    },
    primaryHit: {
      title: 'Kun Faya Kun',
      album: 'Rockstar',
      duration: 473,
      genre: 'Sufi / Orchestral',
      artworkUrl: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?auto=format&fit=crop&q=80&w=600',
    },
    topHits: [
      { title: 'Kun Faya Kun', album: 'Rockstar', duration: 473 },
      { title: 'Jai Ho', album: 'Slumdog Millionaire', duration: 319 },
      { title: 'Dil Se Re', album: 'Dil Se..', duration: 342 },
      { title: 'Nadaan Parindey', album: 'Rockstar', duration: 386 },
    ],
  },
  {
    id: 'pritam-hits',
    artistName: 'Pritam',
    categoryTag: 'Autumn Maple Anime Bridge',
    headline: 'PRITAM CHARTBUSTERS',
    description: 'Electrifying pop-rock melodies drifting across a peaceful crimson maple leaf stream.',
    imageUrl: 'https://images.unsplash.com/photo-1492571350019-22de08371fd3?auto=format&fit=crop&q=80&w=1600',
    gradientTheme: {
      from: 'from-red-950/95',
      via: 'via-amber-950/80',
      to: 'to-black/60',
      accentColor: '#ef4444',
      badgeBg: 'bg-red-500/20 border-red-400/30',
      badgeText: 'text-red-300',
    },
    primaryHit: {
      title: 'Subhanallah',
      album: 'Yeh Jawaani Hai Deewani',
      duration: 249,
      genre: 'Bollywood / Acoustic Pop',
      artworkUrl: 'https://images.unsplash.com/photo-1492571350019-22de08371fd3?auto=format&fit=crop&q=80&w=600',
    },
    topHits: [
      { title: 'Subhanallah', album: 'Yeh Jawaani Hai Deewani', duration: 249 },
      { title: 'Badtameez Dil', album: 'Yeh Jawaani Hai Deewani', duration: 252 },
      { title: 'Kabira', album: 'Yeh Jawaani Hai Deewani', duration: 216 },
      { title: 'Ilahi', album: 'Yeh Jawaani Hai Deewani', duration: 229 },
    ],
  },
  {
    id: 'sonu-nigam',
    artistName: 'Sonu Nigam',
    categoryTag: 'Golden Anime Sunset',
    headline: 'SONU NIGAM EVERGREENS',
    description: 'Incomparable emotional vocal depth set against a glowing golden anime ocean horizon.',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1600',
    gradientTheme: {
      from: 'from-amber-950/95',
      via: 'via-yellow-950/80',
      to: 'to-black/60',
      accentColor: '#eab308',
      badgeBg: 'bg-amber-500/20 border-amber-400/30',
      badgeText: 'text-amber-200',
    },
    primaryHit: {
      title: 'Kal Ho Naa Ho',
      album: 'Kal Ho Naa Ho',
      duration: 322,
      genre: 'Bollywood / Classical Pop',
      artworkUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=600',
    },
    topHits: [
      { title: 'Kal Ho Naa Ho', album: 'Kal Ho Naa Ho', duration: 322 },
      { title: 'Abhi Mujh Mein Kahin', album: 'Agneepath', duration: 364 },
      { title: 'Suraj Hua Maddham', album: 'Kabhi Khushi Kabhie Gham', duration: 428 },
      { title: 'Saathiya', album: 'Saathiya', duration: 357 },
    ],
  },
  {
    id: 'mohit-chauhan',
    artistName: 'Mohit Chauhan',
    categoryTag: 'Alpine Starry Anime Night',
    headline: 'MOHIT CHAUHAN SOUL',
    description: 'Rustic acoustic wanderlust strumming under a dazzling Milky Way mountain sky.',
    imageUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=1600',
    gradientTheme: {
      from: 'from-sky-950/95',
      via: 'via-indigo-950/80',
      to: 'to-black/60',
      accentColor: '#38bdf8',
      badgeBg: 'bg-sky-500/20 border-sky-400/30',
      badgeText: 'text-sky-300',
    },
    primaryHit: {
      title: 'Tum Se Hi',
      album: 'Jab We Met',
      duration: 323,
      genre: 'Acoustic / Romantic',
      artworkUrl: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&q=80&w=600',
    },
    topHits: [
      { title: 'Tum Se Hi', album: 'Jab We Met', duration: 323 },
      { title: 'Pee Loon', album: 'Once Upon A Time In Mumbaai', duration: 288 },
      { title: 'Phir Se Ud Chala', album: 'Rockstar', duration: 271 },
      { title: 'Dooba Dooba', album: 'Boondein', duration: 285 },
    ],
  },
  {
    id: 'diljit-dosanjh',
    artistName: 'Diljit Dosanjh',
    categoryTag: 'Vibrant Neon Anime City',
    headline: 'DILJIT DOSANJH POWER',
    description: 'High-octane Punjabi folk-pop bangers set in a high-voltage anime metropolis.',
    imageUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&q=80&w=1600',
    gradientTheme: {
      from: 'from-orange-950/95',
      via: 'via-rose-950/80',
      to: 'to-black/60',
      accentColor: '#f97316',
      badgeBg: 'bg-orange-500/20 border-orange-400/30',
      badgeText: 'text-orange-300',
    },
    primaryHit: {
      title: 'Lover',
      album: 'MoonChild Era',
      duration: 191,
      genre: 'Punjabi Pop / Synth',
      artworkUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&q=80&w=600',
    },
    topHits: [
      { title: 'Lover', album: 'MoonChild Era', duration: 191 },
      { title: 'G.O.A.T.', album: 'G.O.A.T.', duration: 224 },
      { title: 'Born to Shine', album: 'G.O.A.T.', duration: 213 },
      { title: 'Do You Know', album: 'Do You Know', duration: 221 },
    ],
  },
  {
    id: 'the-weeknd',
    artistName: 'The Weeknd',
    categoryTag: 'Retro Anime Synthwave Sunset',
    headline: 'THE WEEKND AFTER HOURS',
    description: 'Cinematic 80s synth-pop and hypnotic basslines across a purple anime twilight city.',
    imageUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&q=80&w=1600',
    gradientTheme: {
      from: 'from-red-950/95',
      via: 'via-purple-950/80',
      to: 'to-black/60',
      accentColor: '#e11d48',
      badgeBg: 'bg-red-500/20 border-red-400/30',
      badgeText: 'text-red-300',
    },
    primaryHit: {
      title: 'Blinding Lights',
      album: 'After Hours',
      duration: 200,
      genre: 'Synth-Pop',
      artworkUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&q=80&w=600',
    },
    topHits: [
      { title: 'Blinding Lights', album: 'After Hours', duration: 200 },
      { title: 'Starboy', album: 'Starboy', duration: 230 },
      { title: 'Save Your Tears', album: 'After Hours', duration: 215 },
      { title: 'Die For You', album: 'Starboy', duration: 260 },
    ],
  },
  {
    id: 'synthwave-dreams',
    artistName: 'Kavinsky & Daft Punk',
    categoryTag: 'Cyberpunk Anime Highway',
    headline: 'SYNTHWAVE DREAMS',
    description: 'Electric neon highways and late-night cyberpunk speed aesthetics.',
    imageUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1600',
    gradientTheme: {
      from: 'from-indigo-950/95',
      via: 'via-blue-950/80',
      to: 'to-black/60',
      accentColor: '#6366f1',
      badgeBg: 'bg-indigo-500/20 border-indigo-400/30',
      badgeText: 'text-indigo-300',
    },
    primaryHit: {
      title: 'Nightcall',
      album: 'Drive OST / OutRun',
      duration: 259,
      genre: 'Synthwave / Electronic',
      artworkUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=600',
    },
    topHits: [
      { title: 'Nightcall', album: 'OutRun', duration: 259 },
      { title: 'Instant Crush', album: 'Random Access Memories', duration: 337 },
      { title: 'Resonance', album: 'Home', duration: 212 },
      { title: 'Midnight City', album: 'Hurry Up, We\'re Dreaming', duration: 243 },
    ],
  },
  {
    id: 'lata-mangeshkar',
    artistName: 'Lata Mangeshkar',
    categoryTag: 'Kyoto Bamboo & Lanterns',
    headline: 'LATA MANGESHKAR GOLD',
    description: 'Timeless classical purity amidst illuminated bamboo groves and serene spirit gardens.',
    imageUrl: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&q=80&w=1600',
    gradientTheme: {
      from: 'from-amber-950/95',
      via: 'via-pink-950/80',
      to: 'to-black/60',
      accentColor: '#f59e0b',
      badgeBg: 'bg-amber-500/20 border-amber-400/30',
      badgeText: 'text-amber-200',
    },
    primaryHit: {
      title: 'Lag Jaa Gale',
      album: 'Woh Kaun Thi?',
      duration: 258,
      genre: 'Classic Vintage / Ghazal',
      artworkUrl: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&q=80&w=600',
    },
    topHits: [
      { title: 'Lag Jaa Gale', album: 'Woh Kaun Thi?', duration: 258 },
      { title: 'Ajeeb Dastan Hai Yeh', album: 'Dil Apna Aur Preet Parai', duration: 314 },
      { title: 'Tere Bina Zindagi Se', album: 'Aandhi', duration: 350 },
      { title: 'Tujhe Dekha Toh Yeh Jaana Sanam', album: 'DDLJ', duration: 304 },
    ],
  },
];
