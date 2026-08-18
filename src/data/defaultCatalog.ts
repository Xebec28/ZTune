/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Track, Playlist, Artist } from '../types';

export const DEFAULT_TRACKS: Track[] = [
  {
    id: 'track_dark_paradise',
    title: 'Dark paradise',
    artist: 'Lana del rey',
    album: 'Born to Die',
    duration: 230, // 3:50
    artworkUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
    audioUrl: '',
    youtubeId: 'JRWox-i6aAk',
    genre: 'Dream Pop',
    rating: 5,
    isFavorite: true,
    source: 'Catalog',
    bpm: '122 BPM',
    key: 'C# Minor'
  },
  {
    id: 'track_starboy',
    title: 'Starboy',
    artist: 'The Weeknd',
    album: 'Starboy',
    duration: 220, // 3:40
    artworkUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    audioUrl: '',
    youtubeId: '34Na4j8AVgA',
    genre: 'Synth Pop',
    rating: 3,
    isFavorite: true,
    source: 'Catalog',
    bpm: '114 BPM',
    key: 'G Minor'
  },
  {
    id: 'track_not_today',
    title: 'Not today',
    artist: 'Imagine dragons',
    album: 'Me Before You',
    duration: 258, // 4:18
    artworkUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
    audioUrl: '',
    youtubeId: 'mN34d402A_0',
    genre: 'Indie Pop',
    rating: 5,
    isFavorite: true,
    source: 'Catalog',
    bpm: '130 BPM',
    key: 'D Major'
  },
  {
    id: 'track_chandelier',
    title: 'Chandelier',
    artist: 'Sia',
    album: '1000 Forms of Fear',
    duration: 216, // 3:36
    artworkUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80',
    audioUrl: '',
    youtubeId: '2vjPBrBU-TM',
    genre: 'Electropop',
    rating: 4,
    isFavorite: true,
    source: 'Catalog',
    bpm: '117 BPM',
    key: 'Bb Minor'
  },
  {
    id: 'track_shape_of_my_heart',
    title: 'Shape of my heart',
    artist: 'Sting',
    album: 'Ten Summoner\'s Tales',
    duration: 278, // 4:38
    artworkUrl: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600&auto=format&fit=crop&q=80',
    audioUrl: '',
    youtubeId: 'NlwIDxCjL-8',
    genre: 'Acoustic',
    rating: 5,
    isFavorite: false,
    source: 'Catalog',
    bpm: '98 BPM',
    key: 'F# Minor'
  },
  {
    id: 'track_nightcall',
    title: 'Nightcall',
    artist: 'Kavinsky',
    album: 'OutRun',
    duration: 258,
    artworkUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
    audioUrl: '',
    youtubeId: 'MV_3Dpw-BRY',
    genre: 'Synthwave',
    rating: 5,
    isFavorite: true,
    source: 'Catalog',
    bpm: '90 BPM',
    key: 'A Minor'
  },
  {
    id: 'track_blinding_lights',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    duration: 200,
    artworkUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    audioUrl: '',
    youtubeId: '4NRXx6U8ABQ',
    genre: '80s Synth',
    rating: 5,
    isFavorite: true,
    source: 'Catalog',
    bpm: '171 BPM',
    key: 'F Minor'
  },
  {
    id: 'track_unstoppable',
    title: 'Unstoppable',
    artist: 'Sia',
    album: 'This Is Acting',
    duration: 217,
    artworkUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80',
    audioUrl: '',
    youtubeId: 'CX11yw6YL1w',
    genre: 'Pop Anthem',
    rating: 4,
    isFavorite: true,
    source: 'Catalog',
    bpm: '124 BPM',
    key: 'C Major'
  },
  {
    id: 'track_instant_crush',
    title: 'Instant Crush',
    artist: 'Daft Punk',
    album: 'Random Access Memories',
    duration: 337,
    artworkUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
    audioUrl: '',
    youtubeId: 'a5uQMwRMHcs',
    genre: 'Electronic',
    rating: 5,
    isFavorite: true,
    source: 'Catalog',
    bpm: '110 BPM',
    key: 'E Minor'
  },
  {
    id: 'track_bad_guy',
    title: 'bad guy',
    artist: 'Billie Eilish',
    album: 'WHEN WE ALL FALL ASLEEP',
    duration: 194,
    artworkUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600&auto=format&fit=crop&q=80',
    audioUrl: '',
    youtubeId: 'DyDfgMOUjCI',
    genre: 'Dark Pop',
    rating: 4,
    isFavorite: false,
    source: 'Catalog',
    bpm: '135 BPM',
    key: 'G Minor'
  },
  {
    id: 'track_cheques',
    title: 'Cheques',
    artist: 'Shubh',
    album: 'Still Rollin',
    duration: 183,
    artworkUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    audioUrl: '',
    youtubeId: '4tywp83zkmk',
    genre: 'Punjabi Hip-Hop',
    rating: 5,
    isFavorite: true,
    source: 'Catalog',
    bpm: '128 BPM',
    key: 'F Minor'
  },
  {
    id: 'track_baller',
    title: 'Baller',
    artist: 'Shubh',
    album: 'No Love',
    duration: 148,
    artworkUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&auto=format&fit=crop&q=80',
    audioUrl: '',
    youtubeId: '1OEmo3HGEO8',
    genre: 'Punjabi Trap',
    rating: 5,
    isFavorite: true,
    source: 'Catalog',
    bpm: '140 BPM',
    key: 'G# Minor'
  },
  {
    id: 'track_prarthana',
    title: 'Prarthana',
    artist: 'KR$NA',
    album: 'Far From Over',
    duration: 196,
    artworkUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80',
    audioUrl: '',
    youtubeId: 'V5w8_L3l4_Q',
    genre: 'Desi Drill / Rap',
    rating: 5,
    isFavorite: true,
    source: 'Catalog',
    bpm: '142 BPM',
    key: 'D Minor'
  },
  {
    id: 'track_saza_e_maut',
    title: 'Saza-e-Maut',
    artist: 'KR$NA',
    album: 'Hard Drive Vol. 1',
    duration: 215,
    artworkUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80',
    audioUrl: '',
    youtubeId: 'Zk1Y9dZ6rYg',
    genre: 'Desi Hip-Hop',
    rating: 5,
    isFavorite: true,
    source: 'Catalog',
    bpm: '138 BPM',
    key: 'C Minor'
  },
  {
    id: 'track_bhaari_hai',
    title: 'Bhaari Hai',
    artist: 'NAZZ',
    album: 'MTV Hustle 2.0',
    duration: 165,
    artworkUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80',
    audioUrl: '',
    youtubeId: '34Na4j8AVgA',
    genre: 'Desi Rap / Hustle',
    rating: 5,
    isFavorite: true,
    source: 'Catalog',
    bpm: '130 BPM',
    key: 'A Minor'
  },
  {
    id: 'track_kala_jadu',
    title: 'Kala Jadu',
    artist: 'NAZZ',
    album: 'Hustle Anthem',
    duration: 172,
    artworkUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80',
    audioUrl: '',
    youtubeId: 'mN34d402A_0',
    genre: 'Desi Rap',
    rating: 4,
    isFavorite: true,
    source: 'Catalog',
    bpm: '124 BPM',
    key: 'E Minor'
  },
  {
    id: 'track_up_to_u',
    title: 'Up To U',
    artist: 'Dhanda Nyoliwala',
    album: 'Single',
    duration: 188,
    artworkUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&auto=format&fit=crop&q=80',
    audioUrl: '',
    youtubeId: 'CX11yw6YL1w',
    genre: 'Haryanvi Drill',
    rating: 5,
    isFavorite: true,
    source: 'Catalog',
    bpm: '144 BPM',
    key: 'F# Minor'
  },
  {
    id: 'track_russian_bandana',
    title: 'Russian Bandana',
    artist: 'Dhanda Nyoliwala',
    album: 'Haryanvi Drill',
    duration: 195,
    artworkUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&auto=format&fit=crop&q=80',
    audioUrl: '',
    youtubeId: 'DyDfgMOUjCI',
    genre: 'Haryanvi Hip-Hop',
    rating: 5,
    isFavorite: true,
    source: 'Catalog',
    bpm: '136 BPM',
    key: 'Bb Minor'
  },
  {
    id: 'track_namastute',
    title: 'Namastute',
    artist: 'Seedhe Maut',
    album: 'Nayaab',
    duration: 174,
    artworkUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600&auto=format&fit=crop&q=80',
    audioUrl: '',
    youtubeId: 'MV_3Dpw-BRY',
    genre: 'Desi Hip-Hop',
    rating: 5,
    isFavorite: true,
    source: 'Catalog',
    bpm: '145 BPM',
    key: 'B Minor'
  }
];

