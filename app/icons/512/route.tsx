import { ImageResponse } from 'next/og'

export const runtime = 'edge'

const SIZE = 512
const ICON_SIZE = 300

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: SIZE,
          height: SIZE,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#2563EB',
          borderRadius: Math.round(SIZE * 0.22) + 'px',
        }}
      >
        <svg
          width={ICON_SIZE}
          height={ICON_SIZE}
          viewBox="0 0 24 24"
          fill="white"
        >
          <path d="M13 2L4.09 12.97 12 12l-1 9.03L21 12h-8l1-10z" />
        </svg>
      </div>
    ),
    { width: SIZE, height: SIZE }
  )
}
