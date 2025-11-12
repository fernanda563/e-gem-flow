import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls, Center } from "@react-three/drei";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";

interface STLViewerProps {
  fileUrl: string;
  height?: string;
  width?: string;
}

function STLModel({ url }: { url: string }) {
  const geometry = useLoader(STLLoader, url);

  return (
    <Center>
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial
          color="hsl(var(--accent))"
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>
    </Center>
  );
}

function LoadingFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="bg-background/80 backdrop-blur-sm px-4 py-2 rounded-md flex items-center gap-2 border border-border">
        <Loader2 className="h-4 w-4 animate-spin text-accent" />
        <span className="text-sm text-muted-foreground">Cargando modelo 3D...</span>
      </div>
    </div>
  );
}

export function STLViewer({ 
  fileUrl, 
  height = "400px", 
  width = "100%"
}: STLViewerProps) {
  return (
    <div 
      style={{ height, width }} 
      className="relative rounded-lg overflow-hidden border border-border bg-muted"
    >
      <Canvas
        camera={{ position: [0, 0, 150], fov: 50 }}
        shadows
      >
        <ambientLight intensity={0.5} />
        <directionalLight 
          position={[10, 10, 5]} 
          intensity={1}
          castShadow
        />
        <directionalLight 
          position={[-10, -10, -5]} 
          intensity={0.3}
        />
        <Suspense fallback={null}>
          <STLModel url={fileUrl} />
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={20}
            maxDistance={500}
          />
        </Suspense>
      </Canvas>
      
      <LoadingFallback />
      
      <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-md text-xs text-muted-foreground border border-border pointer-events-none">
        Arrastra para rotar • Scroll para zoom
      </div>
    </div>
  );
}
