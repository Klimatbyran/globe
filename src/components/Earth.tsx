import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';

export function Earth() {
  const earthRef = useRef<THREE.Mesh>(null);
  
  const textureLoader = new THREE.TextureLoader();
  const textures = {
    map: textureLoader.load(
      'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?q=80&w=2000&auto=format&fit=crop'
    ),
    normalMap: textureLoader.load(
      'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?q=80&w=2000&auto=format&fit=crop'
    )
  };

  useFrame((_, delta) => {
    if (earthRef.current) {
      // Rotate at a constant speed - one full rotation takes about 60 seconds
      earthRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <Sphere ref={earthRef} args={[1, 64, 64]}>
      <meshStandardMaterial
        map={textures.map}
        normalMap={textures.normalMap}
        roughness={1}
      />
    </Sphere>
  );
}