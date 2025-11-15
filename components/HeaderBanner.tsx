
import React from 'react';

export const HeaderBanner = ({ imageUrl }: { imageUrl: string }) => (
    <header 
        className="relative h-48 bg-background overflow-hidden"
        role="img"
        aria-label="Journal banner"
    >
        <div 
            className="absolute inset-0 bg-cover bg-center" 
            style={{ backgroundImage: `url('${imageUrl}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent"></div>
    </header>
);
