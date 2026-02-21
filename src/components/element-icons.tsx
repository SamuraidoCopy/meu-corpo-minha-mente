import React from 'react'

interface ElementIconProps {
    className?: string;
}

export function FireIcon({ className }: ElementIconProps) {
    return (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            <defs>
                <linearGradient id="fireGrad" x1="50" y1="0" x2="50" y2="100" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FDBA74" />
                    <stop offset="1" stopColor="#EF4444" />
                </linearGradient>
            </defs>
            <path d="M50 10 C40 30 20 40 20 60 C20 76.5 33.5 90 50 90 C66.5 90 80 76.5 80 60 C80 50 70 45 60 55 C65 40 50 10 50 10 Z" fill="url(#fireGrad)" stroke="#B91C1C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M50 35 C45 45 35 50 35 65 C35 73.2 41.8 80 50 80 C58.2 80 65 73.2 65 65 C65 60 60 55 55 60 C58 52 50 35 50 35 Z" fill="#FEF08A" />
        </svg>
    )
}

export function EarthIcon({ className }: ElementIconProps) {
    return (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            <defs>
                <linearGradient id="earthGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#D97706" />
                    <stop offset="1" stopColor="#15803D" />
                </linearGradient>
            </defs>
            <path d="M10 80 L50 20 L90 80 Z" fill="url(#earthGrad)" stroke="#78350F" strokeWidth="2" strokeLinejoin="round" />
            <path d="M30 80 L60 35 L80 80 Z" fill="#FDE68A" opacity="0.5" />
            <path d="M50 20 L60 35 L50 50 L40 35 Z" fill="#D1FAE5" opacity="0.8" />
        </svg>
    )
}

export function WoodIcon({ className }: ElementIconProps) {
    return (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            <defs>
                <linearGradient id="woodGrad" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#10B981" />
                    <stop offset="1" stopColor="#047857" />
                </linearGradient>
            </defs>
            <path d="M50 80 C50 80 50 50 50 30 C30 30 20 50 20 50 C20 50 35 45 50 50 C65 45 80 50 80 50 C80 50 70 30 50 30" stroke="url(#woodGrad)" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M50 15 C45 20 40 30 50 40 C60 30 55 20 50 15 Z" fill="#6EE7B7" />
            <path d="M25 40 C20 45 15 55 25 60 C35 55 30 45 25 40 Z" fill="#A7F3D0" />
            <path d="M75 40 C70 45 65 55 75 60 C85 55 80 45 75 40 Z" fill="#A7F3D0" />
        </svg>
    )
}

export function MetalIcon({ className }: ElementIconProps) {
    return (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            <defs>
                <linearGradient id="metalGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#E2E8F0" />
                    <stop offset="1" stopColor="#94A3B8" />
                </linearGradient>
            </defs>
            <path d="M50 10 L80 50 L50 90 L20 50 Z" fill="url(#metalGrad)" stroke="#475569" strokeWidth="2" strokeLinejoin="round" />
            <path d="M50 10 L80 50 L50 50 Z" fill="#FFFFFF" opacity="0.6" />
            <path d="M20 50 L50 50 L50 90 Z" fill="#F8FAFC" opacity="0.3" />
            <circle cx="50" cy="50" r="15" fill="#CBD5E1" />
        </svg>
    )
}

export function WaterIcon({ className }: ElementIconProps) {
    return (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            <defs>
                <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="100" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#60A5FA" />
                    <stop offset="1" stopColor="#2563EB" />
                </linearGradient>
            </defs>
            <path d="M50 15 C50 15 20 50 20 70 C20 86.5 33.5 100 50 100 C66.5 100 80 86.5 80 70 C80 50 50 15 50 15 Z" fill="url(#waterGrad)" />
            <path d="M35 70 C35 78 41 85 50 85 C59 85 65 78 65 70 C65 60 50 40 50 40 C50 40 35 60 35 70 Z" fill="#DBEAFE" opacity="0.6" />
            <path d="M45 65 A 10 10 0 0 1 55 65" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.8" />
        </svg>
    )
}
