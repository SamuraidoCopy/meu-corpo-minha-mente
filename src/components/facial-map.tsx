'use client'

import React from 'react'
import { FACIAL_ZONES, FacialZone, ELEMENTS } from '@/lib/tcm-data'
import { cn } from '@/lib/utils'

interface FacialMapProps {
    onSelectZone: (zone: FacialZone) => void;
    selectedZoneId?: string | null;
    className?: string;
}

export function FacialMap({ onSelectZone, selectedZoneId, className }: FacialMapProps) {
    return (
        <div className={cn("relative w-full max-w-[300px] mx-auto aspect-[3/4]", className)}>
            <svg
                viewBox="0 0 300 400"
                className="w-full h-full drop-shadow-xl"
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Face Outline - Generic */}
                <ellipse cx="150" cy="200" rx="130" ry="180" fill="#f5d0ba" stroke="#e0b090" strokeWidth="2" />

                {/* Zones */}
                {FACIAL_ZONES.map((zone) => {
                    const isSelected = selectedZoneId === zone.id;
                    const elementColor = ELEMENTS[zone.element].color; // e.g., 'bg-red-500' -> we need hex or class usage

                    // We'll use classes for fill, but SVG constraints might need inline styles or specific classes
                    // For simplicity, let's use a semi-transparent white overlay on hover/select

                    return (
                        <path
                            key={zone.id}
                            d={zone.svgPath}
                            className={cn(
                                "cursor-pointer transition-all duration-300 ease-in-out",
                                "hover:opacity-60 hover:fill-current hover:text-white/40",
                                isSelected ? "fill-current text-white/50 stroke-white stroke-2" : "fill-transparent"
                            )}
                            onClick={() => onSelectZone(zone)}
                        />
                    )
                })}

                {/* Labels for accessibility/debugging (optional, maybe hidden) */}
            </svg>

            {/* Overlay descriptions could go here, or in the parent */}
        </div>
    )
}
