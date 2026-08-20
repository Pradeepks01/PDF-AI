import React from 'react'

interface LogoIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string
  size?: number
}

export const LogoIcon: React.FC<LogoIconProps> = ({
  className = "size-5",
  size,
  ...props
}) => {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      {...props}
    >
      <defs>
        <linearGradient id="pdfHeartGrad" x1="4" y1="4" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="currentColor" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.85" />
        </linearGradient>
        <linearGradient id="pdfHeartGlow" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--primary, #06b6d4)" />
          <stop offset="100%" stopColor="var(--primary-glow, #38bdf8)" />
        </linearGradient>
      </defs>

      {/* Unified Half-PDF (Left) + Half-Heart (Right) Outer Silhouette */}
      <path
        d="M16 6.5
           L9.5 6.5
           C7.567 6.5 6 8.067 6 10
           L6 23
           C6 24.933 7.567 26.5 9.5 26.5
           L16 26.5
           C19.8 24.2 26 19.2 26 13.8
           C26 9.4 22.6 6.5 19.2 6.5
           C17.6 6.5 16.6 7.4 16 8.4
           Z"
        fill="currentColor"
        fillOpacity="0.15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Central Division Spine */}
      <line
        x1="16"
        y1="7.5"
        x2="16"
        y2="25.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="2 2"
        strokeOpacity="0.6"
      />

      {/* Left PDF Document Content Lines */}
      <line
        x1="9.5"
        y1="11.5"
        x2="13.5"
        y2="11.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <line
        x1="9.5"
        y1="15.5"
        x2="13.5"
        y2="15.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <line
        x1="9.5"
        y1="19.5"
        x2="12"
        y2="19.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />

      {/* Right Heart AI Sparkle Core */}
      <path
        d="M20.5 11.5C20.5 11.5 21.2 13 22.5 13C21.2 13 20.5 14.5 20.5 14.5C20.5 14.5 19.8 13 18.5 13C19.8 13 20.5 11.5 20.5 11.5Z"
        fill="currentColor"
      />
      <circle cx="23.2" cy="9.8" r="0.9" fill="currentColor" />
    </svg>
  )
}

export default LogoIcon
