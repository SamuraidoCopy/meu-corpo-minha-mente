'use client'

import React from 'react'
import { FACIAL_ZONES, FacialZone } from '@/lib/tcm-data'
import { cn } from '@/lib/utils'

interface FacialMapProps {
    onSelectZone: (zone: FacialZone) => void;
    selectedZoneId?: string | null;
    className?: string;
}

export function FacialMap({ onSelectZone, selectedZoneId, className }: FacialMapProps) {
    return (
        <div className={cn("relative w-full max-w-[320px] mx-auto aspect-[3/4]", className)}>
            <svg
                viewBox="0 0 300 400"
                className="w-full h-full drop-shadow-2xl overflow-visible"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Face Outline - Generic - More elegant and soft */}
                <ellipse
                    cx="150" cy="200" rx="130" ry="180"
                    fill="#F2E8E4"
                    stroke="#D4B5A2"
                    strokeWidth="1"
                    className="animate-in fade-in zoom-in-90 duration-1000 ease-out"
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
        </div>
    )
}
