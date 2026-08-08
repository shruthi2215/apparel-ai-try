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

  // Human-scale landmarks (metres), driven by size metrics
  const shoulderR = m.shoulderWidth * 0.26;
  const chestR = m.chestWidth * 0.24;
  const waistR = m.waistWidth * 0.23;
  const hipR = m.hipWidth * 0.25;
  const dz = m.depth * 0.62; // front-to-back squash factor

  const yShoulder = 1.36;
  const yChest = 1.18;
  const yWaist = 1.0;
  const yHip = 0.88;

  const armX = shoulderR + m.limbThickness * 0.85;
  const legX = hipR * 0.52;

  return (
    <group ref={group} position={[0, -0.85, 0]}>
      {/* head */}
      <mesh position={[0, 1.6, 0]} scale={[0.098, 0.125, 0.108]} castShadow>
        <sphereGeometry args={[1, 48, 48]} />
        {skin}
      </mesh>
      {/* hair */}
      <mesh position={[0, 1.615, gender === "female" ? -0.006 : 0]} scale={gender === "female" ? [0.109, 0.132, 0.119] : [0.103, 0.118, 0.112]}>
        <sphereGeometry args={[1, 40, 32, 0, Math.PI * 2, 0, Math.PI * 0.58]} />
        <meshStandardMaterial color="#241c18" roughness={0.9} />
      </mesh>
      {/* neck */}
      <mesh position={[0, 1.45, 0]} castShadow>
        <cylinderGeometry args={[0.045, 0.055, 0.13, 24]} />
        {skin}
      </mesh>

      {/* torso: shoulders → chest → waist → hips, continuous tapering */}
      <mesh position={[0, (yShoulder + yChest) / 2, 0]} scale={[1, 1, dz]} castShadow>
        <cylinderGeometry args={[shoulderR * 0.92, chestR, yShoulder - yChest + 0.06, 40, 1, true]} />
        {cloth}
      </mesh>
      <mesh position={[0, yShoulder, 0]} scale={[1, 0.5, dz]} castShadow>
        <sphereGeometry args={[shoulderR * 0.92, 40, 24]} />
        {cloth}
      </mesh>
      <mesh position={[0, (yChest + yWaist) / 2, 0]} scale={[1, 1, dz]} castShadow>
        <cylinderGeometry args={[chestR, waistR, yChest - yWaist, 40, 1, true]} />
        {cloth}
      </mesh>
      {gender === "female" && m.bust > 0 && (
        <>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * chestR * 0.45, yChest + 0.02, chestR * dz * 0.72]} scale={[m.bust * 0.62, m.bust * 0.58, m.bust * 0.5]}>
              <sphereGeometry args={[1, 28, 20]} />
              {cloth}
            </mesh>
          ))}
        </>
      )}
      <mesh position={[0, (yWaist + yHip) / 2, 0]} scale={[1, 1, dz]} castShadow>
        <cylinderGeometry args={[waistR, hipR, yWaist - yHip, 40, 1, true]} />
        {cloth}
      </mesh>
      {/* hip / seat block */}
      <mesh position={[0, yHip - 0.06, 0]} scale={[1, 0.85, dz]} castShadow>
        <sphereGeometry args={[hipR, 40, 28]} />
        {cloth}
      </mesh>

      {/* arms */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[s * armX, 1.19, 0]} rotation={[0, 0, s * 0.06]} castShadow>
            <capsuleGeometry args={[m.limbThickness * 0.62, 0.28, 10, 24]} />
            {skin}
          </mesh>
          <mesh position={[s * (armX + 0.025), 0.9, 0]} castShadow>
            <capsuleGeometry args={[m.limbThickness * 0.5, 0.26, 10, 24]} />
            {skin}
          </mesh>
          <mesh position={[s * (armX + 0.03), 0.7, 0]} scale={[0.036, 0.06, 0.022]} castShadow>
            <sphereGeometry args={[1, 20, 16]} />
            {skin}
          </mesh>
        </group>
      ))}

      {/* legs */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[s * legX, 0.62, 0]} castShadow>
            <capsuleGeometry args={[m.limbThickness * 0.98, 0.32, 10, 24]} />
            {skin}
          </mesh>
          <mesh position={[s * legX, 0.24, 0]} castShadow>
            <capsuleGeometry args={[m.limbThickness * 0.72, 0.3, 10, 24]} />
            {skin}
          </mesh>
          <mesh position={[s * legX, 0.02, 0.045]} scale={[0.048, 0.03, 0.1]} castShadow>
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
      <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0.25, 3.1], fov: 38 }}>
        <color attach="background" args={["#f6f6f7"]} />
        <ambientLight intensity={0.75} />
        <directionalLight position={[3, 5, 4]} intensity={1.5} castShadow />
        <directionalLight position={[-3, 2, -3]} intensity={0.5} />
        <Suspense fallback={null}>
          <Body {...props} />
          <ContactShadows position={[0, -0.87, 0]} opacity={0.35} scale={4} blur={2.4} far={2} />
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