import React from 'react'
import { cn } from '@/lib/utils'

interface ElementIconProps {
    className?: string;
}

/**
 * ElementIconSet: The pure, cohesive version of our elemental identity.
 * No box, no shadow, no English labels. Just the icon and the Kanji.
 * Designed to feel 'printed' or 'integrated' into the card itself.
 */
function ElementIconWrapper({ children, ideogram, className }: { 
    children: React.ReactNode;
    ideogram: string;
    className?: string 
}) {
    return (
        <div className={cn("relative flex items-center justify-center", className)}>
            <svg 
                viewBox="0 0 100 120" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg" 
                className="w-full h-full drop-shadow-sm"
            >
                {/* The Artistic Element Graphic */}
                <g className="element-graphic" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    {children}
                </g>

                {/* Ideogram - Traditional Calligraphy Style */}
                <text 
                    x="50" 
                    y="110" 
                    textAnchor="middle" 
                    fill="currentColor" 
                    className="font-serif italic"
                    style={{ fontSize: '24px', fontWeight: 400 }}
                >
                    {ideogram}
                </text>
            </svg>
        </div>
    )
}

export function FireIcon({ className }: ElementIconProps) {
    return (
        <ElementIconWrapper ideogram="火" className={className}>
            <path d="M50 80 C35 80 28 60 40 45 C32 55 30 65 40 70 C35 50 45 35 50 20 C55 35 65 50 60 70 C70 65 68 55 60 45 C72 60 65 80 50 80 Z" />
            <path d="M50 73 C45 73 42 65 47 60 C43 65 42 70 47 70 C45 60 50 53 50 45 C50 53 55 60 53 70 C58 70 57 65 53 60 C58 65 55 73 50 73 Z" fill="currentColor" opacity="0.2" stroke="none" />
        </ElementIconWrapper>
    )
}

export function EarthIcon({ className }: ElementIconProps) {
    return (
        <ElementIconWrapper ideogram="土" className={className}>
            <path d="M15 80 H85 L65 40 L50 60 L35 30 L15 80 Z" />
            <path d="M35 30 L50 60 L65 40" fill="none" opacity="0.4" />
            <path d="M25 80 L40 50 M75 80 L60 55" strokeWidth="1" opacity="0.3" />
        </ElementIconWrapper>
    )
}

export function WoodIcon({ className }: ElementIconProps) {
    return (
        <ElementIconWrapper ideogram="木" className={className}>
            <path d="M50 85 V35" />
            <path d="M50 75 C35 75 25 60 50 35 C75 60 65 75 50 75 Z" strokeWidth="1.2" />
            <path d="M50 67 L32 57 M50 67 L68 57 M50 57 L28 42 M50 57 L72 42" />
            <circle cx="50" cy="27" r="4" fill="currentColor" opacity="0.3" stroke="none" />
        </ElementIconWrapper>
    )
}

export function MetalIcon({ className }: ElementIconProps) {
    return (
        <ElementIconWrapper ideogram="金" className={className}>
            <circle cx="50" cy="50" r="32" />
            <circle cx="50" cy="50" r="26" strokeWidth="0.8" opacity="0.4" />
            <rect x="39" y="39" width="22" height="22" rx="2" />
            <path d="M50 18 V24 M50 76 V82 M18 50 H24 M76 50 H82" strokeWidth="1.2" opacity="0.5" />
        </ElementIconWrapper>
    )
}

export function WaterIcon({ className }: ElementIconProps) {
    return (
        <ElementIconWrapper ideogram="水" className={className}>
            <path d="M20 65 C35 50 50 80 80 55" />
            <path d="M25 77 C40 62 55 92 85 67" />
            <path d="M15 53 C30 38 45 68 75 43" />
            <path d="M65 43 C75 33 85 38 80 53" strokeWidth="0.8" opacity="0.5" />
        </ElementIconWrapper>
    )
}