export const DEFAULT_PLAYLISTS: Playlist[] = [
  {
    id: 'pl_80s_hits',
    title: '80s Hits',
    subtitle: '173 songs',
    trackCount: 173,
    rating: 3.8,
    coverStyle: 'purple-neon',
    artworkUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&auto=format&fit=crop&q=80',
    tracks: [
      DEFAULT_TRACKS[0],
      DEFAULT_TRACKS[1],
      DEFAULT_TRACKS[5],
      DEFAULT_TRACKS[6],
      DEFAULT_TRACKS[8]
    ]
  },
  {
    id: 'pl_old_school',
    title: 'Old school',
    subtitle: '41 songs',
    trackCount: 41,
    rating: 4.0,
    coverStyle: 'yellow-guitar',
    artworkUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80',
    tracks: [
      DEFAULT_TRACKS[4],
      DEFAULT_TRACKS[2],
      DEFAULT_TRACKS[3]
    ]
  },
  {
    id: 'pl_hesams_top',
    title: "Hesam's Top",
    subtitle: '312 songs',
    trackCount: 312,
    rating: 4.8,
    coverStyle: 'white-headphones',
    artworkUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80',
    tracks: [
      DEFAULT_TRACKS[0],
      DEFAULT_TRACKS[1],
      DEFAULT_TRACKS[2],
      DEFAULT_TRACKS[3],
      DEFAULT_TRACKS[5],
      DEFAULT_TRACKS[6]
    ]
  },
  {
    id: 'pl_cyberpunk',
    title: 'Cyberpunk Synth',
    subtitle: '18 songs',
    trackCount: 18,
    rating: 4.9,
    coverStyle: 'cyan-synth',
    artworkUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80',
    tracks: [
      DEFAULT_TRACKS[1],
      DEFAULT_TRACKS[5],
      DEFAULT_TRACKS[6],
      DEFAULT_TRACKS[8]
    ]
  }
];

