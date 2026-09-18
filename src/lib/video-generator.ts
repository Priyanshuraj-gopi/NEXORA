/**
 * Nexora AI Cinematic Video Generator
 * Generates a high-framerate 4-second moving cinematic portrait video
 * with 3D Ken Burns slow zoom, era-specific atmospheric particles,
 * and official Nexora branding, ready for Instagram Reels, TikTok & WhatsApp.
 */

export interface VideoGenerationOptions {
  styleName: string;
  styleSlug?: string;
  durationSeconds?: number;
}

export async function generateCinematicVideo(
  imageSrc: string,
  options: VideoGenerationOptions
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        // Standard 9:16 vertical video ratio for Reels & TikTok or 1:1 square
        canvas.width = 1080;
        canvas.height = 1080;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context unavailable'));
          return;
        }

        const duration = (options.durationSeconds || 4) * 1000;
        const fps = 30;
        const totalFrames = (duration / 1000) * fps;

        // Particle system for atmospheric motion
        const particleCount = 40;
        const particles = Array.from({ length: particleCount }, () => ({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 3 + 1.5,
          speedY: Math.random() * 1.5 + 0.5,
          speedX: (Math.random() - 0.5) * 0.8,
          opacity: Math.random() * 0.7 + 0.2,
        }));

        // Determine stream mimeType supported by browser
        let mimeType = 'video/webm;codecs=vp9';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm';
        }
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/mp4';
        }

        const stream = canvas.captureStream(fps);
        const recorder = new MediaRecorder(stream, {
          mimeType: MediaRecorder.isTypeSupported(mimeType) ? mimeType : undefined,
          videoBitsPerSecond: 6000000, // 6 Mbps high definition
        });

        const chunks: Blob[] = [];
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };

        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: chunks[0]?.type || 'video/webm' });
          resolve(blob);
        };

        recorder.start();

        let currentFrame = 0;

        function renderFrame() {
          if (!ctx) return;
          const progress = currentFrame / totalFrames;

          // 1. Ken Burns 3D Camera Zoom (scale 1.0 to 1.12)
          const scale = 1.0 + progress * 0.12;
          ctx.save();
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.scale(scale, scale);
          ctx.translate(-canvas.width / 2, -canvas.height / 2);

          // Draw base photo centered
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          ctx.restore();

          // 2. Animated Atmospheric Particles
          ctx.save();
          const particleColor =
            options.styleSlug === 'cyberpunk'
              ? 'rgba(6, 182, 212, '
              : options.styleSlug === 'retro-80s'
                ? 'rgba(251, 191, 36, '
                : options.styleSlug === 'anime'
                  ? 'rgba(244, 114, 182, '
                  : 'rgba(255, 255, 255, ';

          particles.forEach((p) => {
            ctx.fillStyle = `${particleColor}${p.opacity})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();

            p.y -= p.speedY;
            p.x += p.speedX;
            if (p.y < 0) p.y = canvas.height;
            if (p.x < 0) p.x = canvas.width;
            if (p.x > canvas.width) p.x = 0;
          });
          ctx.restore();

          // 3. Subtle Lighting Pulse
          ctx.save();
          const pulse = Math.sin(progress * Math.PI * 2) * 0.05 + 0.05;
          ctx.fillStyle = `rgba(139, 92, 246, ${pulse})`;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.restore();

          // 4. Draw Nexora Watermark Badge
          ctx.save();
          const badgeWidth = 320;
          const badgeHeight = 64;
          const x = canvas.width - badgeWidth - 32;
          const y = canvas.height - badgeHeight - 32;

          ctx.fillStyle = 'rgba(7, 11, 23, 0.88)';
          ctx.beginPath();
          ctx.roundRect(x, y, badgeWidth, badgeHeight, 16);
          ctx.fill();

          ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Logo Icon
          const iconSize = 40;
          const iconX = x + 12;
          const iconY = y + (badgeHeight - iconSize) / 2;
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.roundRect(iconX, iconY, iconSize, iconSize, 8);
          ctx.fill();

          ctx.fillStyle = '#08090C';
          ctx.font = 'bold 20px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('N', iconX + iconSize / 2, iconY + iconSize / 2);

          // Text
          ctx.textAlign = 'left';
          ctx.font = 'bold 15px system-ui, sans-serif';
          ctx.fillText('NEXORA MOTION', iconX + iconSize + 12, y + 26);

          ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
          ctx.font = '11px system-ui, sans-serif';
          ctx.fillText(`${options.styleName.toUpperCase()} • AI LIVE MOTION`, iconX + iconSize + 12, y + 44);

          ctx.restore();

          currentFrame++;
          if (currentFrame < totalFrames) {
            requestAnimationFrame(renderFrame);
          } else {
            recorder.stop();
          }
        }

        renderFrame();
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = (e) => reject(e);
    img.src = imageSrc;
  });
}

