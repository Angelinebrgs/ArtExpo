import { useEffect, useRef } from 'react';

/**
 * Curseur cyanotype : un point qui suit la souris et un anneau qui la
 * rattrape avec un léger retard. Désactivé sur écrans tactiles (CSS).
 */
export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let rx = x;
    let ry = y;

    const onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      dot.style.left = `${x}px`;
      dot.style.top = `${y}px`;
    };
    const onOver = (e: MouseEvent) => {
      const t = e.target as Element | null;
      const hov = t?.closest?.('a, button, .chip, .nav-link, .ulink, [data-hover]');
      document.body.classList.toggle('is-hovering', !!hov);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseover', onOver);

    let raf = 0;
    const tick = () => {
      rx += (x - rx) * 0.18;
      ry += (y - ry) * 0.18;
      ring.style.left = `${rx}px`;
      ring.style.top = `${ry}px`;
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div ref={ringRef} className="cur-ring" />
      <div ref={dotRef} className="cur-dot" />
    </>
  );
}
