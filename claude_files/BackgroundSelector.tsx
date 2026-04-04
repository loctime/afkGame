import React from 'react';

interface BackgroundSelectorProps {
  currentBackground: number;
  onBackgroundChange: (backgroundNumber: number) => void;
}

export const BackgroundSelector: React.FC<BackgroundSelectorProps> = ({
  currentBackground,
  onBackgroundChange,
}) => {
  const backgrounds = [
    { id: 1, name: 'Fondo 1', preview: '/assets/background/PNG/background 1/Preview 1.png' },
    { id: 2, name: 'Fondo 2', preview: '/assets/background/PNG/background 2/Preview 2.png' },
    { id: 3, name: 'Fondo 3', preview: '/assets/background/PNG/background 3/Preview 3.png' },
    { id: 4, name: 'Fondo 4', preview: '/assets/background/PNG/background 4/Preview 4.png' },
  ];

  return (
    <div className="bg-gray-800 rounded-lg p-4 mb-4">
      <h3 className="text-white text-lg font-semibold mb-3">Seleccionar Fondo</h3>
      <div className="grid grid-cols-2 gap-3">
        {backgrounds.map((bg) => (
          <button
            key={bg.id}
            onClick={() => onBackgroundChange(bg.id)}
            className={`relative rounded-lg overflow-hidden border-2 transition-all duration-200 ${
              currentBackground === bg.id
                ? 'border-blue-400 shadow-lg shadow-blue-400/50'
                : 'border-gray-600 hover:border-gray-400'
            }`}
          >
            <img
              src={bg.preview}
              alt={bg.name}
              className="w-full h-20 object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 p-1">
              <span className="text-white text-xs font-medium">{bg.name}</span>
            </div>
            {currentBackground === bg.id && (
              <div className="absolute top-1 right-1">
                <div className="w-4 h-4 bg-blue-400 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
