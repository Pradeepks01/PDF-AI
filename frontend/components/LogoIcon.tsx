import React from 'react'

interface LogoIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string
  size?: number
}

export const LogoIcon: React.FC<LogoIconProps> = ({
  className = "size-6",
  size,
  ...props
}) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      {...props}
    >
      {/* PDF Document Base with Corner Fold */}
      <path
        d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.12"
      />
      {/* Corner Flap */}
      <path
        d="M14 2V8H20"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Document Content Lines */}
      <line
        x1="8"
        y1="13"
        x2="16"
        y2="13"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="8"
        y1="17"
        x2="13"
        y2="17"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default LogoIcon
