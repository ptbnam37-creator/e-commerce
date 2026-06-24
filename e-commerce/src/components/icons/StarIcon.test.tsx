import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { StarIcon } from './StarIcon';

describe('StarIcon', () => {
  it('renders correctly with default size', () => {
    const { container } = render(<StarIcon fillPercent={0.5} />);
    const svg = container.querySelector('svg');

    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('star-icon');
    expect(svg).toHaveStyle({ width: '28px', height: '28px' });

    const stops = container.querySelectorAll('stop');
    expect(stops).toHaveLength(2);
    expect(stops[0]).toHaveAttribute('offset', '50%');
    // Note: stopColor gets mapped to stop-color in the DOM, but sometimes we can just test the prop
    // React Testing Library usually converts it to stop-color in the DOM attribute query
    expect(stops[0]).toHaveAttribute('stop-color', '#ffd214');
    expect(stops[1]).toHaveAttribute('offset', '50%');
    expect(stops[1]).toHaveAttribute('stop-color', '#ffffff');
  });

  it('renders correctly with custom size', () => {
    const { container } = render(<StarIcon fillPercent={0.75} size="40px" />);
    const svg = container.querySelector('svg');

    expect(svg).toBeInTheDocument();
    expect(svg).toHaveStyle({ width: '40px', height: '40px' });

    const stops = container.querySelectorAll('stop');
    expect(stops[0]).toHaveAttribute('offset', '75%');
  });

  it('generates consistent gradient id reference', () => {
    const { container } = render(<StarIcon fillPercent={1} />);

    const linearGradient = container.querySelector('linearGradient');
    expect(linearGradient).toBeInTheDocument();

    const gradientId = linearGradient?.getAttribute('id');
    expect(gradientId).toBeTruthy();

    const path = container.querySelector('path');
    expect(path).toBeInTheDocument();
    expect(path).toHaveAttribute('fill', `url(#${gradientId})`);
  });
});
