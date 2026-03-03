'use client'

import React from 'react'
import { FACIAL_ZONES, FacialZone } from '@/lib/tcm-data'
import { cn } from '@/lib/utils'

interface FacialMapProps {
    onToggleZone: (zone: FacialZone) => void;
    selectedZoneIds: string[];
    gender?: 'Feminino' | 'Masculino';
    className?: string;
}

export function FacialMap({ onToggleZone, selectedZoneIds = [], gender = 'Feminino', className }: FacialMapProps) {
    return (
        <div className={cn("relative w-full max-w-[320px] mx-auto aspect-[3/4]", className)}>
            <svg
                viewBox="0 0 300 400"
                className="w-full h-full drop-shadow-2xl overflow-visible pointer-events-none"
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
                    const isSelected = selectedZoneIds.includes(zone.id);

                    const getElementColorClass = (element: string, isSelected: boolean) => {
                        switch (element) {
                            case 'Madeira': return isSelected ? "fill-[#00ff00]/85" : "fill-[#00ff00]/65 hover:fill-[#00ff00]/95";
                            case 'Fogo': return isSelected ? "fill-[#ff0000]/85" : "fill-[#ff0000]/65 hover:fill-[#ff0000]/95";
                            case 'Terra': return isSelected ? "fill-[#ffff00]/85" : "fill-[#ffff00]/65 hover:fill-[#ffff00]/95";
                            case 'Metal': return isSelected ? "fill-[#ffffff]/85" : "fill-[#ffffff]/65 hover:fill-[#ffffff]/95";
                            case 'Água': return isSelected ? "fill-[#808080]/85" : "fill-[#808080]/65 hover:fill-[#808080]/95";
                            default: return isSelected ? "fill-primary/85" : "fill-primary/65 hover:fill-primary/95";
                        }
                    }

                    return (
                        <path
                            key={zone.id}
                            d={zone.svgPath}
                            style={{ animationDelay: `${index * 50 + 500}ms` }}
                            className={cn(
                                "cursor-pointer transition-all duration-300 outline-none animate-in fade-in fill-mode-both origin-center pointer-events-auto",
                                getElementColorClass(zone.element, isSelected)
                            )}
                            onClick={() => onToggleZone(zone)}
                        />
                    )
                })}
            </svg>
        </div >
    )
}
