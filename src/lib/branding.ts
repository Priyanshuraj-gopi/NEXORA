/**
 * Nexora Image Transformation & Branding Engine
 * Performs authentic pixel-level color grading, cinematic film textures,
 * Kodak Portra 400 analog grain, era-specific atmospheric lighting,
 * and bakes official Nexora event branding directly into images.
 */

export interface BrandingOptions {
  styleName: string;
  styleSlug?: string;
  eventName?: string;
}

/**
 * Transforms an image with authentic era color grading, film grain,
 * atmosphere, and bakes the official Nexora branding watermark.
 */
export async function applyEraStylingAndBrand(
  imageSrc: string,
  options: BrandingOptions
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          resolve(imageSrc);
          return;
        }

        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;

        // 1. Draw original base portrait with 100% likeness retention
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // 2. Perform authentic pixel-level color grading & era curves
        applyPixelLevelTransformation(ctx, canvas.width, canvas.height, options.styleSlug || '');

        // 3. Add atmospheric era lighting & lens characteristics
        applyAtmosphericLighting(ctx, canvas.width, canvas.height, options.styleSlug || '');

        // 4. Inject natural 35mm photographic film grain (kills digital plastic AI slop)
        applyAnalogFilmGrain(ctx, canvas.width, canvas.height, options.styleSlug || '');

        // 5. Bake official Nexora Branding Stamp into the image
        drawNexoraWatermark(ctx, canvas.width, canvas.height, options.styleName, options.eventName);

        resolve(canvas.toDataURL('image/jpeg', 0.95));
      } catch (err) {
        console.error('Branding render error:', err);
        resolve(imageSrc);
      }
    };
    img.onerror = () => resolve(imageSrc);
    img.src = imageSrc;
  });
}

/**
 * Pixel-level manipulation: adjusts RGB channels, contrast, and tone curves per era.
 * Accurately mimics photochemical film stocks and editorial color science.
 */
