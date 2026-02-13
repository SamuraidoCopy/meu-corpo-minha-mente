import { Translation } from '../types';

interface SymptomCardProps {
    zoneName: string;
    translation: Translation;
    onClose: () => void;
    color: string;
}

export const SymptomCard = ({ zoneName, translation, onClose, color }: SymptomCardProps) => {
    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
            onClick={onClose}
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)' }}
        >
            <div
                className="bg-white w-full max-w-md p-8 relative shadow-2xl animate-slide-up sm:rounded-3xl rounded-t-[2rem]"
                onClick={e => e.stopPropagation()}
            >
                <div
                    className="absolute top-0 left-0 w-full h-1.5 opacity-80"
                    style={{ backgroundColor: color }}
                />

                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                >
                    ✕
                </button>

                <span
                    className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase mb-3 opacity-90 text-white"
                    style={{ backgroundColor: color }}
                >
                    {zoneName}
                </span>

                <h2 className="text-3xl font-serif text-gray-900 mb-6 leading-tight">
                    {translation.root_emotion}
                </h2>

                <div className="bg-paper rounded-xl p-6 mb-6 border border-gray-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: color }} />
                    <p className="text-gray-600 font-serif italic text-lg leading-relaxed">
                        "{translation.message}"
                    </p>
                </div>

                <div className="flex items-center justify-between items-center bg-gray-50 rounded-xl p-4 mb-6">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Caminho da Cura</span>
                    <div className="flex items-center gap-2">
                        <span className="text-lg">✨</span>
                        <span className="text-gray-800 font-medium">{translation.healing_emotion}</span>
                    </div>
                </div>

                <button className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-black transition-transform active:scale-95 shadow-lg shadow-gray-200">
                    Agendar Sessão de Limpeza
                </button>
            </div>
        </div>
    );
};
