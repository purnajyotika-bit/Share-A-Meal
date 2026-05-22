import React, { useRef, useEffect } from 'react';

// Draws a visual QR-code-like grid from the code string
function drawQR(canvas, code) {
  const ctx = canvas.getContext('2d');
  const size = 200;
  const m = 10; // module size in px
  const cols = Math.floor(size / m); // 20 modules

  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = '#111';

  // Finder pattern (top-left)
  const finder = (ox, oy) => {
    ctx.fillRect(ox*m, oy*m, 7*m, 7*m);
    ctx.fillStyle = '#fff';
    ctx.fillRect((ox+1)*m, (oy+1)*m, 5*m, 5*m);
    ctx.fillStyle = '#111';
    ctx.fillRect((ox+2)*m, (oy+2)*m, 3*m, 3*m);
  };
  finder(1, 1);
  finder(cols - 8, 1);
  finder(1, cols - 8);

  // Data modules from code
  for (let i = 0; i < code.length; i++) {
    const ch = code.charCodeAt(i);
    for (let bit = 0; bit < 8; bit++) {
      if ((ch >> bit) & 1) {
        const idx = i * 8 + bit;
        const col = 9 + (idx % (cols - 10));
        const row = 9 + Math.floor(idx / (cols - 10));
        if (row < cols - 2 && col < cols - 2) {
          ctx.fillRect(col * m, row * m, m, m);
        }
      }
    }
  }
}

export default function QRCodeDisplay({ code }) {
  const ref = useRef(null);
  useEffect(() => { if (ref.current && code) drawQR(ref.current, code); }, [code]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="bg-white p-4 rounded-xl border shadow-sm inline-block">
        <canvas ref={ref} width={200} height={200} className="block" />
      </div>
      <div className="text-center">
        <p className="font-mono text-3xl font-bold tracking-[0.4em] text-foreground">{code}</p>
        <p className="text-xs text-muted-foreground mt-1">Show this code to the receiver</p>
      </div>
    </div>
  );
}
