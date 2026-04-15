// ── Video ID extraction ────────────────────────────────────────────────────
export function extractVideoId(url) {
  const patterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /\/(?:embed|shorts)\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.trim().match(pattern);
    if (match) return match[1];
  }
  return null;
}

// ── Video metadata (oEmbed — CORS-friendly, no proxy needed) ───────────────
export async function getVideoInfo(videoId) {
  const res = await fetch(
    `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
  );
  if (!res.ok) throw new Error('Video not found or is private.');
  return res.json(); // { title, author_name, thumbnail_url, ... }
}

// ── Transcript fetching ───────────────────────────────────────────────────
function selectCaptionTrack(tracks) {
  if (!tracks?.length) return null;
  // Prefer manually-uploaded English
  const manualEn = tracks.find((t) => t.languageCode === 'en' && t.kind !== 'asr');
  if (manualEn) return manualEn;
  // ASR (auto-generated) English
  const asrEn = tracks.find((t) => t.languageCode === 'en' && t.kind === 'asr');
  if (asrEn) return asrEn;
  // Any English variant (en-US, en-GB, etc.)
  const enVariant = tracks.find((t) => t.languageCode?.startsWith('en'));
  if (enVariant) return enVariant;
  // First available track regardless of language
  return tracks[0];
}

function json3ToPlainText(data) {
  if (!data?.events) return '';
  return data.events
    .filter((e) => e.segs)
    .map((e) =>
      e.segs
        .map((s) => s.utf8 ?? '')
        .join('')
        .replace(/\n/g, ' ')
        .trim()
    )
    .filter(Boolean)
    .join(' ')
    .replace(/\[.*?\]/g, '') // Remove [Music], [Applause], etc.
    .replace(/\s+/g, ' ')
    .trim();
}

// ── YouTube search (no API key — parses search results page via proxy) ────
export async function searchYouTubeVideo(query) {
  try {
    // sp=EgIQAQ%3D%3D filters for videos only
    const res = await fetch(`/api/yt/results?search_query=${encodeURIComponent(query)}&sp=EgIQAQ%3D%3D`);
    if (!res.ok) return null;
    const html = await res.text();

    // First videoRenderer in the results is the top hit
    const match = html.match(/"videoRenderer":\{"videoId":"([a-zA-Z0-9_-]{11})"/);
    if (!match) return null;
    const videoId = match[1];

    // Fetch title via oEmbed (CORS-friendly, no proxy needed)
    const info = await getVideoInfo(videoId).catch(() => ({ title: query }));
    return { videoId, title: info.title };
  } catch {
    return null;
  }
}

// ── Transcript fetching ───────────────────────────────────────────────────
export async function fetchYouTubeTranscript(videoId) {
  // Step 1: fetch the watch page through the proxy
  const pageRes = await fetch(`/api/yt/watch?v=${videoId}`);
  if (!pageRes.ok) throw new Error(`Could not reach YouTube (status ${pageRes.status}).`);
  const html = await pageRes.text();

  // Step 2: extract ytInitialPlayerResponse
  const jsonMatch = html.match(/ytInitialPlayerResponse\s*=\s*(\{.+?\})\s*;/s);
  if (!jsonMatch) {
    // Possibly got a consent page — surface a clear message
    if (html.includes('consent.youtube.com') || html.includes('CONSENT')) {
      throw new Error('YouTube returned a cookie consent page. Open youtube.com in your browser, accept cookies, then try again.');
    }
    throw new Error('Could not parse YouTube page data. The video may be unavailable.');
  }

  let playerResponse;
  try {
    playerResponse = JSON.parse(jsonMatch[1]);
  } catch {
    throw new Error('Failed to parse YouTube player data.');
  }

  // Step 3: get caption tracks
  const tracks =
    playerResponse?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
  const track = selectCaptionTrack(tracks);

  if (!track) {
    throw new Error('No captions found for this video. Try a video that has subtitles or auto-generated captions enabled.');
  }

  // Step 4: fetch the caption file through the proxy
  // baseUrl is an absolute https://www.youtube.com URL — rewrite to proxy path
  const captionUrl =
    track.baseUrl.replace('https://www.youtube.com', '/api/yt') + '&fmt=json3';

  const captionRes = await fetch(captionUrl);
  if (!captionRes.ok) throw new Error(`Could not fetch caption file (status ${captionRes.status}).`);

  const json3 = await captionRes.json();
  const transcript = json3ToPlainText(json3);

  if (!transcript) throw new Error('Transcript appears to be empty.');

  return transcript;
}
