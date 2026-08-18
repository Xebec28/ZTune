/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Express, Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { DEFAULT_TRACKS } from '../data/defaultCatalog';

dotenv.config();


type YouTubeSearchVideo = {
  videoId: string;
  title: string;
  author?: { name?: string };
  seconds?: number;
  thumbnail?: string;
  image?: string;
};

function parseYouTubeDuration(text?: string): number {
  if (!text) return 210;
  const parts = text.split(':').map(Number);
  if (parts.some(Number.isNaN)) return 210;
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 210;
}

function firstText(node: any): string {
  if (!node) return '';
  if (typeof node.simpleText === 'string') return node.simpleText;
  if (Array.isArray(node.runs)) return node.runs.map((r: any) => r.text || '').join('');
  return '';
}

function collectYouTubeVideos(value: any, out: YouTubeSearchVideo[] = []): YouTubeSearchVideo[] {
  if (!value || out.length >= 30) return out;

  if (Array.isArray(value)) {
    for (const item of value) collectYouTubeVideos(item, out);
    return out;
  }

  if (typeof value !== 'object') return out;

  const video = value.videoRenderer;
  if (video?.videoId) {
    const title = firstText(video.title);
    const author = firstText(video.ownerText) || firstText(video.longBylineText) || 'Artist';
    const thumb = Array.isArray(video.thumbnail?.thumbnails)
      ? video.thumbnail.thumbnails.at(-1)?.url
      : undefined;

    out.push({
      videoId: video.videoId,
      title: title || 'YouTube Music',
      author: { name: author.replace(/ - Topic$/i, '') || 'Artist' },
      seconds: parseYouTubeDuration(firstText(video.lengthText)),
      thumbnail: thumb,
      image: thumb,
    });
    return out;
  }

  for (const key of Object.keys(value)) {
    if (key === 'videoRenderer') continue;
    collectYouTubeVideos(value[key], out);
    if (out.length >= 30) break;
  }
  return out;
}

async function fetchJsonWithTimeout(url: string, init: RequestInit = {}, timeoutMs = 9000): Promise<any> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

async function searchYouTube(query: string): Promise<YouTubeSearchVideo[]> {
  const encoded = encodeURIComponent(query.trim());
  const url = `https://www.youtube.com/results?search_query=${encoded}`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept': 'text/html,application/xhtml+xml',
      },
    });

    if (!response.ok) throw new Error(`YouTube search HTTP ${response.status}`);

    const html = await response.text();
    const patterns = [
      /var ytInitialData = (\{.*?\});<\/script>/s,
      /ytInitialData"\s*:\s*(\{.*?\})\s*,\s*"ytInitialPlayerResponse"/s,
      /ytInitialData\s*=\s*(\{.*?\});/s,
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (!match?.[1]) continue;
      try {
        const data = JSON.parse(match[1]);
        const videos = collectYouTubeVideos(data);
        if (videos.length) return videos;
      } catch {
        // Try the next extraction pattern.
      }
    }
  } catch (error: any) {
    console.warn('YouTube web search failed:', error?.message || error);
  }

  return [];
}

async function resolveYouTubeVideo(videoId: string): Promise<any | null> {
  try {
    const data = await fetchJsonWithTimeout(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${videoId}`)}&format=json`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0',
          'Accept': 'application/json',
        },
      },
      7000
    );

    return {
      videoId,
      title: data.title || 'YouTube Music',
      author: { name: data.author_name || 'Artist' },
      thumbnail: data.thumbnail_url,
      image: data.thumbnail_url,
      seconds: 210,
    };
  } catch {
    return null;
  }
}