function applyPixelLevelTransformation(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  slug: string
) {
  try {
    const imgData = ctx.getImageData(0, 0, width, height);
    const d = imgData.data;

    for (let i = 0; i < d.length; i += 4) {
      let r = d[i];
      let g = d[i + 1];
      let b = d[i + 2];

      switch (slug) {
        case 'vintage': {
          // 1950s Silver Gelatin Film Noir: deep charcoal blacks, luminous skin highlights
          const luma = 0.299 * r + 0.587 * g + 0.114 * b;
          const tone = (luma - 128) * 1.38 + 128;
          // Subtle warm platinum undertone
          d[i] = Math.min(255, Math.max(0, tone + 8));
          d[i + 1] = Math.min(255, Math.max(0, tone + 3));
          d[i + 2] = Math.min(255, Math.max(0, tone - 6));
          break;
        }

        case 'retro-80s': {
          // 1980s Kodachrome / Synthwave: warm golden highlights, saturated reds, teal-indigo shadows
          r = (r - 128) * 1.22 + 128;
          g = (g - 128) * 1.1 + 128;
          b = (b - 128) * 1.18 + 128;
          d[i] = Math.min(255, Math.max(0, r * 1.16 + 18)); // Vibrant warm red/amber
          d[i + 1] = Math.min(255, Math.max(0, g * 1.02 + 4));
          d[i + 2] = Math.min(255, Math.max(0, b * 0.9 + (b < 110 ? 28 : -8))); // Teal in shadows, magenta shift
          break;
        }

        case 'cyberpunk': {
          // Cyberpunk 2077: Electric magenta highlights, neon cyan shadows, punchy dynamic range
          const luma = 0.299 * r + 0.587 * g + 0.114 * b;
          const contrast = (luma - 128) * 1.42 + 128;
          if (luma > 120) {
            d[i] = Math.min(255, Math.max(0, contrast * 1.22));
            d[i + 1] = Math.min(255, Math.max(0, contrast * 0.8));
            d[i + 2] = Math.min(255, Math.max(0, contrast * 1.28));
          } else {
            d[i] = Math.min(255, Math.max(0, contrast * 0.45));
            d[i + 1] = Math.min(255, Math.max(0, contrast * 1.14 + 18));
            d[i + 2] = Math.min(255, Math.max(0, contrast * 1.42 + 32));
          }
          break;
        }

        case 'anime': {
          // Modern Anime / Makoto Shinkai: luminous pastel bloom, vivid saturation
          const min = Math.min(r, g, b);
          const satMult = 1.35;
          d[i] = Math.min(255, Math.max(0, r + (r - min) * (satMult - 1) + 8));
          d[i + 1] = Math.min(255, Math.max(0, g + (g - min) * (satMult - 1) + 4));
          d[i + 2] = Math.min(255, Math.max(0, b + (b - min) * (satMult - 1) + 12));
          break;
        }

        case 'tech-ceo': {
          // Forbes / Tech CEO: Cool desaturated background, crisp editorial studio key contrast
          const luma = 0.299 * r + 0.587 * g + 0.114 * b;
          const sharp = (luma - 128) * 1.26 + 128;
          d[i] = Math.min(255, Math.max(0, sharp * 0.96 + r * 0.04));
          d[i + 1] = Math.min(255, Math.max(0, sharp * 0.98 + g * 0.04));
          d[i + 2] = Math.min(255, Math.max(0, sharp * 1.06 + b * 0.04));
          break;
        }

        case 'y2k': {
          // Y2K Pop: High key flash photography, iridescent cyan sheen, glossy speculars
          d[i] = Math.min(255, Math.max(0, r * 1.12 + 12));
          d[i + 1] = Math.min(255, Math.max(0, g * 1.14 + 14));
          d[i + 2] = Math.min(255, Math.max(0, b * 1.28 + 24));
          break;
        }

        case 'future-2050': {
          // Eco-Futuristic 2050: Clean platinum white, soft cyan-ice tint, ultra-clean clarity
          const luma = 0.299 * r + 0.587 * g + 0.114 * b;
          const clean = (luma - 128) * 1.18 + 132;
          d[i] = Math.min(255, Math.max(0, clean * 0.94 + r * 0.08));
          d[i + 1] = Math.min(255, Math.max(0, clean * 1.02 + g * 0.08));
          d[i + 2] = Math.min(255, Math.max(0, clean * 1.12 + b * 0.08 + 10));
          break;
        }

        case 'superhero': {
          // IMAX Cinematic Hero: Deep rich shadows, warm amber skin tones, punchy dark slate blues
          r = (r - 128) * 1.32 + 128;
          g = (g - 128) * 1.18 + 128;
          b = (b - 128) * 1.24 + 128;
          d[i] = Math.min(255, Math.max(0, r * 1.12 + 10));
          d[i + 1] = Math.min(255, Math.max(0, g * 0.98));
          d[i + 2] = Math.min(255, Math.max(0, b * 1.15 + (b < 100 ? 15 : -5)));
          break;
        }

        case 'space-explorer': {
          // Interstellar Deep Space: Cold deep cosmos blue shadows, warm sun visor highlights
          const luma = 0.299 * r + 0.587 * g + 0.114 * b;
          const deep = (luma - 128) * 1.28 + 128;
          if (luma > 130) {
            d[i] = Math.min(255, Math.max(0, deep * 1.14 + 12));
            d[i + 1] = Math.min(255, Math.max(0, deep * 1.05 + 6));
            d[i + 2] = Math.min(255, Math.max(0, deep * 0.92));
          } else {
            d[i] = Math.min(255, Math.max(0, deep * 0.65));
            d[i + 1] = Math.min(255, Math.max(0, deep * 0.85 + 10));
            d[i + 2] = Math.min(255, Math.max(0, deep * 1.3 + 22));
          }
          break;
        }

        case 'royal-portrait': {
          // Classical Oil Painting / Rembrandt: Velvet crimson, golden ochre tones, rich chiaroscuro
          const luma = 0.299 * r + 0.587 * g + 0.114 * b;
          const warmChiaroscuro = (luma - 128) * 1.24 + 126;
          d[i] = Math.min(255, Math.max(0, warmChiaroscuro * 1.2 + 20)); // Rich gold & velvet red
          d[i + 1] = Math.min(255, Math.max(0, warmChiaroscuro * 1.02 + 8));
          d[i + 2] = Math.min(255, Math.max(0, warmChiaroscuro * 0.78 - 6));
          break;
        }

        case 'hollywood': {
          // Hollywood Red Carpet Glamour: Warm champagne skin tones, luminous golden glow, rich blacks
          r = (r - 128) * 1.2 + 130;
          g = (g - 128) * 1.14 + 128;
          b = (b - 128) * 1.08 + 124;
          d[i] = Math.min(255, Math.max(0, r * 1.15 + 14));
          d[i + 1] = Math.min(255, Math.max(0, g * 1.08 + 8));
          d[i + 2] = Math.min(255, Math.max(0, b * 0.94));
          break;
        }

        case 'pixar': {
          // Vibrant Animated 3D: Warm joyful saturation, smooth luminous skin bloom
          const min = Math.min(r, g, b);
          const satMult = 1.3;
          d[i] = Math.min(255, Math.max(0, r + (r - min) * (satMult - 1) + 10));
          d[i + 1] = Math.min(255, Math.max(0, g + (g - min) * (satMult - 1) + 8));
          d[i + 2] = Math.min(255, Math.max(0, b + (b - min) * (satMult - 1) + 4));
          break;
        }

        case 'f1-driver': {
          // Grand Prix Motorsport: High-contrast racing grit, saturated crimson & slate asphalt
          r = (r - 128) * 1.34 + 128;
          g = (g - 128) * 1.18 + 128;
          b = (b - 128) * 1.2 + 128;
          d[i] = Math.min(255, Math.max(0, r * 1.18 + 8));
          d[i + 1] = Math.min(255, Math.max(0, g * 0.98));
          d[i + 2] = Math.min(255, Math.max(0, b * 0.95));
          break;
        }

        case 'fantasy-warrior': {
          // Epic Fantasy / Cinematic Nordic: Desaturated steel cold tones with warm torchlight embers
          const luma = 0.299 * r + 0.587 * g + 0.114 * b;
          const epic = (luma - 128) * 1.3 + 128;
          d[i] = Math.min(255, Math.max(0, epic * 1.05 + 12));
          d[i + 1] = Math.min(255, Math.max(0, epic * 0.98 + 4));
          d[i + 2] = Math.min(255, Math.max(0, epic * 1.08 + 8));
          break;
        }

        case 'headshot': {
          // LinkedIn Executive Headshot: Perfectly calibrated studio softbox light, neutral tones
          const luma = 0.299 * r + 0.587 * g + 0.114 * b;
          const cleanKey = (luma - 128) * 1.16 + 129;
          d[i] = Math.min(255, Math.max(0, cleanKey * 1.04 + r * 0.02));
          d[i + 1] = Math.min(255, Math.max(0, cleanKey * 1.02 + g * 0.02));
          d[i + 2] = Math.min(255, Math.max(0, cleanKey * 1.01 + b * 0.02));
          break;
        }

        default: {
          // Default: High-end portrait color grade
          d[i] = Math.min(255, Math.max(0, (r - 128) * 1.15 + 134));
          d[i + 1] = Math.min(255, Math.max(0, (g - 128) * 1.1 + 128));
          d[i + 2] = Math.min(255, Math.max(0, (b - 128) * 1.1 + 126));
          break;
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
  } catch (err) {
    console.warn('Direct pixel transformation fallback:', err);
  }
}

/**
 * Atmospheric era lighting overlays (vignettes, glows, neon rim lights, studio flares)
 */
function applyAtmosphericLighting(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  slug: string
) {
  ctx.save();

  if (slug === 'retro-80s') {
    // 80s Sunset Rim Glow
    const sunset = ctx.createLinearGradient(0, height, 0, 0);
    sunset.addColorStop(0, 'rgba(236, 72, 153, 0.26)'); // Neon pink
    sunset.addColorStop(0.4, 'rgba(245, 158, 11, 0.20)'); // Warm amber
    sunset.addColorStop(1, 'rgba(79, 70, 229, 0.14)'); // Retro indigo
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = sunset;
    ctx.fillRect(0, 0, width, height);

    // Subtle VHS horizontal scanlines
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.07)';
    for (let y = 0; y < height; y += 6) {
      ctx.fillRect(0, y, width, 2);
    }
  } else if (slug === 'cyberpunk') {
    // Dual-tone Neon Rim Lighting
    const neon = ctx.createRadialGradient(
      width * 0.85,
      height * 0.15,
      10,
      width / 2,
      height / 2,
      width * 0.7
    );
    neon.addColorStop(0, 'rgba(6, 182, 212, 0.38)'); // Cyan hotspot
    neon.addColorStop(0.6, 'rgba(236, 72, 153, 0.2)'); // Pink mid
    neon.addColorStop(1, 'rgba(7, 11, 23, 0.42)'); // Dark vignette
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = neon;
    ctx.fillRect(0, 0, width, height);
  } else if (slug === 'vintage') {
    // Classic 1950s 35mm Hollywood Vignette
    const vig = ctx.createRadialGradient(
      width / 2,
      height / 2,
      width * 0.22,
      width / 2,
      height / 2,
      width * 0.78
    );
    vig.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vig.addColorStop(1, 'rgba(0, 0, 0, 0.58)');
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = vig;
    ctx.fillRect(0, 0, width, height);
  } else if (slug === 'anime') {
    // Soft Sakura Bloom Glow
    const bloom = ctx.createRadialGradient(
      width / 2,
      height * 0.35,
      20,
      width / 2,
      height / 2,
      width * 0.65
    );
    bloom.addColorStop(0, 'rgba(255, 255, 255, 0.26)');
    bloom.addColorStop(1, 'rgba(236, 72, 153, 0.12)');
    ctx.globalCompositeOperation = 'soft-light';
    ctx.fillStyle = bloom;
    ctx.fillRect(0, 0, width, height);
  } else if (slug === 'royal-portrait') {
    // Warm Rembrandt Golden Glow & Candlelight Shadow
    const rembrandt = ctx.createRadialGradient(
      width * 0.3,
      height * 0.25,
      20,
      width / 2,
      height / 2,
      width * 0.75
    );
    rembrandt.addColorStop(0, 'rgba(251, 191, 36, 0.25)'); // Golden key light
    rembrandt.addColorStop(0.5, 'rgba(180, 83, 9, 0.12)');
    rembrandt.addColorStop(1, 'rgba(15, 7, 3, 0.55)'); // Heavy Renaissance shadow
    ctx.globalCompositeOperation = 'hard-light';
    ctx.fillStyle = rembrandt;
    ctx.fillRect(0, 0, width, height);
  } else if (slug === 'hollywood') {
    // Paparazzi Flash Ambient Bloom
    const flash = ctx.createRadialGradient(
      width / 2,
      height * 0.4,
      10,
      width / 2,
      height / 2,
      width * 0.7
    );
    flash.addColorStop(0, 'rgba(255, 248, 220, 0.22)');
    flash.addColorStop(1, 'rgba(0, 0, 0, 0.35)');
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = flash;
    ctx.fillRect(0, 0, width, height);
  } else if (slug === 'superhero') {
    // Cinematic Sky Rim
    const heroSky = ctx.createLinearGradient(0, 0, 0, height);
    heroSky.addColorStop(0, 'rgba(59, 130, 246, 0.22)');
    heroSky.addColorStop(0.5, 'rgba(0, 0, 0, 0)');
    heroSky.addColorStop(1, 'rgba(245, 158, 11, 0.18)');
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = heroSky;
    ctx.fillRect(0, 0, width, height);
  }

  ctx.restore();
}

/**
 * Natural 35mm Analog Film Grain
 * Micro-textures that eliminate digital plastic AI smoothing and provide genuine photographic depth.
 */
function applyAnalogFilmGrain(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  slug: string
) {
  try {
    const grainCanvas = document.createElement('canvas');
    const gw = Math.min(width, 1024);
    const gh = Math.min(height, 1024);
    grainCanvas.width = gw;
    grainCanvas.height = gh;
    const gctx = grainCanvas.getContext('2d');
    if (!gctx) return;

    const grainImg = gctx.createImageData(gw, gh);
    const gd = grainImg.data;
    const grainIntensity = slug === 'vintage' ? 24 : slug === 'retro-80s' ? 18 : 12;

    for (let i = 0; i < gd.length; i += 4) {
      const val = (Math.random() - 0.5) * grainIntensity * 2;
      gd[i] = 128 + val;
      gd[i + 1] = 128 + val;
      gd[i + 2] = 128 + val;
      gd[i + 3] = Math.abs(val) > 2 ? 35 : 0;
    }

    gctx.putImageData(grainImg, 0, 0);

    ctx.save();
    ctx.globalCompositeOperation = 'soft-light';
    ctx.drawImage(grainCanvas, 0, 0, width, height);
    ctx.restore();
  } catch (err) {
    console.warn('Film grain skipped:', err);
  }
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
  }
}

/**
 * Draws the official Nexora Badge Watermark with crisp geometry and typography
 */
function drawNexoraWatermark(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  styleName: string,
  _eventName?: string
) {
  ctx.save();

  const scale = Math.max(width, height) / 1200;
  const badgeWidth = 330 * scale;
  const badgeHeight = 68 * scale;
  const margin = 28 * scale;
  const x = width - badgeWidth - margin;
  const y = height - badgeHeight - margin;
  const radius = 18 * scale;

  // Dark frosted glass pill
  ctx.fillStyle = 'rgba(7, 11, 23, 0.88)';
  ctx.beginPath();
  drawRoundedRect(ctx, x, y, badgeWidth, badgeHeight, radius);
  ctx.fill();

  // Crisp boundary border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
  ctx.lineWidth = 1.5 * scale;
  ctx.stroke();

  // Nexora Icon Box
  const iconSize = 40 * scale;
  const iconX = x + 14 * scale;
  const iconY = y + (badgeHeight - iconSize) / 2;
  const iconRadius = 8 * scale;

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  drawRoundedRect(ctx, iconX, iconY, iconSize, iconSize, iconRadius);
  ctx.fill();

  // Icon Letter 'N'
  ctx.fillStyle = '#08090C';
  ctx.font = `bold ${22 * scale}px system-ui, -apple-system, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('N', iconX + iconSize / 2, iconY + iconSize / 2);

  // Text: Brand Name & Style
  const textX = iconX + iconSize + 12 * scale;
  ctx.textAlign = 'left';

  ctx.fillStyle = '#FFFFFF';
  ctx.font = `bold ${15 * scale}px system-ui, -apple-system, sans-serif`;
  ctx.fillText('NEXORA', textX, y + 25 * scale);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
  ctx.font = `${10 * scale}px system-ui, -apple-system, sans-serif`;
  const label = `${styleName.toUpperCase()} • TAPMI BENGALURU IT CLUB`;
  ctx.fillText(label, textX, y + 46 * scale);

  ctx.restore();
}
