import { Suspense, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera, Box, Sphere, Text } from "@react-three/drei";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Box as BoxIcon, RotateCw } from "lucide-react";
import { motion } from "framer-motion";
import * as THREE from "three";

interface HallViewer3DProps {
  hallName: string;
  capacity: number;
}

function Room({ capacity }: { capacity: number }) {
  const roomRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (roomRef.current && !hovered) {
      roomRef.current.rotation.y = state.clock.getElapsedTime() * 0.2;
    }
  });

  const width = Math.min(10, 4 + capacity / 50);
  const height = 4;
  const depth = Math.min(10, 4 + capacity / 50);

  return (
    <group ref={roomRef}>
      <Box
        args={[width, 0.2, depth]}
        position={[0, -height / 2, 0]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial color="#8B7355" />
      </Box>

      <Box args={[width, height, 0.2]} position={[0, 0, -depth / 2]}>
        <meshStandardMaterial color="#A0826D" />
      </Box>
      <Box args={[width, height, 0.2]} position={[0, 0, depth / 2]}>
        <meshStandardMaterial color="#A0826D" />
      </Box>
      <Box args={[0.2, height, depth]} position={[-width / 2, 0, 0]}>
        <meshStandardMaterial color="#8B7355" />
      </Box>
      <Box args={[0.2, height, depth]} position={[width / 2, 0, 0]}>
        <meshStandardMaterial color="#8B7355" />
      </Box>

      <Box args={[width, 0.2, depth]} position={[0, height / 2, 0]}>
        <meshStandardMaterial color="#6B5744" />
      </Box>

      <Box args={[width * 0.8, 0.5, 2]} position={[0, -height / 2 + 0.5, -depth / 2 + 1.5]}>
        <meshStandardMaterial color="#5B4A3A" />
      </Box>

      {Array.from({ length: Math.min(20, Math.floor(capacity / 5)) }).map((_, i) => {
        const row = Math.floor(i / 5);
        const col = i % 5;
        const spacing = 1.2;
        return (
          <Box
            key={i}
            args={[0.8, 0.8, 0.8]}
            position={[
              (col - 2) * spacing,
              -height / 2 + 0.6,
              (row - 1) * spacing + 1,
            ]}
          >
            <meshStandardMaterial color="#4A7C9C" />
          </Box>
        );
      })}

      <Sphere args={[0.3]} position={[-width / 4, height / 3, 0]}>
        <meshStandardMaterial color="#4A7C9C" emissive="#4A7C9C" emissiveIntensity={0.5} />
      </Sphere>
      <Sphere args={[0.3]} position={[width / 4, height / 3, 0]}>
        <meshStandardMaterial color="#8B7355" emissive="#8B7355" emissiveIntensity={0.5} />
      </Sphere>
    </group>
  );
}

const HallViewer3D = ({ hallName, capacity }: HallViewer3DProps) => {
  const [show3D, setShow3D] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BoxIcon className="h-5 w-5" />
                3D Hall View
              </CardTitle>
              <CardDescription>
                Interactive 3D visualization of the seminar hall
              </CardDescription>
            </div>
            <Button
              onClick={() => setShow3D(!show3D)}
              variant={show3D ? "default" : "outline"}
              size="sm"
            >
              <RotateCw className="h-4 w-4 mr-2" />
              {show3D ? "Hide" : "Show"} 3D View
            </Button>
          </div>
        </CardHeader>
        {show3D && (
          <CardContent>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="w-full h-[400px] rounded-lg overflow-hidden border-2 border-border bg-linear-to-br from-background to-muted"
            >
              <Canvas>
                <PerspectiveCamera makeDefault position={[0, 3, 12]} />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <pointLight position={[-10, -10, -10]} intensity={0.5} />
                <spotLight
                  position={[0, 10, 0]}
                  angle={0.3}
                  penumbra={1}
                  intensity={1}
                  castShadow
                />
                <Suspense fallback={null}>
                  <Room capacity={capacity} />
                  <Text
                    position={[0, 5, 0]}
                    fontSize={0.5}
                    color="#4A7C9C"
                    anchorX="center"
                    anchorY="middle"
                  >
                    {hallName}
                  </Text>
                </Suspense>
                <OrbitControls
                  enablePan={true}
                  enableZoom={true}
                  enableRotate={true}
                  minDistance={5}
                  maxDistance={20}
                />
              </Canvas>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xs text-muted-foreground text-center mt-3"
            >
              Click and drag to rotate • Scroll to zoom • Right-click to pan
            </motion.p>
          </CardContent>
        )}
      </Card>
    </motion.div>
  );
};

export default HallViewer3D;
