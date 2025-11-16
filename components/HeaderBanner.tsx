
import React from 'react';

export const HeaderBanner = ({ imageUrl, positionY }: { imageUrl: string; positionY: number }) => (
    <header 
        className="relative h-48 bg-background overflow-hidden"
        role="img"
        aria-label="Journal banner"
    >
        <div 
            className="absolute inset-0 bg-cover" 
            style={{ 
                backgroundImage: `url('${imageUrl}')`,
                backgroundPosition: `center ${positionY}%`
            }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-56 bg-gradient-to-t from-background to-transparent"></div>
    </header>
);
