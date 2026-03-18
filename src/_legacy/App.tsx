import { useState } from 'react'
import { FacialMap } from './components/FacialMap'
import { SymptomCard } from './components/SymptomCard'
import rawData from './data.json'
import { IdiomaDaDoencaData, FacialZone } from './types'

// Force cast JSON to Type
const data = rawData as unknown as IdiomaDaDoencaData;

function App() {
    const [selectedZone, setSelectedZone] = useState<{ zone: FacialZone, color: string } | null>(null);

    const handleZoneClick = (zoneId: string) => {
        // Search through all elements to find the zone and its color
        let foundZone: FacialZone | undefined;
        let foundColor: string = '';

        Object.values(data.elements).forEach((element) => {
            const zone = element.facial_zones.find((z: FacialZone) => z.id === zoneId);
            if (zone) {
                foundZone = zone;
                foundColor = element.color;
            }
        });

        if (foundZone) {
            setSelectedZone({ zone: foundZone, color: foundColor });
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden flex flex-col items-center py-12 px-4 font-sans selection:bg-wood/30">
            {/* Ambient Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-wood/20 rounded-full blur-[120px] animate-pulse-slow" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-earth/20 rounded-full blur-[120px] animate-pulse-slow delay-1000" />
                <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] bg-fire/10 rounded-full blur-[100px] animate-pulse-slow delay-2000" />
            </div>

            <header className="relative z-10 mb-12 text-center max-w-lg animate-fade-in">
                <span className="inline-block py-1 px-3 rounded-full bg-white/40 border border-white/50 backdrop-blur-md text-xs font-bold tracking-widest text-gray-600 uppercase mb-4 shadow-sm">
                    Método Dra. Ranieli e Cleucia
                </span>
                <h1 className="text-5xl md:text-6xl font-serif text-gray-900 mb-6 tracking-tight leading-tight">
                    O Mapa da <span className="text-transparent bg-clip-text bg-gradient-to-r from-wood to-earth">Raiz</span>
                </h1>
                <p className="text-gray-600 text-lg leading-relaxed max-w-sm mx-auto">
                    Seu rosto é um mapa. Toque nos pontos para traduzir a linguagem oculta do seu corpo.
                </p>
            </header>

            <main className="relative z-10 w-full max-w-sm bg-white/40 backdrop-blur-xl rounded-[3rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] p-8 border border-white/50 ring-1 ring-white/60">
                <FacialMap onZoneClick={handleZoneClick} />
            </main>

            {selectedZone && (
                <SymptomCard
                    zoneName={selectedZone.zone.name}
                    translation={selectedZone.zone.translation}
                    color={selectedZone.color}
                    onClose={() => setSelectedZone(null)}
                />
            )}

            <footer className="relative z-10 mt-20 text-center">
                <p className="text-xs text-gray-400 font-medium tracking-widest uppercase opacity-60">© 2026 Meu Corpo Minha Mente</p>
            </footer>
        </div>
    )
}

export default App
