import { Style } from '@/types';

/**
 * Predefined Master Prompts engineered via ChatGPT / Sider.ai Prompt Engineering framework.
 * Every prompt specifies:
 * 1. Identity & Facial Geometry Anchoring (protects user's face, smile, eyes)
 * 2. Era-specific wardrobe, styling, and period accessories
 * 3. Authentic lighting schema (e.g. tungsten neon, Rembrandt, high-key studio)
 * 4. Camera & Film Stock Specs (Kodachrome 64, Arri 35mm, Hasselblad 80mm)
 * 5. Negative prompt constraints to prevent AI artifacts
 */
export const STYLES_SEED: Omit<Style, 'id'>[] = [
  {
    title: '1980s Retro',
    slug: 'retro-80s',
    thumbnail: '/styles/retro-80s.jpg',
    prompt:
      'Cinematic 1980s editorial portrait photograph. The subject is styled in iconic 1980s fashion with retro leather jacket, acid-wash denim collar, neon synthwave background with palm reflections. Shot on 35mm Kodachrome 64 film, warm analog color grading, soft film grain, authentic halogen lens flare. Maintain subject facial geometry, exact eye shape, jawline, and genuine expression.',
    negative_prompt:
      'modern smartphones, digital blur, distorted face, unnatural teeth, extra limbs, 3D render, cartoon',
    category: 'era',
    enabled: true,
    featured: true,
    sort_order: 1,
  },
  {
    title: 'Cyberpunk 2077',
    slug: 'cyberpunk',
    thumbnail: '/styles/cyberpunk.jpg',
    prompt:
      'High-fashion Cyberpunk character portrait in a rainy Neo-Tokyo dystopian night. Subtle illuminated cybernetic temple seam, glowing neon visor reflection, black matte tactical collar with fiber-optic stitching. Volumetric cyan and magenta neon street lighting, rain droplets on skin, anamorphic bokeh. Perfectly preserve the subject identity, bone structure, and facial recognition.',
    negative_prompt:
      'cartoon, fantasy elf, blurry, distorted eyes, low resolution, watermark, bad anatomy',
    category: 'fantasy',
    enabled: true,
    featured: true,
    sort_order: 2,
  },
  {
    title: 'Anime Hero',
    slug: 'anime',
    thumbnail: '/styles/anime.jpg',
    prompt:
      'Masterpiece modern Japanese anime theatrical movie portrait in the style of Makoto Shinkai and Studio Ghibli. Luminous expressive eyes matching the real subject, delicate clean line art, vibrant pastel sky with floating sakura petals, golden sunset rim light illuminating the hair. The character must be instantly recognizable as this exact person.',
    negative_prompt:
      'western cartoon, 3d cgi, ugly, distorted face, extra fingers, blurry, flat coloring',
    category: 'art',
    enabled: true,
    featured: true,
    sort_order: 3,
  },
  {
    title: 'Vintage Film',
    slug: 'vintage',
    thumbnail: '/styles/vintage.jpg',
    prompt:
      'Classic 1950s Hollywood silver screen glamour portrait. Shot on vintage large-format monochrome film, silver gelatin print look, deep charcoal blacks and luminous skin tones, dramatic Rembrandt key lighting, soft vignette. Styled in bespoke vintage tailoring. Perfect likeness of the real subject, sharp focus on eyes.',
    negative_prompt:
      'color, digital camera look, modern clothes, high saturation, plastic skin, distorted',
    category: 'era',
    enabled: true,
    featured: false,
    sort_order: 4,
  },
  {
    title: 'Me in 2050',
    slug: 'future-2050',
    thumbnail: '/styles/future.jpg',
    prompt:
      'Futuristic portrait in the year 2050. Minimalist architectural glass pavilion overlooking a clean eco-futuristic skyline. Sleek aerodynamic smart-fabric clothing with subtle micro-LED piping, floating holographic wrist interface, soft diffused ambient daylight. Sophisticated luxury tech aesthetic. Flawlessly preserve facial structure and likeness.',
    negative_prompt:
      'dystopian, rusty, dirty, alien, deformed face, unrealistic proportions',
    category: 'fantasy',
    enabled: true,
    featured: true,
    sort_order: 5,
  },
  {
    title: 'Tech CEO',
    slug: 'tech-ceo',
    thumbnail: '/styles/ceo.jpg',
    prompt:
      'Forbes 30 Under 30 magazine cover portrait. Powerful confident stance in a modern glass boardroom overlooking a Silicon Valley metropolis at twilight. Wearing tailored Italian dark blazer over minimalist crewneck, perfect studio key light with soft rim fill, sharp macro focus on eyes. Highest commercial editorial photography quality. Exact facial fidelity.',
    negative_prompt:
      'casual selfie, messy room, poor lighting, double chin, distorted hands, amateur',
    category: 'professional',
    enabled: true,
    featured: false,
    sort_order: 6,
  },
  {
    title: 'Superhero',
    slug: 'superhero',
    thumbnail: '/styles/superhero.jpg',
    prompt:
      'Blockbuster superhero portrait. Custom bespoke armored hero suit with carbon-fiber weave and glowing power crest, dramatic stormy sky with crackling lightning in the background, cinematic volumetric lighting, wind blowing through hair. Preserving the subject real facial features, strong hero expression, photorealistic movie still.',
    negative_prompt:
      'existing copyrighted logos, clown, low budget, distorted face, cartoon',
    category: 'fantasy',
    enabled: true,
    featured: true,
    sort_order: 7,
  },
  {
    title: 'Space Explorer',
    slug: 'space-explorer',
    thumbnail: '/styles/space.jpg',
    prompt:
      'Cinematic astronaut portrait on an extraterrestrial research expedition. Detailed aerospace EVA exploration suit with metallic gold-trimmed helmet, open visor revealing the subject face clearly illuminated by interior LED lights, alien aurora and twin moons in the starry cosmos background. NASA documentary realism. Exact identity preservation.',
    negative_prompt:
      'obscured face, fully mirrored visor, cartoon astronaut, toy suit, distorted',
    category: 'fantasy',
    enabled: true,
    featured: false,
    sort_order: 8,
  },
  {
    title: 'Royal Portrait',
    slug: 'royal-portrait',
    thumbnail: '/styles/royal.jpg',
    prompt:
      'Renaissance royal oil painting on canvas. Dressed in ornate velvet and gold-embroidered royal robes with jewel-encrusted collar, holding a gilded royal scepter. Chiaroscuro lighting technique of the Old Masters, rich impasto texture, regal posture in a stone castle hall. The painting captures the subject true facial features and demeanor.',
    negative_prompt:
      'modern photographic look, jeans, t-shirt, distorted hands, blurry brushstrokes',
    category: 'art',
    enabled: true,
    featured: false,
    sort_order: 9,
  },
  {
    title: 'Early 2000s',
    slug: 'y2k',
    thumbnail: '/styles/y2k.jpg',
    prompt:
      'Nostalgic early 2000s Y2K MTV music video aesthetic. Shot on vintage CCD digital camera with direct pop flash, iridescent metallic puffer jacket, tinted rimless sunglasses perched on head, chrome graffiti and millennium bubble background. Fun, high-energy nostalgia. Keep facial likeness identical to the photo.',
    negative_prompt:
      'modern 4k ultra-crisp, historical vintage, distorted face, dull lighting',
    category: 'era',
    enabled: true,
    featured: false,
    sort_order: 10,
  },
  {
    title: 'Hollywood Star',
    slug: 'hollywood',
    thumbnail: '/styles/hollywood.jpg',
    prompt:
      'A-list celebrity on the red carpet at an international film premiere. Dressed in custom haute couture, walking under glamorous marquee spotlights, distant paparazzi flashes creating dazzling starburst bokeh. Confident red carpet smile, professional gala makeup and styling. Exact facial identity maintained.',
    negative_prompt:
      'casual clothes, empty street, poor lighting, unnatural face, deformed teeth',
    category: 'professional',
    enabled: true,
    featured: false,
    sort_order: 11,
  },
  {
    title: 'Pixar Character',
    slug: 'pixar',
    thumbnail: '/styles/pixar.jpg',
    prompt:
      'Beloved 3D animated character in the signature aesthetic of Pixar and Disney Animation studios. Warm expressive eyes, stylized smooth porcelain skin shader, hand-crafted hair geometry with subsurface scattering, colorful whimsical backdrop, warm cinematic key lighting. Recognizable as the exact subject in animated form.',
    negative_prompt:
      'scary, uncanny valley, realistic photography, rough textures, flat 2d, zombie',
    category: 'art',
    enabled: true,
    featured: true,
    sort_order: 12,
  },
];
