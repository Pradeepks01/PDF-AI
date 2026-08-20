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
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.15"
      />
      {/* Corner Flap */}
      <path
        d="M14 2V8H20"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* "PDF" Minimal Emblem Inside */}
      <path
        d="M7.5 12H9C9.55 12 10 12.45 10 13C10 13.55 9.55 14 9 14H7.5V11H9C9.55 11 10 11.45 10 12C10 12.55 9.55 13 9 13H7.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.5 11V15M12.5 11H14.5C15.33 11 16 11.67 16 12.5V13.5C16 14.33 15.33 15 14.5 15H12.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 18H16.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default LogoIcon
