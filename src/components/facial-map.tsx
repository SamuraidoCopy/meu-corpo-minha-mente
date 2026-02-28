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
                            case 'Madeira': return isSelected ? "fill-emerald-500/70 stroke-emerald-500 stroke-[3px]" : "fill-emerald-500/30 hover:fill-emerald-500/50 stroke-emerald-500/40 hover:stroke-emerald-500";
                            case 'Fogo': return isSelected ? "fill-red-500/70 stroke-red-500 stroke-[3px]" : "fill-red-500/30 hover:fill-red-500/50 stroke-red-500/40 hover:stroke-red-500";
                            case 'Terra': return isSelected ? "fill-yellow-400/80 stroke-yellow-400 stroke-[3px]" : "fill-yellow-400/30 hover:fill-yellow-400/60 stroke-yellow-400/50 hover:stroke-yellow-400";
                            case 'Metal': return isSelected ? "fill-white/80 stroke-white stroke-[3px]" : "fill-white/30 hover:fill-white/60 stroke-white/50 hover:stroke-white";
                            case 'Água': return isSelected ? "fill-slate-500/70 stroke-slate-500 stroke-[3px]" : "fill-slate-500/40 hover:fill-slate-500/60 stroke-slate-500/60 hover:stroke-slate-500";
                            default: return isSelected ? "fill-primary/60 stroke-primary stroke-[3px]" : "fill-primary/20 hover:fill-primary/40 stroke-primary/30 hover:stroke-primary/50";
                        }
                    }

                    return (
                        <path
                            key={zone.id}
                            d={zone.svgPath}
                            style={{ animationDelay: `${index * 50 + 500}ms` }}
                            className={cn(
                                "cursor-pointer transition-all duration-300 outline-none animate-in fade-in fill-mode-both origin-center mix-blend-overlay hover:scale-[1.01] pointer-events-auto",
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
