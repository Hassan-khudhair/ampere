import { ImageResponse } from 'next/og'

// iOS requires exactly 180×180 for apple-touch-icon
export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          // Solid bg — iOS clips to a rounded rect automatically
          background: '#2563EB',
        }}
      >
        <svg width="110" height="110" viewBox="0 0 24 24" fill="white">
          <path d="M13 2L4.09 12.97 12 12l-1 9.03L21 12h-8l1-10z" />
        </svg>
      </div>
    ),
    { ...size }
  )
}
