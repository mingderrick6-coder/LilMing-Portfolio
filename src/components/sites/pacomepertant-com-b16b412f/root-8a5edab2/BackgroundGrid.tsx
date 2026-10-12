export default function BackgroundGrid() {
  return (
    <svg
      className="home-background-grid"
      width="1920"
      height="1200"
      viewBox="0 0 1920 1200"
      fill="none"
      aria-hidden="true"
    >
      <g clipPath="url(#home-grid-clip)">
        <rect width="1920" height="1200" fill="url(#home-grid-pattern)" fillOpacity=".2" />
        <g filter="url(#home-grid-blur)">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M2442 1526H-522V-326H2442V1526ZM960 14C453.003 14 42 276.585 42 600.5C42 924.415 453.003 1187 960 1187C1467 1187 1878 924.415 1878 600.5C1878 276.585 1467 14 960 14Z"
            fill="#0A0A0A"
          />
        </g>
      </g>
      <defs>
        <filter
          id="home-grid-blur"
          x="-1022"
          y="-826"
          width="3964"
          height="2852"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur stdDeviation="250" />
        </filter>
        <clipPath id="home-grid-clip">
          <rect width="1920" height="1200" fill="white" />
        </clipPath>
        <pattern
          id="home-grid-pattern"
          patternUnits="userSpaceOnUse"
          patternTransform="matrix(50 0 0 50 934.75 574.75)"
          preserveAspectRatio="none"
          viewBox="-.5 -.5 100 100"
          width="1"
          height="1"
        >
          <use href="#home-grid-cell" transform="translate(-100 -100)" />
          <use href="#home-grid-cell" transform="translate(0 -100)" />
          <use href="#home-grid-cell" transform="translate(-100 0)" />
          <g id="home-grid-cell">
            <rect width="100" height="100" stroke="white" />
          </g>
        </pattern>
      </defs>
    </svg>
  );
}
