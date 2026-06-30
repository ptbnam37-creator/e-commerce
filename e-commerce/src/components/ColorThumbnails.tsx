import React, { memo } from 'react';
import { ProductColor } from '../context/CartContext';

interface ColorThumbnailProps {
  color: ProductColor;
  isSelected: boolean;
  onSelect: (name: string) => void;
}

const ColorThumbnail = memo(({ color, isSelected, onSelect }: ColorThumbnailProps) => {
  return (
    <div
      onClick={() => onSelect(color.name)}
      style={{
        border: isSelected ? '1.5px solid #00c0ff' : '1px solid #dcdcdc',
        borderRadius: '4px',
        padding: '6px',
        cursor: 'pointer',
        textAlign: 'center',
        width: '76px',
        backgroundColor: '#ffffff',
        transition: 'all 0.2s'
      }}
    >
      <div style={{ width: '48px', height: '48px', margin: '0 auto 4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img
          src={color.image}
          alt={color.name}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain'
          }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/samsung_a31.png';
          }}
        />
      </div>
      <div style={{ fontSize: '11px', color: '#666', whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: '1.2' }}>
        {color.name}
      </div>
    </div>
  );
});

interface ColorThumbnailsProps {
  colors: ProductColor[];
  selectedColor: string;
  onSelectColor: (name: string) => void;
}

export const ColorThumbnails = memo(({ colors, selectedColor, onSelectColor }: ColorThumbnailsProps) => {
  return (
    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
      {colors.map((c) => (
        <ColorThumbnail
          key={c.name}
          color={c}
          isSelected={selectedColor === c.name}
          onSelect={onSelectColor}
        />
      ))}
    </div>
  );
});