function localCatalogSearch(query: string): any[] {
  const normalized = query.toLowerCase().trim();
  if (!normalized) return [];

  const terms = normalized.split(/\s+/).filter(Boolean);

  return DEFAULT_TRACKS
    .map((track: any) => {
      const haystack = `${track.title} ${track.artist} ${track.album} ${track.genre}`.toLowerCase();
      const score = terms.reduce((total, term) => total + (haystack.includes(term) ? 1 : 0), 0);
      return { track, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(({ track }) => ({ ...track }));
}

// Helper for Gemini AI client initialization (lazy)
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Resilient helper to call Gemini with multi-model fallback on transient 503/429 errors
async function generateAIWithFallback(contents: any, config?: any): Promise<string | null> {
  const modelsToTry = ['gemini-3.7-flash', 'gemini-2.5-flash', 'gemini-3.1-flash-lite'];
  const ai = getAIClient();
  if (!ai) return null;

  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config,
      });
      if (response.text) {
        return response.text;
      }
    } catch (err: any) {
      console.warn(`Gemini model ${model} request note (${err?.status || err?.message || 'busy'}). Checking fallback...`);
    }
  }
  return null;
}

/**
 * Creates and configures the Express application with all API routes.
 * Used by both local dev/standalone server and Vercel serverless functions.
 */
