import * as THREE from 'three';

// Adjusted rotation speed for better visualization
// One full rotation takes about 60 seconds
export const EARTH_ROTATION_SPEED = 0.0001;

// Atmosphere follows Earth very closely
export const ATMOSPHERE_FACTOR = 0.99;

export class RotationSystem {
  private earthAngle: number = 0;
  private atmosphereAngle: number = 0;
  private lastUpdateTime: number = performance.now();

  update(deltaTime: number): { earthRotation: number; atmosphereRotation: number } {
    const currentTime = performance.now();
    
    // Apply rotation with delta time
    const rotationDelta = EARTH_ROTATION_SPEED * deltaTime;
    
    // Update Earth rotation
    this.earthAngle = (this.earthAngle + rotationDelta) % (Math.PI * 2);
    
    // Keep atmosphere closely synchronized with Earth
    this.atmosphereAngle = (this.atmosphereAngle + rotationDelta * ATMOSPHERE_FACTOR) % (Math.PI * 2);
    
    this.lastUpdateTime = currentTime;

    return {
      earthRotation: this.earthAngle,
      atmosphereRotation: this.atmosphereAngle
    };
  }

  getRotationMatrix(angle: number): THREE.Matrix4 {
    return new THREE.Matrix4().makeRotationY(angle);
  }

  interpolateRotation(heightRatio: number): number {
    // Very subtle difference between Earth and atmosphere rotation
    const interpolationFactor = Math.min(heightRatio * 0.01, 0.01);
    const interpolatedAngle = this.earthAngle * (1 - interpolationFactor) + 
                            this.atmosphereAngle * interpolationFactor;
    
    return interpolatedAngle % (Math.PI * 2);
  }
}