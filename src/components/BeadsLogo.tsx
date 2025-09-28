// @/components/BeadsLogo.tsx

const BeadsLogo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="80"
    height="16"
    viewBox="0 0 80 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <defs>
      <linearGradient id="gradRed" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#FF6B6B' }} />
        <stop offset="100%" style={{ stopColor: '#E4002B' }} />
      </linearGradient>
      <linearGradient id="gradYellow" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#FFD93D' }} />
        <stop offset="100%" style={{ stopColor: '#FDEE00' }} />
      </linearGradient>
      <linearGradient id="gradBlue" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#6BCBFF' }} />
        <stop offset="100%" style={{ stopColor: '#4169E1' }} />
      </linearGradient>
    </defs>
    <circle cx="8" cy="8" r="7" fill="url(#gradRed)" stroke="black" strokeWidth="1.5" />
    <circle cx="24" cy="8" r="7" fill="url(#gradYellow)" stroke="black" strokeWidth="1.5" />
    <circle cx="40" cy="8" r="7" fill="url(#gradYellow)" stroke="black" strokeWidth="1.5" />
    <circle cx="56" cy="8" r="7" fill="url(#gradBlue)" stroke="black" strokeWidth="1.5" />
    <circle cx="72" cy="8" r="7" fill="url(#gradBlue)" stroke="black" strokeWidth="1.5" />
  </svg>
);

export default BeadsLogo;
