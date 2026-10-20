import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

export type ProductSequenceHandle = {
  /** 0 = closed, 1 = fully open and framed close. */
  setProgress: (progress: number) => void;
};

const FRAME_COUNT = 16;

const frameUrl = (index: number) =>
  `/assets/sequence/frame-${String(index).padStart(3, '0')}.webp`;

/**
 * The hero product, pre-rendered as a frame sequence.
 *
 * The sequence is drawn to a canvas and scrubbed by scroll progress, so the
 * page carries no 3D runtime, nothing animates while the tab is hidden, and
 * reduced-motion users get a single static frame.
 */
export const ProductSequence = forwardRef<
  ProductSequenceHandle,
  { className?: string; alt: string }
>(function ProductSequence({ className, alt }, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const progressRef = useRef(0);
  const [ready, setReady] = useState(false);

  const draw = () => {
    const canvas = canvasRef.current;
    const images = imagesRef.current;
    if (!canvas || !images.length) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    const ratio = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (canvas.width !== width * ratio || canvas.height !== height * ratio) {
      canvas.width = width * ratio;
      canvas.height = height * ratio;
    }
    context.clearRect(0, 0, canvas.width, canvas.height);

    const index = Math.min(
      images.length - 1,
      Math.max(0, Math.round(progressRef.current * (images.length - 1))),
    );
    const image = images[index];
    if (!image || !image.complete || !image.naturalWidth) return;

    // Contain the frame inside the canvas so nothing is ever cropped.
    const scale = Math.min(canvas.width / image.naturalWidth, canvas.height / image.naturalHeight);
    const drawWidth = image.naturalWidth * scale;
    const drawHeight = image.naturalHeight * scale;
    context.drawImage(
      image,
      (canvas.width - drawWidth) / 2,
      (canvas.height - drawHeight) / 2,
      drawWidth,
      drawHeight,
    );
  };

  useEffect(() => {
    let cancelled = false;
    const images = Array.from({ length: FRAME_COUNT }, (_, index) => {
      const image = new Image();
      image.decoding = 'async';
      image.src = frameUrl(index);
      return image;
    });
    imagesRef.current = images;

    let loaded = 0;
    const onLoad = () => {
      loaded += 1;
      if (cancelled) return;
      if (loaded === images.length) {
        setReady(true);
        draw();
      }
    };
    images.forEach((image) => {
      if (image.complete) onLoad();
      else image.addEventListener('load', onLoad, { once: true });
    });

    const onResize = () => draw();
    window.addEventListener('resize', onResize);
    return () => {
      cancelled = true;
      window.removeEventListener('resize', onResize);
    };
  }, []);

  useImperativeHandle(ref, () => ({
    setProgress: (progress: number) => {
      progressRef.current = Math.max(0, Math.min(1, progress));
      draw();
    },
  }));

  return (
    <div className={className}>
      <canvas
        ref={canvasRef}
        className="cin-sequence__canvas"
        role="img"
        aria-label={alt}
        data-ready={ready ? 'true' : 'false'}
      />
    </div>
  );
});
