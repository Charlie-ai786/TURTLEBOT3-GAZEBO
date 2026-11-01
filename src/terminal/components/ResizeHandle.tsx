import React from 'react';

interface ResizeHandleProps {
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerMove: (e: React.PointerEvent<HTMLDivElement>) => void;
  onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => void;
}

export const ResizeHandle: React.FC<ResizeHandleProps> = ({
  onPointerDown,
  onPointerMove,
  onPointerUp,
}) => {
  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      className="group absolute top-0 left-0 right-0 h-2 -translate-y-1/2 cursor-ns-resize z-30 flex items-center justify-center select-none touch-none"
      style={{ userSelect: 'none' }}
      title="Drag to resize terminal panel"
    >
      {/* Subtle visible drag divider line */}
      <div className="w-full h-[2px] bg-[#3c3c3c] group-hover:bg-[#3498db] transition-colors duration-150" />
      {/* Grip dots on hover */}
      <div className="absolute left-1/2 -translate-x-1/2 flex space-x-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="w-[3px] h-[3px] rounded-full bg-[#3498db]" />
        ))}
      </div>
    </div>
  );
};
