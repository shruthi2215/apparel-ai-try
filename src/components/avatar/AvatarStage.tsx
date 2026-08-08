import { Suspense, useCallback, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import { Body } from "@/components/avatar/Avatar3DViewer";
import type { BodySize, Gender } from "@/lib/avatar";
import { Button } from "@/components/ui/button";
import { Download, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";

type ViewName = "front" | "side" | "back";

const VIEWS: Record<ViewName, [number, number, number]> = {
  front: [0, 0.25, 3.1],
  side: [3.1, 0.25, 0.001],
  back: [0, 0.25, -3.1],
};

interface Props {
  gender: Gender;
  bodySize: BodySize;
  skinTone: string;
  garmentColor?: string;
  showControls?: boolean;
  className?: string;
}

/** Premium studio stage: 360° orbit, zoom, view presets and PNG download. */
export default function AvatarStage({
  gender, bodySize, skinTone, garmentColor, showControls = true, className,
}: Props) {
  const controls = useRef<React.ComponentRef<typeof OrbitControls> | null>(null);
  const canvasEl = useRef<HTMLCanvasElement | null>(null);
  const [view, setView] = useState<ViewName>("front");
  const [autoRotate, setAutoRotate] = useState(false);

  const setPreset = useCallback((name: ViewName) => {
    setView(name);
    const c = controls.current as unknown as { object?: { position: { set: (x: number, y: number, z: number) => void } }; update?: () => void } | null;
    const [x, y, z] = VIEWS[name];
    c?.object?.position.set(x, y, z);
    c?.update?.();
  }, []);

  const zoom = useCallback((factor: number) => {
    const c = controls.current as unknown as { object?: { position: { multiplyScalar: (n: number) => void; length: () => number } }; update?: () => void } | null;
    const pos = c?.object?.position;
    if (!pos) return;
    const len = pos.length();
    const next = Math.min(5, Math.max(2.2, len * factor));
    pos.multiplyScalar(next / len);
    c?.update?.();
  }, []);

  const download = useCallback(() => {
    const el = canvasEl.current;
    if (!el) return;
    const url = el.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = "tryvior-avatar.png";
    a.click();
  }, []);

  return (
    <div className={className ?? "space-y-3"}>
      <div className="relative w-full aspect-[3/4] rounded-3xl overflow-hidden border border-border bg-gradient-to-b from-muted/60 to-background shadow-sm">
        <Canvas
          shadows
          dpr={[1, 2]}
          gl={{ preserveDrawingBuffer: true, antialias: true }}
          camera={{ position: VIEWS.front, fov: 38 }}
          onCreated={({ gl }) => { canvasEl.current = gl.domElement; }}
        >
          <color attach="background" args={["#f4f4f6"]} />
          <ambientLight intensity={0.7} />
          <directionalLight position={[3, 5, 4]} intensity={1.45} castShadow />
          <directionalLight position={[-3.5, 2.5, -3]} intensity={0.5} />
          <spotLight position={[0, 4.5, 2.5]} angle={0.6} penumbra={1} intensity={0.5} />
          <Suspense fallback={null}>
            <Body gender={gender} bodySize={bodySize} skinTone={skinTone} garmentColor={garmentColor} />
            <ContactShadows position={[0, -0.87, 0]} opacity={0.32} scale={4} blur={2.6} far={2} />
          </Suspense>
          <OrbitControls
            ref={controls}
            enablePan={false}
            autoRotate={autoRotate}
            autoRotateSpeed={1.1}
            minDistance={2.2}
            maxDistance={5}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 1.9}
          />
        </Canvas>

        {showControls && (
          <div className="absolute top-3 left-3 flex gap-1 rounded-full bg-background/80 backdrop-blur border border-border p-1">
            {(["front", "side", "back"] as ViewName[]).map((v) => (
              <button
                key={v}
                onClick={() => setPreset(v)}
                aria-pressed={view === v}
                className={`px-3 py-1 rounded-full font-body text-[11px] capitalize transition-colors ${
                  view === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        )}
      </div>

      {showControls && (
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => zoom(0.82)} className="rounded-xl font-body text-xs" aria-label="Zoom in">
            <ZoomIn className="w-3.5 h-3.5 mr-1.5" /> Zoom in
          </Button>
          <Button variant="outline" size="sm" onClick={() => zoom(1.22)} className="rounded-xl font-body text-xs" aria-label="Zoom out">
            <ZoomOut className="w-3.5 h-3.5 mr-1.5" /> Zoom out
          </Button>
          <Button
            variant={autoRotate ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRotate((v) => !v)}
            className="rounded-xl font-body text-xs"
            aria-pressed={autoRotate}
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> {autoRotate ? "Stop rotate" : "Rotate 360°"}
          </Button>
          <Button variant="outline" size="sm" onClick={download} className="rounded-xl font-body text-xs">
            <Download className="w-3.5 h-3.5 mr-1.5" /> Download
          </Button>
        </div>
      )}
    </div>
  );
}
