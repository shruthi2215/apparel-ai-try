import { Suspense, useMemo, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, ContactShadows } from "@react-three/drei";
import type * as THREE from "three";
import { bodyMetrics, type BodySize, type Gender } from "@/lib/avatar";

interface Props {
  gender: Gender;
  bodySize: BodySize;
  skinTone: string;
  garmentColor?: string;
  className?: string;
}

function Body({ gender, bodySize, skinTone, garmentColor }: Props) {
  const m = useMemo(() => bodyMetrics(gender, bodySize), [gender, bodySize]);
  const group = useRef<THREE.Group>(null);

  const skin = <meshStandardMaterial color={skinTone} roughness={0.62} metalness={0.02} />;
  const cloth = (
    <meshStandardMaterial color={garmentColor || "#3f3f46"} roughness={0.85} metalness={0.02} />
  );

  const armY = 1.02;
  const armX = m.shoulderWidth * 0.55 + m.limbThickness;
  const legX = m.hipWidth * 0.28;

  return (
    <group ref={group} position={[0, -0.9, 0]}>
      {/* head */}
      <mesh position={[0, 1.6, 0]} scale={[0.19, 0.235, 0.2]} castShadow>
        <sphereGeometry args={[1, 48, 48]} />
        {skin}
      </mesh>
      {/* hair-ish cap */}
      <mesh position={[0, 1.66, gender === "female" ? -0.01 : 0]} scale={gender === "female" ? [0.205, 0.235, 0.215] : [0.196, 0.2, 0.2]}>
        <sphereGeometry args={[1, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
        <meshStandardMaterial color="#241c18" roughness={0.9} />
      </mesh>
      {/* neck */}
      <mesh position={[0, 1.4, 0]} castShadow>
        <cylinderGeometry args={[0.062, 0.072, 0.12, 24]} />
        {skin}
      </mesh>

      {/* chest / torso (garment) */}
      <mesh position={[0, 1.13, 0]} scale={[m.chestWidth * 0.5, 0.3, m.depth * 0.5]} castShadow>
        <sphereGeometry args={[1, 40, 32]} />
        {cloth}
      </mesh>
      {gender === "female" && m.bust > 0 && (
        <mesh position={[0, 1.09, m.depth * 0.22]} scale={[m.chestWidth * 0.34, m.bust * 1.1, m.bust * 1.1]}>
          <sphereGeometry args={[1, 32, 24]} />
          {cloth}
        </mesh>
      )}
      {/* shoulders */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * m.shoulderWidth * 0.5, 1.28, 0]} scale={[0.1, 0.09, m.depth * 0.42]} castShadow>
          <sphereGeometry args={[1, 24, 24]} />
          {cloth}
        </mesh>
      ))}
      {/* waist */}
      <mesh position={[0, 0.86, 0]} scale={[m.waistWidth * 0.5, 0.16, m.depth * 0.45]} castShadow>
        <sphereGeometry args={[1, 32, 24]} />
        {cloth}
      </mesh>
      {/* hips */}
      <mesh position={[0, 0.68, 0]} scale={[m.hipWidth * 0.5, 0.19, m.depth * 0.48]} castShadow>
        <sphereGeometry args={[1, 32, 24]} />
        {cloth}
      </mesh>

      {/* arms */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[s * armX, armY, 0]} castShadow>
            <capsuleGeometry args={[m.limbThickness * 0.85, 0.34, 8, 20]} />
            {skin}
          </mesh>
          <mesh position={[s * (armX + 0.02), armY - 0.42, 0]} castShadow>
            <capsuleGeometry args={[m.limbThickness * 0.72, 0.3, 8, 20]} />
            {skin}
          </mesh>
        </group>
      ))}

      {/* legs */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[s * legX, 0.4, 0]} castShadow>
            <capsuleGeometry args={[m.limbThickness * 1.25, 0.34, 8, 20]} />
            {gender === "female" ? skin : skin}
          </mesh>
          <mesh position={[s * legX, 0.02, 0]} castShadow>
            <capsuleGeometry args={[m.limbThickness * 1.02, 0.32, 8, 20]} />
            {skin}
          </mesh>
          <mesh position={[s * legX, -0.2, 0.05]} scale={[0.07, 0.045, 0.12]} castShadow>
            <sphereGeometry args={[1, 20, 16]} />
            <meshStandardMaterial color="#2b2b31" roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export default function Avatar3DViewer(props: Props) {
  return (
    <div className={props.className ?? "w-full aspect-[3/4] rounded-2xl overflow-hidden bg-muted/40 border border-border"}>
      <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0.35, 3.4], fov: 40 }}>
        <color attach="background" args={["#f6f6f7"]} />
        <ambientLight intensity={0.75} />
        <directionalLight position={[3, 5, 4]} intensity={1.5} castShadow />
        <directionalLight position={[-3, 2, -3]} intensity={0.5} />
        <Suspense fallback={null}>
          <Body {...props} />
          <ContactShadows position={[0, -1.13, 0]} opacity={0.35} scale={5} blur={2.6} far={2} />
        </Suspense>
        <OrbitControls
          enablePan={false}
          minDistance={2.2}
          maxDistance={5}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 1.9}
        />
      </Canvas>
    </div>
  );
}