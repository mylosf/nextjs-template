"use client";
import { useEffect, useState } from 'react';

export function Emerald3D() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-6 h-9 flex items-center justify-center">
        <div className="w-4 h-6 bg-red-500 rounded-sm animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="w-6 h-9 flex items-center justify-center perspective-1000">
      <div className="relative w-4 h-6 animate-spin-y" style={{ transformStyle: 'preserve-3d' }}>
        {/* Top pyramid - front face */}
        <div 
          className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-b-[12px] border-l-transparent border-r-transparent border-b-red-500"
          style={{
            filter: 'drop-shadow(0 0 4px rgba(239, 68, 68, 0.6))',
            transform: 'translateZ(4px)',
          }}
        />
        {/* Top pyramid - back face */}
        <div 
          className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-b-[12px] border-l-transparent border-r-transparent border-b-red-500"
          style={{
            filter: 'drop-shadow(0 0 4px rgba(239, 68, 68, 0.6))',
            transform: 'translateZ(-4px)',
          }}
        />
        {/* Top pyramid - left face */}
        <div 
          className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-b-[12px] border-l-transparent border-r-transparent border-b-red-500"
          style={{
            filter: 'drop-shadow(0 0 4px rgba(239, 68, 68, 0.6))',
            transform: 'rotateY(90deg) translateZ(4px)',
          }}
        />
        {/* Top pyramid - right face */}
        <div 
          className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-b-[12px] border-l-transparent border-r-transparent border-b-red-500"
          style={{
            filter: 'drop-shadow(0 0 4px rgba(239, 68, 68, 0.6))',
            transform: 'rotateY(-90deg) translateZ(4px)',
          }}
        />
        
        {/* Bottom pyramid - front face */}
        <div 
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[12px] border-l-transparent border-r-transparent border-t-red-500"
          style={{
            filter: 'drop-shadow(0 0 4px rgba(239, 68, 68, 0.6))',
            transform: 'translateZ(4px)',
          }}
        />
        {/* Bottom pyramid - back face */}
        <div 
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[12px] border-l-transparent border-r-transparent border-t-red-500"
          style={{
            filter: 'drop-shadow(0 0 4px rgba(239, 68, 68, 0.6))',
            transform: 'translateZ(-4px)',
          }}
        />
        {/* Bottom pyramid - left face */}
        <div 
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[12px] border-l-transparent border-r-transparent border-t-red-500"
          style={{
            filter: 'drop-shadow(0 0 4px rgba(239, 68, 68, 0.6))',
            transform: 'rotateY(90deg) translateZ(4px)',
          }}
        />
        {/* Bottom pyramid - right face */}
        <div 
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[12px] border-l-transparent border-r-transparent border-t-red-500"
          style={{
            filter: 'drop-shadow(0 0 4px rgba(239, 68, 68, 0.6))',
            transform: 'rotateY(-90deg) translateZ(4px)',
          }}
        />
        
        {/* Center gem highlight */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-red-300 rounded-full opacity-80" style={{ transform: 'translateZ(6px)' }} />
      </div>
    </div>
  );
} 