export const DEFAULT_ARTISTS: Artist[] = [
  {
    id: 'artist_shubh',
    name: 'Shubh',
    avatarUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80',
    songCount: 18,
    isFavorite: true,
    genre: 'Punjabi Hip-Hop / Trap',
    bio: 'Global Punjabi hip-hop sensation known for hits like Cheques, Baller, and Elevated.'
  },
  {
    id: 'artist_krsna',
    name: 'KR$NA',
    avatarUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=80',
    songCount: 26,
    isFavorite: true,
    genre: 'Desi Drill / Rap',
    bio: 'The lyrical powerhouse of Indian hip-hop, pioneer of complex rhyme schemes and drill flows.'
  },
  {
    id: 'artist_nazz',
    name: 'NAZZ',
    avatarUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500&auto=format&fit=crop&q=80',
    songCount: 14,
    isFavorite: true,
    genre: 'Desi Rap / Hustle',
    bio: 'MTV Hustle star known for lightning-speed punchlines, witty storytelling, and unmatched stage presence.'
  },
  {
    id: 'artist_dhanda',
    name: 'Dhanda Nyoliwala',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
    songCount: 12,
    isFavorite: true,
    genre: 'Haryanvi Drill',
    bio: 'Pioneering the raw energy of Haryanvi drill music with viral anthems like Up To U and Russian Bandana.'
  },
  {
    id: 'artist_seedhe_maut',
    name: 'Seedhe Maut',
    avatarUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&auto=format&fit=crop&q=80',
    songCount: 32,
    isFavorite: true,
    genre: 'Desi Hip-Hop',
    bio: 'The revolutionary Delhi hip-hop duo consisting of Calm and Encore ABJ.'
  },
  {
    id: 'artist_sia',
    name: 'Sia',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    songCount: 34,
    isFavorite: true,
    genre: 'Electropop'
  },
  {
    id: 'artist_weeknd',
    name: 'Weeknd',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    songCount: 29,
    isFavorite: true,
    genre: 'Synth Pop'
  },
  {
    id: 'artist_lana',
    name: 'Lana Del Rey',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    songCount: 18,
    isFavorite: true,
    genre: 'Dream Pop'
  },
  {
    id: 'artist_daft_punk',
    name: 'Daft Punk',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    songCount: 22,
    isFavorite: true,
    genre: 'Electronic'
  },
  {
    id: 'artist_billie',
    name: 'Billie Eilish',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
    songCount: 15,
    isFavorite: true,
    genre: 'Dark Pop'
  },
  {
    id: 'artist_imagine',
    name: 'Imagine Dragons',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
    songCount: 24,
    isFavorite: false,
    genre: 'Indie Rock'
  }
];

export const DEFAULT_EQ_SETTINGS = {
  enabled: true,
  preset: 'Rock',
  preamp: 0,
  bassBoost: 35,
  bands: [
    { frequency: 60, label: '60Hz', gain: 3 },
    { frequency: 170, label: '170Hz', gain: 2 },
    { frequency: 310, label: '310Hz', gain: -1 },
    { frequency: 600, label: '600Hz', gain: -2 },
    { frequency: 1000, label: '1kHz', gain: 0 },
    { frequency: 3000, label: '3kHz', gain: 2 },
    { frequency: 6000, label: '6kHz', gain: 3 },
    { frequency: 12000, label: '12kHz', gain: 4 },
    { frequency: 14000, label: '14kHz', gain: 3 },
    { frequency: 16000, label: '16kHz', gain: 2 }
  ]
};

export const DEFAULT_CATALOG = {
  tracks: DEFAULT_TRACKS,
  playlists: DEFAULT_PLAYLISTS,
  artists: DEFAULT_ARTISTS,
  eq: DEFAULT_EQ_SETTINGS,
};