export function createApiApp(): Express {
  const app = express();

  app.use(express.json({ limit: '10mb' }));

  // CORS middleware for API endpoints
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Range');
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    next();
  });

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'ZTune Desktop Full-Stack Engine', time: new Date().toISOString() });
  });

  // YouTube Music Search API.
  // Uses the public YouTube search page instead of yt-search because yt-search
  // is unreliable inside Vercel serverless functions.
  app.get('/api/search', async (req: Request, res: Response) => {
    try {
      const rawQuery = String(req.query.q || '').trim();
      if (!rawQuery) return res.json({ tracks: [] });

      // Always search the app's built-in catalog first. This makes the
      // bundled tracks work even if an external search provider is unavailable.
      const localTracks = localCatalogSearch(rawQuery);
      if (localTracks.length > 0) {
        return res.json({ tracks: localTracks });
      }

      const videos = (await searchYouTube(`${rawQuery} audio`)).slice(0, 30);
      const tracks = videos.map((v: YouTubeSearchVideo, index: number) => {
        const cleanTitle = (v.title || '')
          .replace(/[\(\[\{](Official Music Video|Official Audio|Lyric Video|Audio|MV|HD|4K|Topic)[\)\]\}]/gi, '')
          .trim();

        const candidateIds = [
          v.videoId,
          ...videos
            .map((candidate) => candidate.videoId)
            .filter((id) => id && id !== v.videoId)
            .slice(0, 4),
        ];

        return {
          id: `yt_${v.videoId || index}`,
          youtubeId: v.videoId,
          candidateIds,
          title: cleanTitle || v.title,
          artist: v.author?.name || 'Artist',
          album: 'YouTube Music',
          duration: v.seconds || 210,
          artworkUrl: v.thumbnail || v.image || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
          audioUrl: `https://www.youtube.com/watch?v=${v.videoId}`,
          genre: 'Music',
          rating: 5,
          isFavorite: false,
          source: 'YouTube',
        };
      });

      return res.json({ tracks });
    } catch (err: any) {
      console.error('YouTube search error:', err);
      return res.json({ tracks: [] });
    }
  });

  // Helper endpoint to lookup YouTube video ID for any title & artist.
  app.get('/api/youtube/find', async (req: Request, res: Response) => {
    try {
      const q = String(req.query.q || '').trim();
      if (!q) return res.status(400).json({ error: 'Query parameter q required' });

      const videos = await searchYouTube(q);
      const topVideo = videos[0];

      if (topVideo) {
        return res.json({
          youtubeId: topVideo.videoId,
          candidateIds: videos.slice(0, 8).map((v) => v.videoId).filter(Boolean),
          title: topVideo.title,
          duration: topVideo.seconds || 210,
          artworkUrl: topVideo.thumbnail,
        });
      }

      return res.status(404).json({ error: 'No video found' });
    } catch (err: any) {
      console.error('YouTube find error:', err);
      return res.status(404).json({ error: 'No video found' });
    }
  });

  // Resolve YouTube video metadata from a pasted URL or video ID for Import
  app.post('/api/youtube/resolve-url', async (req: Request, res: Response) => {
    try {
      const rawInput = String(req.body?.url || req.query?.url || '').trim();
      if (!rawInput) {
        return res.status(400).json({ error: 'Please provide a YouTube video URL or ID' });
      }

      let videoId = '';
      const ytRegex = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/|live\/))([a-zA-Z0-9_-]{11})/;
      const match = rawInput.match(ytRegex);

      if (match && match[1]) {
        videoId = match[1];
      } else if (/^[a-zA-Z0-9_-]{11}$/.test(rawInput)) {
        videoId = rawInput;
      }

      let videoData: any = null;

      if (videoId) {
        videoData = await resolveYouTubeVideo(videoId);
      }

      if (!videoData) {
        const searchVideos = await searchYouTube(rawInput);
        if (searchVideos.length > 0) {
          videoData = searchVideos[0];
          videoId = videoData.videoId;
        }
      }

      if (!videoData) {
        return res.status(404).json({ error: 'Could not find YouTube video from the provided link' });
      }

      const cleanTitle = (videoData.title || '')
        .replace(/[\(\[\{](Official Music Video|Official Audio|Lyric Video|Audio|MV|HD|4K|Topic)[\)\]\}]/gi, '')
        .trim();

      const artistName = videoData.author?.name?.replace(/ - Topic$/i, '') || 'YouTube Creator';

      const track = {
        id: `yt_${videoId || videoData.videoId}_${Date.now()}`,
        youtubeId: videoId || videoData.videoId,
        candidateIds: [videoId || videoData.videoId],
        title: cleanTitle || videoData.title || 'YouTube Audio',
        artist: artistName,
        album: 'YouTube Import',
        duration: videoData.seconds || 210,
        artworkUrl: videoData.thumbnail || videoData.image || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        audioUrl: `https://www.youtube.com/watch?v=${videoId || videoData.videoId}`,
        genre: 'YouTube Import',
        rating: 5,
        isFavorite: false,
        source: 'YouTube',
        isLocal: false
      };

      res.json({ track });
    } catch (err: any) {
      console.error('YouTube URL resolve error:', err);
      res.status(500).json({ error: err.message || 'Failed to resolve YouTube URL' });
    }
  });

  // Helper endpoint to stream audio through server proxy with proper CORS and Byte Range support
  app.get('/api/audio/proxy', async (req: Request, res: Response) => {
    try {
      const audioUrl = String(req.query.url || '');
      if (!audioUrl) return res.status(400).send('URL required');

      const headers: Record<string, string> = {};
      if (req.headers.range) {
        headers['Range'] = req.headers.range as string;
      }

      const audioRes = await fetch(audioUrl, { headers });
      if (!audioRes.ok) {
        return res.status(audioRes.status).send('Audio fetch failed');
      }

      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Content-Type', audioRes.headers.get('content-type') || 'audio/mpeg');
      if (audioRes.headers.get('content-length')) {
        res.setHeader('Content-Length', audioRes.headers.get('content-length')!);
      }
      if (audioRes.headers.get('content-range')) {
        res.setHeader('Content-Range', audioRes.headers.get('content-range')!);
        res.status(206);
      }

      // iTunes previews are short files; buffering them avoids stream/Range
      // incompatibilities that can occur in serverless runtimes.
      const arrayBuffer = await audioRes.arrayBuffer();
      res.send(Buffer.from(arrayBuffer));
    } catch (err: any) {
      console.error('Audio proxy error:', err);
      res.status(500).send(err.message);
    }
  });

  // Helper endpoint to lookup exact real song audio preview URL (iTunes MP3) for any title & artist
  app.get('/api/audio/match', async (req: Request, res: Response) => {
    try {
      const artist = String(req.query.artist || '');
      const title = String(req.query.title || '');
      const q = String(req.query.q || `${artist} ${title}`).trim();

      if (!q) return res.status(400).json({ error: 'Query parameters required' });

      const url = `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=music&entity=song&limit=3`;
      const response = await fetch(url);
      if (!response.ok) {
        return res.status(500).json({ error: 'iTunes API fetch failed' });
      }
      const data = await response.json();
      const result = data.results && data.results[0];

      if (result && result.previewUrl) {
        const artwork = (result.artworkUrl100 || '').replace('100x100bb.jpg', '600x600bb.jpg');
        const proxiedPreviewUrl = `/api/audio/proxy?url=${encodeURIComponent(result.previewUrl)}`;
        res.json({
          previewUrl: proxiedPreviewUrl,
          rawUrl: result.previewUrl,
          artworkUrl: artwork,
          trackName: result.trackName,
          artistName: result.artistName,
          duration: 30
        });
      } else {
        res.status(404).json({ error: 'No direct audio preview match found' });
      }
    } catch (err: any) {
      console.error('Audio match error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // Gemini AI endpoint: Generate deep song insights (key, BPM, trivia, mood, lyrics highlight)
  app.post('/api/ai/insights', async (req: Request, res: Response) => {
    const { title, artist, genre } = req.body || {};
    if (!title || !artist) {
      return res.status(400).json({ error: 'Title and artist are required' });
    }

    try {
      const prompt = `You are ZTune AI, an expert musicologist and audio producer. Provide a fascinating, concise breakdown of the song "${title}" by "${artist}" (Genre: ${genre || 'Pop/Rock'}).
      
      Return pure valid JSON with this exact structure:
      {
        "summary": "2 sentence compelling background story and musical style of this song",
        "bpm": "Estimated BPM (e.g. '120 BPM')",
        "musicalKey": "Estimated Key (e.g. 'A Minor')",
        "vibe": "3 descriptive mood adjectives (e.g. 'Euphoric, Nocturnal, Cinematic')",
        "funFact": "One surprising studio or lyric trivia fact about the track or artist",
        "suggestedEQPreset": "One of: 'Bass Boost', 'Rock', 'Pop', 'Electronic', 'Vocal Boost', 'Acoustic', 'Classical'"
      }
      Do not wrap in markdown quotes if possible, just return JSON.`;

      const text = await generateAIWithFallback(prompt, { responseMimeType: 'application/json' });
      if (text) {
        const parsed = JSON.parse(text);
        return res.json(parsed);
      }
    } catch (err: any) {
      console.warn('AI Insights note:', err?.message || err);
    }

    // Graceful fallback response if AI unavailable
    res.json({
      summary: `"${title}" by ${artist} is a standout track featuring atmospheric production and signature vocals.`,
      bpm: '124 BPM',
      musicalKey: 'C Minor',
      vibe: 'Atmospheric, Rhythmic, Immersive',
      funFact: 'Known for its distinctive synthesizer textures and dynamic vocal arrangement.',
      suggestedEQPreset: 'Electronic'
    });
  });

  // Gemini AI endpoint: Generate/fetch synced or structured lyrics
  app.post('/api/ai/lyrics', async (req: Request, res: Response) => {
    const { title, artist } = req.body || {};
    try {
      const prompt = `Provide realistic lyrics for the song "${title}" by "${artist}". 
      Return a JSON object with:
      {
        "lyrics": [
          { "time": 0, "text": "(Intro instrumental)" },
          { "time": 4, "text": "First line of verse 1..." },
          { "time": 10, "text": "Second line of verse 1..." }
        ],
        "fullText": "Full formatted song lyrics separated by line breaks"
      }
      Ensure at least 12 realistic lines with increasing timestamps from 0 to 180 seconds. Return only JSON.`;

      const text = await generateAIWithFallback(prompt, { responseMimeType: 'application/json' });
      if (text) {
        const parsed = JSON.parse(text);
        return res.json(parsed);
      }
    } catch (err: any) {
      console.warn('AI Lyrics note:', err?.message || err);
    }

    res.json({
      lyrics: [
        { time: 0, text: `♪ Intro - ${title || 'Music'} ♪` },
        { time: 5, text: `Feel the rhythm in the dark` },
        { time: 12, text: `Echoes shining like a spark` },
        { time: 20, text: `Every heartbeat keeps the time` },
        { time: 28, text: `We are floating in the chime` },
        { time: 38, text: `♪ (Chorus) ♪` },
        { time: 45, text: `Lost inside the melody` },
        { time: 55, text: `Nothing else we need to see` }
      ],
      fullText: `♪ Intro ♪\nFeel the rhythm in the dark\nEchoes shining like a spark\nEvery heartbeat keeps the time\nWe are floating in the chime\n♪ Chorus ♪\nLost inside the melody\nNothing else we need to see`
    });
  });

  // Gemini AI endpoint: Recommend similar songs tailored to currently playing track
  app.post('/api/ai/similar-tracks', async (req: Request, res: Response) => {
    try {
      const { currentTrack, count = 6, existingIds = [] } = req.body || {};
      if (!currentTrack || !currentTrack.title) {
        return res.status(400).json({ error: 'currentTrack object required' });
      }

      const { title, artist, genre, bpm, key } = currentTrack;
      let recommendedList: Array<{ title: string; artist: string; genre?: string; reason?: string }> = [];

      try {
        const prompt = `You are ZTune AI recommendation engine. The user is currently listening to "${title}" by "${artist}" (Genre: ${genre || 'Music'}, BPM: ${bpm || 'Unknown'}, Key: ${key || 'Unknown'}).
Recommend ${count} REAL, iconic, closely related songs that fit this exact sonic aesthetic, genre, mood, tempo, and style seamlessly.
Do NOT include "${title}" by "${artist}" itself.

Return pure JSON:
{
  "themeDescription": "One-line description of the sonic vibe (e.g., 'Atmospheric Synth & Late-Night Beats')",
  "songs": [
    { "title": "Track Name", "artist": "Artist Name", "genre": "Genre", "reason": "Short 4-word reason" }
  ]
}`;

        const text = await generateAIWithFallback(prompt, { responseMimeType: 'application/json' });
        if (text) {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed.songs) && parsed.songs.length > 0) {
            recommendedList = parsed.songs;
          }
        }
      } catch (aiErr) {
        console.warn('Gemini recommendation note, switching to direct YouTube search fallback:', aiErr);
      }

      const tracks: any[] = [];
      const seenIds = new Set<string>(existingIds);

      // If AI succeeded in returning song names, resolve their YouTube streams
      if (recommendedList.length > 0) {
        for (const song of recommendedList) {
          if (tracks.length >= count) break;
          try {
            const query = `${song.title} ${song.artist} audio`;
            const searchResult = { videos: await searchYouTube(query) };
            const video = (searchResult.videos || [])[0];

            if (video && !seenIds.has(`yt_${video.videoId}`) && !seenIds.has(video.videoId)) {
              seenIds.add(`yt_${video.videoId}`);
              const cleanTitle = video.title
                .replace(/[\(\[\{](Official Music Video|Official Audio|Lyric Video|Audio|MV|HD|4K)[\)\]\}]/gi, '')
                .trim();

              tracks.push({
                id: `yt_${video.videoId}`,
                youtubeId: video.videoId,
                title: song.title || cleanTitle || video.title,
                artist: song.artist || video.author?.name || 'Artist',
                album: `${genre || 'Similar'} Radio Mix`,
                duration: video.seconds || 215,
                artworkUrl: video.thumbnail || video.image || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
                audioUrl: `https://www.youtube.com/watch?v=${video.videoId}`,
                genre: song.genre || genre || 'Music',
                rating: 5,
                source: 'YouTube',
                bpm: bpm || '120 BPM',
                key: key || 'Original Key'
              });
            }
          } catch (searchErr) {
            console.warn('Search resolve note for song:', song.title);
          }
        }
      }

      // Direct YouTube search fallback if AI was unavailable or resolved fewer tracks
      if (tracks.length < count) {
        const fallbackQueries = [
          `${artist} mix songs`,
          `${genre || 'popular'} songs mix`,
          `similar to ${artist}`
        ];

        for (const q of fallbackQueries) {
          if (tracks.length >= count) break;
          try {
            const searchResult = { videos: await searchYouTube(q) };
            const videos = (searchResult.videos || []).slice(0, 10);
            for (const video of videos) {
              if (tracks.length >= count) break;
              if (video && !seenIds.has(`yt_${video.videoId}`) && !seenIds.has(video.videoId)) {
                if (video.title.toLowerCase().includes(title.toLowerCase()) && video.author?.name?.toLowerCase().includes(artist.toLowerCase())) {
                  continue;
                }
                seenIds.add(`yt_${video.videoId}`);
                const cleanTitle = video.title
                  .replace(/[\(\[\{](Official Music Video|Official Audio|Lyric Video|Audio|MV|HD|4K)[\)\]\}]/gi, '')
                  .trim();

                tracks.push({
                  id: `yt_${video.videoId}`,
                  youtubeId: video.videoId,
                  title: cleanTitle || video.title,
                  artist: video.author?.name || artist,
                  album: `${genre || 'Similar'} Radio Mix`,
                  duration: video.seconds || 215,
                  artworkUrl: video.thumbnail || video.image || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
                  audioUrl: `https://www.youtube.com/watch?v=${video.videoId}`,
                  genre: genre || 'Music',
                  rating: 5,
                  source: 'YouTube',
                  bpm: bpm || '120 BPM',
                  key: key || 'Original Key'
                });
              }
            }
          } catch (fbErr) {
            console.warn('Fallback query note:', q);
          }
        }
      }

      res.json({
        tracks,
        source: recommendedList.length > 0 ? 'ai_curated' : 'search_match',
        currentSeed: `${title} - ${artist}`
      });
    } catch (err: any) {
      console.warn('Similar tracks handler note:', err?.message || err);
      res.json({ tracks: [], source: 'fallback', currentSeed: 'Music' });
    }
  });

  // Gemini AI endpoint: Generate smart playlist recommendation
  app.post('/api/ai/recommend', async (req: Request, res: Response) => {
    const { basedOnTitle, basedOnArtist, count = 6 } = req.body || {};
    try {
      const prompt = `You are ZTune AI Music Curator. Generate ${count} real, iconic songs that fit the exact vibe and musical style of "${basedOnTitle}" by "${basedOnArtist}".
      Return pure JSON:
      {
        "playlistTitle": "A cool 2-3 word playlist name",
        "tracks": [
          { "title": "Song title", "artist": "Artist name", "genre": "Genre" }
        ]
      }`;

      const text = await generateAIWithFallback(prompt, { responseMimeType: 'application/json' });
      if (text) {
        const parsed = JSON.parse(text);
        return res.json(parsed);
      }
    } catch (err: any) {
      console.warn('AI recommend note:', err?.message || err);
    }

    res.json({
      playlistTitle: 'Synthwave & Nocturnal',
      tracks: [
        { title: 'Starboy', artist: 'The Weeknd', genre: 'Synth Pop' },
        { title: 'Nightcall', artist: 'Kavinsky', genre: 'Synthwave' },
        { title: 'Midnight City', artist: 'M83', genre: 'Electronic' },
        { title: 'Instant Crush', artist: 'Daft Punk', genre: 'Electronic' },
        { title: 'Dark Paradise', artist: 'Lana Del Rey', genre: 'Dream Pop' }
      ]
    });
  });

  // Helper endpoint to proxy images with CORS headers so canvas extraction never gets blocked
  app.get('/api/image/proxy', async (req: Request, res: Response) => {
    try {
      const imageUrl = String(req.query.url || '');
      if (!imageUrl) return res.status(400).send('URL required');

      const imageRes = await fetch(imageUrl);
      if (!imageRes.ok) {
        return res.status(imageRes.status).send('Image fetch failed');
      }

      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.setHeader('Content-Type', imageRes.headers.get('content-type') || 'image/jpeg');

      const arrayBuffer = await imageRes.arrayBuffer();
      res.send(Buffer.from(arrayBuffer));
    } catch (err: any) {
      console.error('Image proxy error:', err);
      res.status(500).send(err.message);
    }
  });

  return app;
}
