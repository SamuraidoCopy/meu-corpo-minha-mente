'use client'

import React from 'react'
import { FACIAL_ZONES, FacialZone } from '@/lib/tcm-data'
import { cn } from '@/lib/utils'

interface FacialMapProps {
    onSelectZone: (zone: FacialZone) => void;
    selectedZoneId?: string | null;
    gender?: 'Feminino' | 'Masculino';
    className?: string;
}

export function FacialMap({ onSelectZone, selectedZoneId, gender = 'Feminino', className }: FacialMapProps) {
    return (
        <div className={cn("relative w-full max-w-[320px] mx-auto aspect-[3/4]", className)}>
            <svg
                viewBox="0 0 300 400"
                className="w-full h-full drop-shadow-2xl overflow-visible"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <clipPath id="face-clip">
                        <rect x="0" y="0" width="300" height="400" rx="150" ry="200" />
                    </clipPath>
                </defs>

                {/* Real Face Image */}
                <image
                    href={gender === 'Masculino' ? '/images/rosto_masculino.png' : '/images/rosto_feminino.png'}
                    x="0" y="0" width="300" height="400"
                    preserveAspectRatio="xMidYMid slice"
                    clipPath="url(#face-clip)"
                    className="animate-in fade-in zoom-in-95 duration-1000 ease-out opacity-90 transition-all duration-700 delay-100"
                    style={{ transitionProperty: 'background-image, opacity' }}
                />

                {/* Zones */}
                {FACIAL_ZONES.map((zone, index) => {
                    const isSelected = selectedZoneId === zone.id;

                    return (
                        <path
                            key={zone.id}
                            d={zone.svgPath}
                            style={{ animationDelay: `${index * 50 + 500}ms` }}
                            className={cn(
                                "cursor-pointer transition-all duration-300 outline-none animate-in fade-in fill-mode-both origin-center",
                                isSelected ? "fill-primary/40 stroke-primary stroke-[3px]" : "fill-transparent hover:fill-primary/10 stroke-primary/5 hover:stroke-primary/40 hover:scale-[1.01]"
                            )}
                            onClick={() => onSelectZone(zone)}
                        >
                            <title>{zone.name}</title>
                        </path>
                    )
                })}
            </svg>
        </div >
    )
}
