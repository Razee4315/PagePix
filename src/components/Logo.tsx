interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 32, className = "" }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={className}
    >
      <path
        d="M25 25 h25 a20 20 0 0 1 0 40 h-10 v30 h-15 z"
        fill="#3B82F6"
      />
      <path
        d="M70 50 l30 45 M100 50 l-30 45"
        stroke="#EF4444"
        strokeWidth="14"
        strokeLinecap="round"
      />
    </svg>
  );
}
