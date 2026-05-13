/* ══════════════════════════════════════════════════════════════════════════
   BrewReads — Complete Theme System
   Each mood is a complete sensory world, not just a color palette.
   Inspired by the author-voice approach: make users FEEL something.
   ══════════════════════════════════════════════════════════════════════════ */

export const THEMES = {

  /* ── 😊 HAPPY ────────────────────────────────────────────────────────────
     References: bubble fields, pink flower meadows, pearl iridescence
     Feel: "The world is full of sunshine today"
     Vibe: golden hour, soft wind, everything feels light and possible
  ────────────────────────────────────────────────────────────────────────── */
  happy: {
    name: 'Happy',
    emoji: '😊',
    authorVoice: 'The world is full of sunshine today.',
    tagline: 'Let joy lead you to your next story',
    entryMessage: 'Today feels like the first page of something wonderful.',

    // Colours
    bg: 'linear-gradient(160deg, #fdf0ff 0%, #fce4f3 30%, #fff5d4 65%, #ffe8f5 100%)',
    primary: '#d4689a',
    secondary: '#b5a0d4',
    accent: '#f9c784',
    card: 'rgba(255,255,255,0.60)',
    cardBorder: 'rgba(212,104,154,0.22)',
    text: '#5a2d4a',
    subtext: '#9a6a7a',
    btnBg: 'linear-gradient(135deg, #d4689a, #b5a0d4)',
    btnText: '#ffffff',
    glow: 'rgba(212,104,154,0.18)',

    // Atmosphere
    particles: 'bubbles',
    particleColor: 'rgba(212,104,154,0.35)',
    grain: false,
    blur: false,

    // Iridescent pearl glass effect on cards
    cardEffect: 'iridescent',
    // Floating pearl/bubble particles
    ambientLight: 'rgba(249,199,132,0.12)',

    // Typography
    font: "'Georgia', serif",
    headingStyle: 'soft',

    // Reading environment
    readingBg: '#fffaf8',
    readingText: '#3a1a2a',
    readingFont: "'Georgia', serif",
  },

  /* ── 😢 MELANCHOLY ───────────────────────────────────────────────────────
     References: girl in crowd with red roses, anime girl by stream, motion blur
     Feel: "Standing still while the world moves around you"
     Vibe: cinematic rain, film grain, alone but beautifully so
  ────────────────────────────────────────────────────────────────────────── */
  melancholy: {
    name: 'Melancholy',
    emoji: '😢',
    authorVoice: 'Some feelings are too vast for words. A story understands.',
    tagline: 'Standing still while the world moves around you',
    entryMessage: 'You don\'t have to explain it. A story will hold it for you.',

    // Colours — dark teal/slate, crimson roses, muted grey-green
    bg: 'linear-gradient(160deg, #0d1a1f 0%, #1a2830 40%, #0f1518 70%, #1a1020 100%)',
    primary: '#c0392b',
    secondary: '#7fa8b8',
    accent: '#c0392b',
    card: 'rgba(255,255,255,0.04)',
    cardBorder: 'rgba(192,57,43,0.22)',
    text: '#d0dde5',
    subtext: '#7fa8b8',
    btnBg: 'linear-gradient(135deg, #c0392b, #8b1a1a)',
    btnText: '#ffffff',
    glow: 'rgba(192,57,43,0.12)',

    // Atmosphere — slow rain, film grain, motion blur edges, single warm light
    particles: 'rain',
    particleColor: 'rgba(127,168,184,0.28)',
    grain: true,          // film grain overlay
    blur: true,           // motion blur on edges
    lightBeam: true,      // single warm light beam cutting through

    // Typography — elegant serif, cinematic
    font: "'Georgia', serif",
    headingStyle: 'cinematic',

    // Reading environment
    readingBg: '#0a1015',
    readingText: '#c8d8e0',
    readingFont: "'Georgia', serif",
  },

  /* ── 🌙 COZY ─────────────────────────────────────────────────────────────
     References: sunset bedroom fairy lights, cherry blossom window, rainy night latte
     Feel: "The night is yours. The world can wait. Slow down."
     Vibe: amber candlelight, rain on glass, fairy lights bokeh, coffee
  ────────────────────────────────────────────────────────────────────────── */
  cozy: {
    name: 'Cozy',
    emoji: '🌙',
    authorVoice: 'The night is yours. The world can wait. Slow down.',
    tagline: 'Collect beautiful moments, not things',
    entryMessage: 'Rain outside. Candle lit. Coffee warm. You\'re exactly where you should be.',

    // Colours — deep warm brown/amber, golden, cream
    bg: 'linear-gradient(160deg, #0f0500 0%, #1a0a00 40%, #251200 70%, #1a0800 100%)',
    primary: '#f59e0b',
    secondary: '#fb923c',
    accent: '#fde68a',
    card: 'rgba(255,200,100,0.07)',
    cardBorder: 'rgba(245,158,11,0.22)',
    text: '#fef3c7',
    subtext: '#fbbf24',
    btnBg: 'linear-gradient(135deg, #f59e0b, #fb923c)',
    btnText: '#1a0500',
    glow: 'rgba(245,158,11,0.18)',

    // Atmosphere — fairy lights bokeh, rain drops, candle flicker, warm grain
    particles: 'fairylights',
    particleColor: 'rgba(253,230,138,0.55)',
    grain: false,
    blur: false,
    candleFlicker: true,   // candle glow at bottom
    rainOnGlass: true,     // rain on window effect

    // Typography — soft handwritten feel
    font: "'Georgia', serif",
    headingStyle: 'warm',

    // Reading environment
    readingBg: '#0a0300',
    readingText: '#fef3c7',
    readingFont: "'Georgia', serif",
  },

  /* ── 💭 CURIOUS ──────────────────────────────────────────────────────────
     References: shadow in flower field, purple converse with flowers, petals floating up
     Feel: "Looking up at an infinite sky full of wonder"
     Vibe: petals drifting upward, purple/gold sunflare, magical & whimsical
  ────────────────────────────────────────────────────────────────────────── */
  curious: {
    name: 'Curious',
    emoji: '💭',
    authorVoice: 'What lies beyond the next page? Only one way to find out.',
    tagline: 'Looking up at an infinite sky full of wonder',
    entryMessage: 'Every book is a door. Every page is a question. What are you curious about?',

    // Colours — deep dreamy blue, lavender purple, warm gold sunflare
    bg: 'linear-gradient(160deg, #0a1628 0%, #1a2a4a 40%, #0d1f3c 70%, #1a1535 100%)',
    primary: '#a78bfa',
    secondary: '#60a5fa',
    accent: '#fbbf24',
    card: 'rgba(167,139,250,0.07)',
    cardBorder: 'rgba(167,139,250,0.22)',
    text: '#ede9fe',
    subtext: '#c4b5fd',
    btnBg: 'linear-gradient(135deg, #a78bfa, #60a5fa)',
    btnText: '#ffffff',
    glow: 'rgba(167,139,250,0.18)',

    // Atmosphere — petals floating UPWARD, stars, sunflare glow
    particles: 'petals',
    particleColor: 'rgba(167,139,250,0.5)',
    grain: false,
    blur: false,
    sunflare: true,        // golden sunflare in corner
    petalsDirection: 'up', // petals float upward (unique!)

    // Typography — whimsical, slightly rounded
    font: "'Georgia', serif",
    headingStyle: 'whimsical',

    // Reading environment
    readingBg: '#080e1a',
    readingText: '#e8e4fc',
    readingFont: "'Georgia', serif",
  },

  /* ── 😤 ADVENTUROUS ──────────────────────────────────────────────────────
     References: Milky Way galaxy girl, Northern Lights aurora, mountain jeep, "Live in the moment"
     Feel: "The universe is vast. Your story is just beginning."
     Vibe: aurora borealis, shooting stars, cosmic purple/green, infinite
  ────────────────────────────────────────────────────────────────────────── */
  adventurous: {
    name: 'Adventurous',
    emoji: '😤',
    authorVoice: 'The universe is vast. Your story is just beginning.',
    tagline: 'To do: Live in the moment',
    entryMessage: 'Under the galaxy. Northern lights dancing. The whole universe ahead of you.',

    // Colours — deep cosmic dark, aurora green, cosmic purple, galaxy pink
    bg: 'linear-gradient(160deg, #020008 0%, #0a0015 40%, #001a08 70%, #050010 100%)',
    primary: '#00ff88',
    secondary: '#7c3aed',
    accent: '#e879f9',
    card: 'rgba(0,255,136,0.05)',
    cardBorder: 'rgba(0,255,136,0.18)',
    text: '#e0ffe8',
    subtext: '#00cc6a',
    btnBg: 'linear-gradient(135deg, #00ff88, #7c3aed)',
    btnText: '#000000',
    glow: 'rgba(0,255,136,0.12)',

    // Atmosphere — aurora waves at top, shooting stars, galaxy nebula texture
    particles: 'stars',
    particleColor: 'rgba(0,255,136,0.55)',
    grain: false,
    blur: false,
    aurora: true,          // animated aurora borealis waves
    shootingStars: true,   // occasional shooting stars

    // Typography — bold, handwritten accent
    font: "'Georgia', serif",
    headingStyle: 'bold',

    // Reading environment
    readingBg: '#010005',
    readingText: '#d0ffd8',
    readingFont: "'Georgia', serif",
  },

  /* ── 😌 CALM ─────────────────────────────────────────────────────────────
     References: golden clouds "Peace", pink flower field, girl reading by window, forest cabin rain
     Feel: "Above the clouds, everything becomes clear"
     Vibe: drifting clouds, golden light rays, autumn leaves, fireplace glow
  ────────────────────────────────────────────────────────────────────────── */
  calm: {
    name: 'Calm',
    emoji: '😌',
    authorVoice: 'Peace. Just that. Peace.',
    tagline: 'Above the clouds, everything becomes clear',
    entryMessage: 'Sit by the fireplace. Rain on the windows. Tea in hand. This moment is enough.',

    // Colours — muted dusk layers: dark blue-grey → mauve → sage green
    bg: 'linear-gradient(160deg, #1a1520 0%, #2d2438 40%, #1a2820 70%, #251a30 100%)',
    primary: '#c9a0a0',
    secondary: '#8fad88',
    accent: '#f5e6c8',
    card: 'rgba(255,240,240,0.05)',
    cardBorder: 'rgba(201,160,160,0.22)',
    text: '#f0ece8',
    subtext: '#b8a8a0',
    btnBg: 'linear-gradient(135deg, #c9a0a0, #8fad88)',
    btnText: '#ffffff',
    glow: 'rgba(201,160,160,0.12)',

    // Atmosphere — slow drifting clouds, golden light rays, autumn leaves, rain on glass
    particles: 'clouds',
    particleColor: 'rgba(245,230,200,0.28)',
    grain: false,
    blur: false,
    goldenRays: true,      // subtle golden light breaking through clouds
    autumnLeaves: true,    // falling autumn leaves
    fireplaceGlow: true,   // warm glow at bottom corner

    // Typography — elegant serif, generous spacing
    font: "'Georgia', serif",
    headingStyle: 'elegant',

    // Reading environment
    readingBg: '#100d14',
    readingText: '#ede8e4',
    readingFont: "'Georgia', serif",
  },

  /* ── 💖 ROMANTIC ─────────────────────────────────────────────────────────
     References: couple with flowers, bookstore kiss (blurry), petals/pages collage
     Feel: "Every great love story starts with a single page"
     Vibe: dark old library, rose petals falling, candlelight, vintage, timeless
  ────────────────────────────────────────────────────────────────────────── */
  romantic: {
    name: 'Romantic',
    emoji: '💖',
    authorVoice: 'Every great love story starts with a single page.',
    tagline: 'Petals & Pages — timeless love',
    entryMessage: 'A stolen kiss between bookshelves. Rose petals falling. Candlelight. This is where love lives.',

    // Colours — deep burgundy/black, dusty rose, antique gold, deep crimson
    bg: 'linear-gradient(160deg, #0f0508 0%, #1a0a10 40%, #0a0510 70%, #150810 100%)',
    primary: '#e8a0b0',
    secondary: '#c9a84c',
    accent: '#8b1a2f',
    card: 'rgba(232,160,176,0.06)',
    cardBorder: 'rgba(232,160,176,0.18)',
    text: '#f5e8ec',
    subtext: '#c88898',
    btnBg: 'linear-gradient(135deg, #8b1a2f, #e8a0b0)',
    btnText: '#ffffff',
    glow: 'rgba(232,160,176,0.12)',

    // Atmosphere — rose petals falling, bokeh dots, vintage film grain, blurry soft edges
    particles: 'rosepetals',
    particleColor: 'rgba(232,160,176,0.45)',
    grain: true,           // vintage film grain
    blur: false,
    bokeh: true,           // soft bokeh light dots floating
    candleCorners: true,   // warm candlelight in corners

    // Typography — elegant italic serif, antique gold
    font: "'Georgia', serif",
    headingStyle: 'romantic',

    // Reading environment
    readingBg: '#080305',
    readingText: '#f0e4e8',
    readingFont: "'Georgia', serif",
  },

  /* ── 🎯 FOCUSED ──────────────────────────────────────────────────────────
     References: lofi anime sunset study, golden morning tulips, "Dream big!", consistency aesthetic
     Feel: "Dream big. One page at a time."
     Vibe: lofi girl energy, golden hour study, dust particles, moon appearing
  ────────────────────────────────────────────────────────────────────────── */
  focused: {
    name: 'Focused',
    emoji: '🎯',
    authorVoice: 'Dream big. One page at a time.',
    tagline: 'Consistency is key. You are in your element.',
    entryMessage: 'Golden morning light. Coffee beside you. Everything else can wait. This is your time.',

    // Colours — warm dark evening purple, warm blue, sage, golden amber
    bg: 'linear-gradient(160deg, #1a1a2a 0%, #1f1f35 40%, #151525 70%, #1a1520 100%)',
    primary: '#4a7fa5',
    secondary: '#8fad88',
    accent: '#d4a856',
    card: 'rgba(255,255,255,0.045)',
    cardBorder: 'rgba(74,127,165,0.22)',
    text: '#e8eef2',
    subtext: '#8fa8b8',
    btnBg: 'linear-gradient(135deg, #4a7fa5, #d4a856)',
    btnText: '#ffffff',
    glow: 'rgba(74,127,165,0.12)',

    // Atmosphere — floating dust particles, lofi golden light from window, moon rising
    particles: 'dust',
    particleColor: 'rgba(212,168,86,0.28)',
    grain: false,
    blur: false,
    lofiWindow: true,      // warm golden light from window
    moonRising: true,      // subtle moon appearing in background

    // Typography — clean modern, "Dream big!" handwritten accent
    font: "'Arial', sans-serif",
    headingStyle: 'clean',

    // Reading environment
    readingBg: '#0f0f1a',
    readingText: '#e0e8f0',
    readingFont: "'Arial', sans-serif",
  },

  /* ── 😵 STRESSED ─────────────────────────────────────────────────────────
     References: manga crying against door, girl painting alone in dark, single light beam
     Feel: "You found your refuge. Rest here a while."
     Vibe: manga darkness, charcoal heavy, single crack of warm amber light, breathing
  ────────────────────────────────────────────────────────────────────────── */
  stressed: {
    name: 'Stressed',
    emoji: '😵',
    authorVoice: 'The door is closed. The world is outside. You are here now. Breathe.',
    tagline: 'You found your refuge. Rest here a while.',
    entryMessage: 'The door is closed.\nThe world is outside.\nYou are here now.\n\nBreathe.\n\nLet\'s find you a story.',

    // Colours — deep charcoal almost-black, cold blue-grey, warm amber crack of light
    bg: 'linear-gradient(160deg, #0a0a0c 0%, #0d0d0f 40%, #080808 70%, #0c0a0e 100%)',
    primary: '#7a8fa6',
    secondary: '#c4833a',
    accent: '#c4833a',
    card: 'rgba(255,255,255,0.025)',
    cardBorder: 'rgba(196,131,58,0.18)',
    text: '#c8d0d8',
    subtext: '#7a8fa6',
    btnBg: 'linear-gradient(135deg, #c4833a, #7a8fa6)',
    btnText: '#ffffff',
    glow: 'rgba(196,131,58,0.1)',

    // Atmosphere — heavy film grain, single amber light beam, slow breathing pulse, manga ink
    particles: 'breath',
    particleColor: 'rgba(196,131,58,0.18)',
    grain: true,           // heavy film grain — raw, like manga
    blur: false,
    lightBeam: true,       // single warm crack of light
    breathingPulse: true,  // slow background breathing animation
    inkSplash: true,       // subtle manga-style ink texture

    // Typography — raw mix of handwritten + clean, like manga speech bubbles
    font: "'Georgia', serif",
    headingStyle: 'raw',

    // Reading environment
    readingBg: '#050505',
    readingText: '#c0c8d0',
    readingFont: "'Georgia', serif",
  },
}

