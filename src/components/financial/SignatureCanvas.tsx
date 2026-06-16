import React, { useRef, useState, useEffect } from 'react';
import { Trash2, Save, CheckCircle } from 'lucide-react';
import { cn } from '@/utils';
import Button from '@/components/common/Button';

interface SignatureCanvasProps {
  onSave: (dataUrl: string | null) => void;
  height?: number;
  label?: string;
}

const SignatureCanvas: React.FC<SignatureCanvasProps> = ({
  onSave,
  height = 150,
  label = 'Draw your signature using mouse or touch',
}) => {
  const canvasRef   = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing]   = useState(false);
  const [hasSig,  setHasSig]    = useState(false);
  const [saved,   setSaved]     = useState(false);
  const lastPos                 = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width  = canvas.offsetWidth;
    canvas.height = height;
    const handleResize = () => { canvas.width = canvas.offsetWidth; };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [height]);

  const getPos = (e: MouseEvent | Touch, canvas: HTMLCanvasElement) => {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const drawLine = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    ctx.strokeStyle = '#1F4E79';
    ctx.lineWidth   = 2;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setDrawing(true);
    setSaved(false);
    const src = 'touches' in e ? e.touches[0] : e.nativeEvent as MouseEvent;
    lastPos.current = getPos(src, canvasRef.current!);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!drawing) return;
    const src = 'touches' in e ? e.touches[0] : e.nativeEvent as MouseEvent;
    const cur = getPos(src, canvasRef.current!);
    if (lastPos.current) drawLine(lastPos.current, cur);
    lastPos.current = cur;
    setHasSig(true);
  };

  const stopDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setDrawing(false);
    lastPos.current = null;
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.getContext('2d')!.clearRect(0, 0, canvas.width, canvas.height);
    setHasSig(false);
    setSaved(false);
    onSave(null);
  };

  const save = () => {
    if (!hasSig || !canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    onSave(dataUrl);
    setSaved(true);
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        className={cn(
          'signature-canvas border-2 border-dashed rounded-xl w-full block',
          hasSig ? 'border-success' : 'border-gray-300',
          'bg-white',
        )}
        style={{ height }}
        aria-label="Signature drawing area"
        role="img"
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={stopDraw}
        onMouseLeave={stopDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={stopDraw}
      />
      <div className="flex items-center gap-2 mt-2 flex-wrap">
        <Button variant="secondary" size="sm" leftIcon={<Trash2 size={12} />} onClick={clear}>
          Clear
        </Button>
        <Button
          variant="outline"
          size="sm"
          leftIcon={<Save size={12} />}
          onClick={save}
          disabled={!hasSig}
        >
          Save Signature
        </Button>
        {saved && (
          <span className="flex items-center gap-1 text-[12px] text-success font-medium">
            <CheckCircle size={13} /> Signature saved
          </span>
        )}
        {!hasSig && !saved && (
          <span className="text-[12px] text-gray-400">{label}</span>
        )}
      </div>
    </div>
  );
};

export default SignatureCanvas;
