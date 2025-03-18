import { useRef, useMemo, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ActiveCompany } from '../types/emissions';
import { ParticleSystemConfig, ParticleSystemProps, ParticleData } from '../types/particles';
import { getCompanyColor } from '../utils/colorUtils';
import { RotationSystem } from '../utils/rotationUtils';
import {
  createParticleArrays,
  initializeParticlePosition,
  updateParticlePosition,
  calculateParticleHeight,
  calculateEmissionPoint
} from '../utils/particleUtils';

const DEFAULT_CONFIG: ParticleSystemConfig = {
  earthRadius: 1,
  minAtmosphereRadius: 1.01,
  maxAtmosphereRadius: 2.0,
  dispersionRate: 0.02,
  particlesPerSecond: 5000,
  tonsPerParticle: 50000,
  maxAge: 60000,
  particleSize: 0.01,
  heightVariation: 0.3,
  baseHeight: 1.2,
  riseSpeed: 1,
  particleSpeed: 1
};

export function ParticleSystem({
  activeCompanies,
  totalEmissions,
  onParticleCountChange,
  speedMultiplier = 1,
  config = {}
}: ParticleSystemProps) {
  const points = useRef<THREE.Points>(null);
  const [activeParticleCount, setActiveParticleCount] = useState(0);
  const rotationSystem = useRef(new RotationSystem());
  const startTime = useRef(performance.now());
  const lastUpdateTime = useRef(performance.now());
  const currentConfig = useMemo(() => ({
    ...DEFAULT_CONFIG,
    ...config
  }), [config]);

  const particleStatesRef = useRef<Map<number, { 
    active: boolean; 
    height: number; 
    velocity: THREE.Vector3;
    companyId: string;
    startTime: number;
    emissionPoint: THREE.Vector3;
    initialHeight: number;
    color: THREE.Color;
  }>>(new Map());
  const companyPositionsRef = useRef<Map<string, { phi: number; theta: number }>>(new Map());

  useEffect(() => {
    activeCompanies.forEach((company, index) => {
      const wikidataId = company.company.wikidataId;
      if (!companyPositionsRef.current.has(wikidataId)) {
        const goldenRatio = (1 + Math.sqrt(5)) / 2;
        const i = index + 1;
        const theta = 2 * Math.PI * i / goldenRatio;
        const phi = Math.acos(1 - 2 * (i / (activeCompanies.length + 1)));
        
        companyPositionsRef.current.set(wikidataId, { phi, theta });
      }
    });
  }, [activeCompanies]);

  const particleData = useMemo(() => {
    const data = createParticleArrays(totalEmissions, currentConfig);
    const currentTime = performance.now();

    if (points.current) {
      const currentGeometry = points.current.geometry;
      const currentPositions = currentGeometry.attributes.position.array as Float32Array;
      const currentOpacities = currentGeometry.attributes.opacity.array as Float32Array;
      const currentColors = currentGeometry.attributes.color.array as Float32Array;
      
      for (let i = 0; i < currentPositions.length / 3; i++) {
        const state = particleStatesRef.current.get(i);
        if (state?.active) {
          const idx = i * 3;
          data.positions[idx] = currentPositions[idx];
          data.positions[idx + 1] = currentPositions[idx + 1];
          data.positions[idx + 2] = currentPositions[idx + 2];
          data.colors[idx] = currentColors[idx];
          data.colors[idx + 1] = currentColors[idx + 1];
          data.colors[idx + 2] = currentColors[idx + 2];
          data.opacities[i] = currentOpacities[i];
          data.heights[i] = state.height;
        }
      }
    }

    activeCompanies.forEach((company, companyIndex) => {
      const particleCount = Math.ceil(company.emissions / currentConfig.tonsPerParticle);
      const startIndex = activeCompanies
        .slice(0, companyIndex)
        .reduce((sum, c) => sum + Math.ceil(c.emissions / currentConfig.tonsPerParticle), 0);

      const wikidataId = company.company.wikidataId;
      const position = companyPositionsRef.current.get(wikidataId);
      if (!position) return;

      const [freshColor] = getCompanyColor(wikidataId);
      const color = new THREE.Color(freshColor);

      for (let i = 0; i < particleCount; i++) {
        const index = startIndex + i;
        if (particleStatesRef.current.get(index)?.active) continue;

        const height = calculateParticleHeight(
          currentConfig.baseHeight,
          companyIndex * 100,
          currentTime - startTime.current,
          currentConfig.heightVariation
        );

        const [x, y, z] = initializeParticlePosition(
          position.phi,
          position.theta,
          0.2,
          currentConfig.earthRadius,
          height
        );

        const emissionPoint = new THREE.Vector3(x, y, z)
          .normalize()
          .multiplyScalar(currentConfig.earthRadius);

        const idx = index * 3;
        data.positions[idx] = emissionPoint.x;
        data.positions[idx + 1] = emissionPoint.y;
        data.positions[idx + 2] = emissionPoint.z;

        data.colors[idx] = color.r;
        data.colors[idx + 1] = color.g;
        data.colors[idx + 2] = color.b;

        particleStatesRef.current.set(index, {
          active: false,
          height,
          initialHeight: height,
          companyId: wikidataId,
          startTime: currentTime,
          emissionPoint: emissionPoint.clone(),
          color: color.clone(),
          velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 0.0002 * (currentConfig.particleSpeed || 1),
            (Math.random() - 0.5) * 0.0002 * (currentConfig.particleSpeed || 1),
            (Math.random() - 0.5) * 0.0002 * (currentConfig.particleSpeed || 1)
          )
        });
      }
    });

    return data;
  }, [activeCompanies, totalEmissions, currentConfig]);

  useEffect(() => {
    if (!points.current) return;
    
    const geometry = points.current.geometry;
    geometry.setAttribute('position', new THREE.BufferAttribute(particleData.positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(particleData.colors, 3));
    geometry.setAttribute('opacity', new THREE.BufferAttribute(particleData.opacities, 1));
    
    setActiveParticleCount(particleStatesRef.current.size);
    lastUpdateTime.current = performance.now();
  }, [particleData]);

  useFrame((_, delta) => {
    if (!points.current) return;

    const currentTime = performance.now();
    const { earthRotation } = rotationSystem.current.update(delta);
    
    const geometry = points.current.geometry;
    const positions = geometry.attributes.position.array as Float32Array;
    const colors = geometry.attributes.color.array as Float32Array;
    const opacities = geometry.attributes.opacity.array as Float32Array;

    const particlesToActivate = Math.floor(currentConfig.particlesPerSecond * delta * speedMultiplier);
    let newActiveCount = 0;

    particleStatesRef.current.forEach((state, index) => {
      if (!state.active && newActiveCount < particlesToActivate) {
        state.active = true;
        state.startTime = currentTime;
        opacities[index] = 0.8;
        newActiveCount++;
      }
    });

    if (newActiveCount > 0) {
      geometry.attributes.opacity.needsUpdate = true;
      setActiveParticleCount(prev => prev + newActiveCount);
      onParticleCountChange?.(activeParticleCount + newActiveCount);
    }

    particleStatesRef.current.forEach((state, i) => {
      if (!state.active || !state.emissionPoint) return;

      const idx = i * 3;
      if (isNaN(positions[idx])) return;

      const particleAge = (currentTime - state.startTime) / 1000;
      const ageRatio = Math.min(particleAge / (currentConfig.maxAge / 1000), 1);

      const currentPos = new THREE.Vector3(
        positions[idx],
        positions[idx + 1],
        positions[idx + 2]
      );

      const currentHeight = currentPos.length();
      const heightRatio = Math.min(
        (currentHeight - currentConfig.earthRadius) / 
        (state.initialHeight - currentConfig.earthRadius),
        1
      );

      const rotatedEmissionPoint = state.emissionPoint.clone()
        .applyMatrix4(rotationSystem.current.getRotationMatrix(earthRotation));

      const [newX, newY, newZ] = updateParticlePosition(
        currentPos.x,
        currentPos.y,
        currentPos.z,
        ageRatio,
        state.height * (currentConfig.riseSpeed || 1),
        currentConfig,
        state.velocity,
        rotatedEmissionPoint
      );

      const finalRotation = rotationSystem.current.interpolateRotation(heightRatio);
      const rotatedPosition = new THREE.Vector3(newX, newY, newZ)
        .applyMatrix4(rotationSystem.current.getRotationMatrix(finalRotation));

      positions[idx] = rotatedPosition.x;
      positions[idx + 1] = rotatedPosition.y;
      positions[idx + 2] = rotatedPosition.z;

      colors[idx] = state.color.r;
      colors[idx + 1] = state.color.g;
      colors[idx + 2] = state.color.b;
    });

    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.color.needsUpdate = true;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleData.count}
          array={particleData.positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={particleData.count}
          array={particleData.colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-opacity"
          count={particleData.count}
          array={particleData.opacities}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={currentConfig.particleSize}
        transparent
        vertexColors
        blending={THREE.AdditiveBlending}
        vertexOpacity={true}
      />
    </points>
  );
}