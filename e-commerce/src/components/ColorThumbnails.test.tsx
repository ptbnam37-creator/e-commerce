import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ColorThumbnails } from './ColorThumbnails';

describe('ColorThumbnails Component', () => {
  const mockColors = [
    { id: '1', name: 'Đỏ', image: '/red.png' },
    { id: '2', name: 'Xanh', image: '/blue.png' }
  ];
  const mockOnSelectColor = vi.fn();

  it('renders correctly', () => {
    render(
      <ColorThumbnails
        colors={mockColors}
        selectedColor="Đỏ"
        onSelectColor={mockOnSelectColor}
      />
    );
    expect(screen.getByText('Đỏ')).toBeInTheDocument();
    expect(screen.getByText('Xanh')).toBeInTheDocument();
  });

  it('calls onSelectColor when clicking a color', () => {
    render(
      <ColorThumbnails
        colors={mockColors}
        selectedColor="Đỏ"
        onSelectColor={mockOnSelectColor}
      />
    );
    fireEvent.click(screen.getByText('Xanh'));
    expect(mockOnSelectColor).toHaveBeenCalledWith('Xanh');
  });

  it('handles image error by setting fallback image', () => {
    render(
      <ColorThumbnails
        colors={mockColors}
        selectedColor="Đỏ"
        onSelectColor={mockOnSelectColor}
      />
    );
    const redImage = screen.getByAltText('Đỏ') as HTMLImageElement;
    fireEvent.error(redImage);
    expect(redImage.src).toContain('/samsung_a31.png');
  });
});
