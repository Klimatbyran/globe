import * as THREE from 'three';
import { ParticleSystemConfig, ParticleData } from '../types/particles';

export function createParticleArrays(totalEmissions: number, config: ParticleSystemConfig): ParticleData {
  const totalParticles = Math.ceil(totalEmissions / config.tonsPerParticle);
  const positions = new Float32Array(totalParticles * 3);
  const colors = new Float32Array(totalParticles * 3);
  const opacities = new Float32Array(totalParticles);
  const velocities = new Float32Array(totalParticles * 3);
  const ages = new Float32Array(totalParticles);
  const heights = new Float32Array(totalParticles);

  for (let i = 0; i < totalParticles; i++) {
    const idx = i * 3;
    positions[idx] = 0;
    positions[idx + 1] = 0;
    positions[idx + 2] = 0;
    
    // Base velocity is now controlled by particle speed
    const baseVelocity = 0.01 * (config.particleSpeed || 1);
    velocities[idx] = (Math.random() - 0.5) * baseVelocity;
    velocities[idx + 1] = (Math.random() - 0.5) * baseVelocity;
    velocities[idx + 2] = (Math.random() - 0.5) * baseVelocity;
    
    colors[idx] = 1;
    colors[idx + 1] = 1;
    colors[idx + 2] = 1;
    
    heights[i] = config.earthRadius;
  }
  
  return {
    positions,
    colors,
    opacities,
    velocities,
    ages,
    heights,
    count: totalParticles
  };
}

export function calculateEmissionPoint(phi: number, theta: number, radius: number): THREE.Vector3 {
  const x = radius * Math.sin(phi) * Math.cos(theta);
  const y = radius * Math.sin(phi) * Math.sin(theta);
  const z = radius * Math.cos(phi);
  
  return new THREE.Vector3(x, y, z);
}

export function calculateParticleHeight(
  baseHeight: number,
  timeOffset: number,
  currentTime: number,
  heightVariation: number
): number {
  const timeFactor = Math.max(0, (currentTime - timeOffset) / 1000);
  const variation = Math.sin(timeFactor * 0.5) * heightVariation;
  return baseHeight + variation;
}

export function initializeParticlePosition(
  phi: number,
  theta: number,
  spreadAngle: number,
  radius: number,
  height: number
): [number, number, number] {
  // Add randomization to both angles for better spread
  const randomPhi = phi + (Math.random() - 0.5) * spreadAngle;
  const randomTheta = theta + (Math.random() - 0.5) * spreadAngle;
  
  // Convert to Cartesian coordinates using spherical coordinates
  const x = radius * Math.sin(randomPhi) * Math.cos(randomTheta);
  const y = radius * Math.sin(randomPhi) * Math.sin(randomTheta);
  const z = radius * Math.cos(randomPhi);
  
  // Add some random variation to the position
  const variation = 0.1;
  const position = new THREE.Vector3(x, y, z)
    .add(new THREE.Vector3(
      (Math.random() - 0.5) * variation,
      (Math.random() - 0.5) * variation,
      (Math.random() - 0.5) * variation
    ));
  
  // Normalize and scale to the desired height
  position.normalize().multiplyScalar(height);
  
  return [position.x, position.y, position.z];
}

export function updateParticlePosition(
  x: number,
  y: number,
  z: number,
  ageRatio: number,
  height: number,
  config: ParticleSystemConfig,
  velocity: THREE.Vector3,
  emissionPoint: THREE.Vector3
): [number, number, number] {
  const currentPos = new THREE.Vector3(x, y, z);
  
  if (currentPos.length() === 0) {
    return [emissionPoint.x, emissionPoint.y, emissionPoint.z];
  }
  
  const directionFromCenter = currentPos.clone().normalize();
  const particleSpeed = config.particleSpeed || 1;
  
  // Scale random movements based on particle speed
  // Lower speed = less random movement
  const randomScale = Math.pow(particleSpeed, 2) * 0.005;
  const randomStrength = randomScale * (1 - ageRatio * 0.5);
  const randomMovement = new THREE.Vector3(
    (Math.random() - 0.5) * randomStrength,
    (Math.random() - 0.5) * randomStrength,
    (Math.random() - 0.5) * randomStrength
  );

  // Brownian motion also scales with particle speed
  const brownianScale = Math.pow(particleSpeed, 2) * 0.002;
  const brownianMotion = new THREE.Vector3(
    (Math.random() - 0.5) * brownianScale,
    (Math.random() - 0.5) * brownianScale,
    (Math.random() - 0.5) * brownianScale
  );
  
  // Height variation scales with particle speed
  const heightVariation = (Math.random() - 0.5) * 0.1 * particleSpeed;
  const targetRadius = config.earthRadius + 
    (height - config.earthRadius) + 
    heightVariation;
  
  // Update velocity with reduced randomness at lower speeds
  velocity.add(randomMovement.multiplyScalar(particleSpeed));
  velocity.add(brownianMotion.multiplyScalar(particleSpeed));
  
  // Stronger damping at lower speeds for more controlled movement
  const currentRadius = currentPos.length();
  const radiusDiff = Math.abs(currentRadius - targetRadius);
  const dampingFactor = 0.98 - (radiusDiff * 0.005 * particleSpeed);
  velocity.multiplyScalar(dampingFactor);
  
  // Minimal outward force that scales with speed
  const expansionForce = directionFromCenter.clone().multiplyScalar(0.0005 * particleSpeed);
  velocity.add(expansionForce);
  
  // Radial movement controlled by dispersion rate and particle speed
  const radialMovement = (targetRadius - currentRadius) * config.dispersionRate * particleSpeed;
  const radialDirection = directionFromCenter.multiplyScalar(radialMovement);
  
  // Combine all movements
  const newPos = currentPos.clone()
    .add(radialDirection)
    .add(velocity)
    .add(randomMovement)
    .add(brownianMotion);
  
  // Ensure particles stay within atmosphere bounds
  const newRadius = newPos.length();
  if (newRadius < config.earthRadius || newRadius > config.maxAtmosphereRadius) {
    newPos.normalize().multiplyScalar(
      THREE.MathUtils.clamp(
        newRadius,
        config.earthRadius,
        config.maxAtmosphereRadius
      )
    );
  }
  
  if (isNaN(newPos.x) || isNaN(newPos.y) || isNaN(newPos.z)) {
    return [emissionPoint.x, emissionPoint.y, emissionPoint.z];
  }
  
  return [newPos.x, newPos.y, newPos.z];
}