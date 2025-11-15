import React from 'react';

interface WaveBannerProps {
  colors: Record<string, string>;
}

export const WaveBanner: React.FC<WaveBannerProps> = ({ colors }) => {
  const waveColors = [
    colors['--color-accent'],
    colors['--color-accent-2'],
    colors['--color-accent-3'],
    colors['--color-accent-4'],
  ];

  return (
    <div className="absolute inset-0 w-full h-full">
      <svg
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 24 150 28"
        preserveAspectRatio="xMidYMid slice"
        shapeRendering="auto"
      >
        <defs>
          <path
            id="gentle-wave"
            d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z"
          />
        </defs>
        <g className="parallax">
          {waveColors.map((color, index) => {
            const animationDuration = 7 + index * 4;
            const yOffset = 4 + index * 2;
            const opacity = 0.8 - index * 0.15;

            return (
              <use
                key={index}
                href="#gentle-wave"
                x="48"
                y={yOffset}
                fill={color}
                style={{
                  fillOpacity: opacity,
                  animation: `wave ${animationDuration}s linear infinite`,
                  animationDelay: `-${index*2}s`
                }}
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
};