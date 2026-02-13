

interface Zone {
    id: string; // This ID must match the 'id' in the JSON 'facial_zones'
    cx: number;
    cy: number;
    r: number;
    color: string;
}

interface FacialMapProps {
    onZoneClick: (zoneId: string) => void;
}

// Improved Face SVG
export const FacialMap = ({ onZoneClick }: FacialMapProps) => {
    const zones: Zone[] = [
        { id: 'glabella', cx: 100, cy: 85, r: 14, color: '#81C784' }, // Wood - Glabella
        { id: 'temples', cx: 160, cy: 90, r: 12, color: '#81C784' },   // Wood - Temples (Right)
        { id: 'temples', cx: 40, cy: 90, r: 12, color: '#81C784' },    // Wood - Temples (Left)
        { id: 'nose_tip', cx: 100, cy: 135, r: 10, color: '#E57373' }, // Fire - Nose
        { id: 'chin', cx: 100, cy: 195, r: 16, color: '#E57373' },     // Fire - Chin
        { id: 'cheekbones', cx: 55, cy: 125, r: 15, color: '#FFD54F' },// Earth - Cheek L
        { id: 'cheekbones', cx: 145, cy: 125, r: 15, color: '#FFD54F' },// Earth - Cheek R
        { id: 'cheeks_side', cx: 30, cy: 155, r: 15, color: '#B0BEC5' },// Metal - Side L
        { id: 'cheeks_side', cx: 170, cy: 155, r: 15, color: '#B0BEC5' },// Metal - Side R
        { id: 'undereyes', cx: 100, cy: 108, r: 24, color: '#546E7A' },  // Water - Undereyes (Band)
        { id: 'jawline', cx: 145, cy: 185, r: 18, color: '#546E7A' },   // Water - Jaw Right
    ];

    return (
        <div className="relative w-full max-w-xs mx-auto aspect-[3/4]">
            <svg viewBox="0 0 200 250" className="w-full h-full drop-shadow-sm filter saturate-[1.1]">
                <defs>
                    <filter id="softGlow">
                        <feGaussianBlur stdDeviation="5" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Head Contour - Fine Line Art */}
                <path
                    d="M40,70 Q40,10 100,10 T160,70 V150 Q160,230 100,230 T40,150 Z"
                    fill="none"
                    stroke="#475569"
                    strokeWidth="1"
                    opacity="0.6"
                />

                {/* Facial Features - Minimalist */}
                {/* Brows */}
                <path d="M55,75 Q75,70 85,80" fill="none" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
                <path d="M115,80 Q125,70 145,75" fill="none" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />

                {/* Eyes - Closed */}
                <path d="M60,95 Q70,98 80,95" fill="none" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M120,95 Q130,98 140,95" fill="none" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />

                {/* Nose - Subtle */}
                <path d="M100,100 Q95,120 90,130 Q100,138 110,130" fill="none" stroke="#94A3B8" strokeWidth="1" opacity="0.5" />

                {/* Mouth - Serene */}
                <path d="M85,170 Q100,178 115,170" fill="none" stroke="#64748B" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />

                {/* Interactive Zones - Glowing Orbs */}
                {zones.map((zone, idx) => (
                    <circle
                        key={idx}
                        cx={zone.cx}
                        cy={zone.cy}
                        r={zone.r}
                        fill={zone.color}
                        opacity="0.25"
                        className="cursor-pointer hover:opacity-0.5 hover:scale-110 origin-center transition-all duration-300 ease-out"
                        style={{ mixBlendMode: 'multiply' }}
                        onClick={() => onZoneClick(zone.id)}
                    />
                ))}

                {/* Helper Text */}
                <text x="100" y="245" textAnchor="middle" fontSize="9" fill="#94A3B8" letterSpacing="0.05em" className="uppercase font-light">
                    Toque nos pontos
                </text>
            </svg>
        </div>
    );
};