/* ══════════════════════════════════════════════════════════════════════════
   HELPERS
   ══════════════════════════════════════════════════════════════════════════ */

export const getMoodTheme = (mood) => THEMES[mood] || THEMES.cozy

// Canonical mood order for carousel / display
export const MOOD_ORDER = [
  'happy',
  'cozy',
  'calm',
  'romantic',
  'curious',
  'focused',
  'melancholy',
  'adventurous',
  'stressed',
]

// Author voice lines — shown on mood entry
export const getMoodEntry = (mood) => {
  const t = THEMES[mood]
  return {
    message: t.entryMessage,
    voice:   t.authorVoice,
    tagline: t.tagline,
  }
}

// Mood descriptions for carousel / selection
export const MOOD_DESCRIPTIONS = {
  happy:       'Sunshine, bubbles, golden hour — everything feels light',
  melancholy:  'Beautiful sadness. Cinematic rain. Red roses in hand.',
  cozy:        'Rainy night, amber candlelight, coffee, fairy lights',
  curious:     'Petals floating up. Infinite blue sky. Endless wonder.',
  adventurous: 'Aurora borealis. Galaxy above. The universe is yours.',
  calm:        'Clouds parting. Golden light. A fireplace in the rain.',
  romantic:    'Rose petals. Dark library. Candlelight. Timeless love.',
  focused:     'Golden morning. Lofi beats. One page at a time.',
  stressed:    'The door is closed. Breathe. You\'re safe here.',
}