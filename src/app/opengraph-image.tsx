import { ImageResponse } from 'next/og';

export const alt = 'Nexora Photo Booth: Same You. Different Era.';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#08090C',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          padding: '80px',
          fontFamily: 'system-ui, sans-serif',
          border: '12px solid #111319',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              background: '#FFFFFF',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#08090C',
              fontWeight: 800,
              fontSize: '24px',
            }}
          >
            N
          </div>
          <span
            style={{
              color: '#FFFFFF',
              letterSpacing: '0.25em',
              fontSize: '22px',
              fontWeight: 700,
            }}
          >
            NEXORA
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h1
            style={{
              color: '#FFFFFF',
              fontSize: '64px',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              margin: 0,
              lineHeight: 1.1,
            }}
          >
            Same You. Different Era.
          </h1>
          <p
            style={{
              color: '#9CA3AF',
              fontSize: '24px',
              margin: 0,
              maxWidth: '800px',
            }}
          >
            Professional digital event photo booth. Instant stylistic portrait transformation.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            color: '#6B7280',
            fontSize: '16px',
            fontFamily: 'monospace',
          }}
        >
          <span>EXHIBITIONS</span>
          <span>•</span>
          <span>CONFERENCES</span>
          <span>•</span>
          <span>CAMPUS ACTIVATIONS</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

