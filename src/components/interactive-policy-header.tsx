'use client';

import React from 'react';

export const InteractivePolicyHeader = () => {
    const word = "Figerout";
    const images = [
        'https://images.pexels.com/photos/114979/pexels-photo-114979.jpeg?auto=compress&cs=tinysrgb&w=400',
        'https://images.pexels.com/photos/1269968/pexels-photo-1269968.jpeg?auto=compress&cs=tinysrgb&w=400',
        'https://images.pexels.com/photos/720815/pexels-photo-720815.jpeg?auto=compress&cs=tinysrgb&w=400',
        'https://images.pexels.com/photos/36717/amazing-animal-beautiful-beautifull.jpg?auto=compress&cs=tinysrgb&w=400',
        'https://images.pexels.com/photos/1212487/pexels-photo-1212487.jpeg?auto=compress&cs=tinysrgb&w=400',
        'https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?auto=compress&cs=tinysrgb&w=400',
        'https://images.pexels.com/photos/7994468/pexels-photo-7994468.jpeg?auto=compress&cs=tinysrgb&w=400',
        'https://images.pexels.com/photos/1118439/pexels-photo-1118439.jpeg?auto=compress&cs=tinysrgb&w=400'
    ];
    const hints = [
        'vibrant color',
        'abstract texture',
        'goldenrod yellow',
        'glowing light',
        'liquid swirl',
        'colorful smoke',
        'holographic foil',
        'ink cloud'
    ];

    return (
        <header className="bg-zinc-900 overflow-hidden">
            <h1 className="text-center text-[15vw] lg:text-[12rem] font-headline font-extrabold tracking-tighter leading-[1.05] select-none flex justify-center">
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
