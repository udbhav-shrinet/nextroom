export const STEMS = [
  // Weather & Elements
  {
    id: 'light-rain',
    name: 'Window Drizzle',
    category: 'Weather',
    type: 'rain',
    icon: 'CloudRain',
    defaultVol: 0,
    defaultPan: 0,
    tone: 3200,
    desc: 'Soft continuous raindrops against double-paned window glass.'
  },
  {
    id: 'tin-roof-rain',
    name: 'Tin Roof Torrent',
    category: 'Weather',
    type: 'tin_rain',
    icon: 'CloudDrizzle',
    defaultVol: 0,
    defaultPan: -0.2,
    tone: 4500,
    desc: 'Crisp percussive patter of rainfall on metal roof sheets.'
  },
  {
    id: 'distant-thunder',
    name: 'Distant Rolling Thunder',
    category: 'Weather',
    type: 'thunder',
    icon: 'CloudLightning',
    defaultVol: 0,
    defaultPan: 0.3,
    tone: 250,
    desc: 'Low rumble echoing across distant hilltops.'
  },
  {
    id: 'blizzard-wind',
    name: 'Blizzard Howl',
    category: 'Weather',
    type: 'wind',
    icon: 'Wind',
    defaultVol: 0,
    defaultPan: 0.1,
    tone: 800,
    desc: 'Sub-zero gusts whistling through alpine eaves.'
  },
  {
    id: 'ocean-waves',
    name: 'Ocean Shore Surf',
    category: 'Weather',
    type: 'waves',
    icon: 'Waves',
    defaultVol: 0,
    defaultPan: 0,
    tone: 1200,
    desc: 'Slow rhythmic tidal breaks over damp pebbles.'
  },
  {
    id: 'forest-creek',
    name: 'Forest Creek Stream',
    category: 'Weather',
    type: 'creek',
    icon: 'Droplets',
    defaultVol: 0,
    defaultPan: -0.4,
    tone: 2800,
    desc: 'Clean mountain spring bubbling over polished stones.'
  },

  // Fire & Earth
  {
    id: 'fireplace',
    name: 'Hearth Wood Fire',
    category: 'Fire & Earth',
    type: 'fire',
    icon: 'Flame',
    defaultVol: 0,
    defaultPan: 0.3,
    tone: 2200,
    desc: 'Dry birch logs crackling with occasional sparks and deep warmth.'
  },
  {
    id: 'boiling-kettle',
    name: 'Simmering Tea Kettle',
    category: 'Fire & Earth',
    type: 'kettle',
    icon: 'Coffee',
    defaultVol: 0,
    defaultPan: -0.5,
    tone: 3800,
    desc: 'Gentle water simmer with rising steam hiss on a cast-iron stove.'
  },
  {
    id: 'dripping-cave',
    name: 'Dripping Cave Cavern',
    category: 'Fire & Earth',
    type: 'cave',
    icon: 'Activity',
    defaultVol: 0,
    defaultPan: 0.2,
    tone: 1800,
    desc: 'Resonant cavern drops falling into still mineral pools.'
  },

  // Cozy Interiors
  {
    id: 'cafe-murmur',
    name: 'Parisian Cafe Murmur',
    category: 'Cozy Interiors',
    type: 'cafe',
    icon: 'Users',
    defaultVol: 0,
    defaultPan: 0.4,
    tone: 2600,
    desc: 'Distant French conversation, espresso cups, and porcelain clink.'
  },
  {
    id: 'sleeper-train',
    name: 'Overnight Sleeper Train',
    category: 'Cozy Interiors',
    type: 'train',
    icon: 'Navigation',
    defaultVol: 0,
    defaultPan: -0.1,
    tone: 600,
    desc: 'Hypnotic steel rail cadence and low chassis suspension sway.'
  },
  {
    id: 'grandfather-clock',
    name: 'Grandfather Clock Tick',
    category: 'Cozy Interiors',
    type: 'clock',
    icon: 'Clock',
    defaultVol: 0,
    defaultPan: -0.6,
    tone: 1400,
    desc: 'Slow pendulum oscillation inside an antique oak case.'
  },
  {
    id: 'vinyl-dust',
    name: 'Vinyl Dust & Needle Pops',
    category: 'Cozy Interiors',
    type: 'vinyl',
    icon: 'Disc',
    defaultVol: 0,
    defaultPan: 0,
    tone: 4000,
    desc: 'Micro-scratches, warm groove friction, and stylus rumble.'
  },
  {
    id: 'cassette-hum',
    name: 'Cassette Tape Head Hum',
    category: 'Cozy Interiors',
    type: 'tape',
    icon: 'Radio',
    defaultVol: 0,
    defaultPan: 0,
    tone: 2800,
    desc: 'Vintage ferric oxide tape bias and electromagnetic motor murmur.'
  },

  // City & Machines
  {
    id: 'subway-rumble',
    name: 'Deep Subway Rumble',
    category: 'City & Machines',
    type: 'subway',
    icon: 'Truck',
    defaultVol: 0,
    defaultPan: -0.2,
    tone: 180,
    desc: 'Low vibration from underground metro line beneath building foundation.'
  },
  {
    id: 'fan-hum',
    name: 'Electric Desk Fan Hum',
    category: 'City & Machines',
    type: 'fan',
    icon: 'RotateCw',
    defaultVol: 0,
    defaultPan: 0.5,
    tone: 450,
    desc: 'Steady warm air displacement from a metallic three-blade desk fan.'
  },
  {
    id: 'server-room',
    name: 'Data Center Rack Whir',
    category: 'City & Machines',
    type: 'server',
    icon: 'Server',
    defaultVol: 0,
    defaultPan: -0.3,
    tone: 850,
    desc: 'Array of high-static fans and brushless server blower airflow.'
  },
  {
    id: 'spaceship-drone',
    name: 'Starship Warp Core Drone',
    category: 'City & Machines',
    type: 'spaceship',
    icon: 'Radio',
    defaultVol: 0,
    defaultPan: 0,
    tone: 220,
    desc: 'Hypersonic sub-bass reactor resonance in deep pressurized hull.'
  },

  // Voices, Radio Comms & Chatter
  {
    id: 'live-atc',
    name: 'Live Tower ATC Comms',
    category: 'Voices & Comms',
    type: 'atc',
    icon: 'Radio',
    defaultVol: 0,
    defaultPan: 0.5,
    tone: 3000,
    desc: 'Procedural aeronautical squawk, phonetic calls, and clearance chatter.'
  },
  {
    id: 'nasa-apollo',
    name: 'NASA Houston Telemetry',
    category: 'Voices & Comms',
    type: 'nasa',
    icon: 'Satellite',
    defaultVol: 0,
    defaultPan: -0.5,
    tone: 3400,
    desc: 'Quindar beep tones, telemetry downlinks, and CAPCOM communications.'
  },
  {
    id: 'police-scanner',
    name: 'Cyberpunk Dispatch Scanner',
    category: 'Voices & Comms',
    type: 'scanner',
    icon: 'Shield',
    defaultVol: 0,
    defaultPan: 0.3,
    tone: 2900,
    desc: 'En route status codes, perimeter checks, and rain patrol telemetry.'
  },
  {
    id: 'tokyo-izakaya',
    name: 'Tokyo Izakaya Murmur',
    category: 'Voices & Comms',
    type: 'izakaya',
    icon: 'MessageSquare',
    defaultVol: 0,
    defaultPan: -0.4,
    tone: 2400,
    desc: 'Friendly evening toasts, grill sizzle, and gentle Shibuya chatter.'
  },
  {
    id: 'spoken-philosophy',
    name: 'Spoken Contemplation',
    category: 'Voices & Comms',
    type: 'philosophy',
    icon: 'BookOpen',
    defaultVol: 0,
    defaultPan: 0,
    tone: 2100,
    desc: 'Warm analog lecture broadcast exploring consciousness, time, and flow.'
  },
  {
    id: 'ai-whisper-dj',
    name: 'AI Sanctuary DJ Voice',
    category: 'Voices & Comms',
    type: 'whisper_dj',
    icon: 'Mic',
    defaultVol: 0,
    defaultPan: 0,
    tone: 3500,
    desc: 'Soft binaural spoken prompts on focus, hourly markers, and mindfulness.'
  },

  // ASMR & Mechanical
  {
    id: 'mechanical-keyboard',
    name: 'Thocky Lubed Keyboard',
    category: 'ASMR & Brainwaves',
    type: 'keyboard',
    icon: 'Keyboard',
    defaultVol: 0,
    defaultPan: 0,
    tone: 3200,
    desc: 'Heavy linear switches typing steady code blocks on a brass plate.'
  },
  {
    id: 'cat-purr',
    name: 'Sleeping Cat Purr',
    category: 'ASMR & Brainwaves',
    type: 'cat_purr',
    icon: 'Heart',
    defaultVol: 0,
    defaultPan: 0.6,
    tone: 280,
    desc: 'Warm, low-frequency 25Hz chest vibration from sleeping feline.'
  },
  {
    id: 'page-turn',
    name: 'Linen Paper Page Turning',
    category: 'ASMR & Brainwaves',
    type: 'page_turn',
    icon: 'FileText',
    defaultVol: 0,
    defaultPan: -0.5,
    tone: 3600,
    desc: 'Aged archival book pages turning slowly in quiet solitude.'
  },

  // Brainwaves & Noise Lab
  {
    id: 'alpha-10hz',
    name: '10Hz Alpha Focus Binaural',
    category: 'ASMR & Brainwaves',
    type: 'binaural_alpha',
    icon: 'Headphones',
    defaultVol: 0,
    defaultPan: 0,
    tone: 210,
    desc: '10Hz stereo frequency offset designed for relaxed deep concentration.'
  },
  {
    id: 'gamma-40hz',
    name: '40Hz Gamma Flow State',
    category: 'ASMR & Brainwaves',
    type: 'binaural_gamma',
    icon: 'Zap',
    defaultVol: 0,
    defaultPan: 0,
    tone: 240,
    desc: '40Hz rhythmic binaural entrainment for peak problem-solving.'
  },
  {
    id: 'theta-4hz',
    name: '4Hz Theta Deep Zen',
    category: 'ASMR & Brainwaves',
    type: 'binaural_theta',
    icon: 'Moon',
    defaultVol: 0,
    defaultPan: 0,
    tone: 160,
    desc: 'Slow 4Hz waves supporting meditative daydreaming and unwinding.'
  },
  {
    id: 'solfeggio-432',
    name: '432Hz Harmonic Solfeggio',
    category: 'ASMR & Brainwaves',
    type: 'solfeggio',
    icon: 'Music',
    defaultVol: 0,
    defaultPan: 0,
    tone: 432,
    desc: 'Pure acoustic tuning frequency resonant with mathematical geometry.'
  },
  {
    id: 'singing-bowl',
    name: 'Tibetan Singing Bowl Drone',
    category: 'ASMR & Brainwaves',
    type: 'singing_bowl',
    icon: 'Disc',
    defaultVol: 0,
    defaultPan: 0.2,
    tone: 580,
    desc: 'Rich bronze overtone drone vibrating with long acoustic sustain.'
  },
  {
    id: 'brown-noise',
    name: 'Warm Brown Noise',
    category: 'ASMR & Brainwaves',
    type: 'brown_noise',
    icon: 'Sliders',
    defaultVol: 0,
    defaultPan: 0,
    tone: 500,
    desc: 'Deep 6dB/octave low-pass cascade masking distracting background noises.'
  },
  {
    id: 'pink-noise',
    name: 'Balanced Pink Noise',
    category: 'ASMR & Brainwaves',
    type: 'pink_noise',
    icon: 'Sliders',
    defaultVol: 0,
    defaultPan: 0,
    tone: 2500,
    desc: 'Equal energy per octave simulating falling waterfall or distant rain.'
  },
  {
    id: 'white-noise',
    name: 'Soft White Air Noise',
    category: 'ASMR & Brainwaves',
    type: 'white_noise',
    icon: 'Sliders',
    defaultVol: 0,
    defaultPan: 0,
    tone: 6000,
    desc: 'Uniform spectrum frequency blanket across the entire human hearing range.'
  },
  {
    id: 'lofi-piano',
    name: 'Felt Lo-Fi Piano Chords',
    category: 'Textures',
    type: 'lofi_piano',
    icon: 'Music',
    defaultVol: 0,
    defaultPan: 0,
    tone: 2800,
    desc: 'Soft upright piano dampened with felt cloth playing jazzy chords.'
  }
];
