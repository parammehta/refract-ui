import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Image } from './Image';

const src = { src: '/photo.jpg', width: 800, height: 600 };
const videoSrc = { src: '/clip.mp4', width: 800, height: 600 };

describe('Image', () => {
  it('renders an img element for a non-video source', () => {
    const { container } = render(<Image src={src} alt="A photo" />);
    expect(container.querySelector('img[alt="A photo"]')).toBeInTheDocument();
  });

  it('renders a video element for an .mp4 source', () => {
    const { container } = render(<Image src={videoSrc} alt="A clip" />);
    expect(container.querySelector('video')).toBeInTheDocument();
    expect(container.querySelector('img')).not.toBeInTheDocument();
  });

  it('sets width/height on the img from the src object', () => {
    const { container } = render(<Image src={src} alt="A photo" />);
    const img = container.querySelector('img[alt="A photo"]');
    expect(img).toHaveAttribute('width', '800');
    expect(img).toHaveAttribute('height', '600');
  });

  it('renders a play/pause button for video sources by default', () => {
    render(<Image src={videoSrc} alt="A clip" />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('omits the play/pause button when noPauseButton is set', () => {
    render(<Image src={videoSrc} alt="A clip" noPauseButton />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('toggles the button label when clicked', () => {
    render(<Image src={videoSrc} alt="A clip" />);
    const button = screen.getByRole('button');
    const initialLabel = button.textContent;
    fireEvent.click(button);
    expect(button.textContent).not.toBe(initialLabel);
  });

  it('renders a placeholder image when provided', () => {
    const { container } = render(
      <Image src={src} alt="A photo" placeholder={{ src: '/placeholder.jpg' }} />
    );
    expect(container.querySelector('img[src="/placeholder.jpg"]')).toBeInTheDocument();
  });

  it('applies reveal and raised data attributes', () => {
    const { container } = render(<Image src={src} alt="A photo" reveal raised />);
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveAttribute('data-reveal', 'true');
    expect(root).toHaveAttribute('data-raised', 'true');
  });

  it('merges a custom className onto the root', () => {
    const { container } = render(<Image src={src} alt="A photo" className="extra" />);
    expect(container.firstChild).toHaveClass('extra');
  });

  it('renders nothing broken when neither src nor srcSet is given', () => {
    expect(() => render(<Image alt="Nothing" />)).not.toThrow();
  });
});
