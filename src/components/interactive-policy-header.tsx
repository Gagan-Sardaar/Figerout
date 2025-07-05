'use client';

import React from 'react';

export const InteractivePolicyHeader = () => {
    const word = "Figerout";
    const images = [
        'https://placehold.co/400x600.png',
        'https://placehold.co/400x600.png',
        'https://placehold.co/400x600.png',
        'https://placehold.co/400x600.png',
        'https://placehold.co/400x600.png',
        'https://placehold.co/400x600.png',
        'https://placehold.co/400x600.png',
        'https://placehold.co/400x600.png'
    ];
    const hints = [
        'vibrant color',
        'abstract texture',
        'paint splash',
        'glowing light',
        'liquid swirl',
        'geometric pattern',
        'holographic foil',
        'ink cloud'
    ];

    return (
        <header className="bg-zinc-900 py-16 md:py-24 overflow-hidden">
            <h1 className="text-center text-[15vw] lg:text-[12rem] font-headline font-extrabold tracking-tighter leading-[1] select-none flex justify-center">
                {word.split('').map((char, index) => (
                    <span
                        key={index}
                        className="interactive-char"
                        style={{ '--bg-image': `url(${images[index]})` } as React.CSSProperties}
                        data-ai-hint={hints[index]}
                    >
                        {char}
                    </span>
                ))}
            </h1>
        </header>
    );
};
