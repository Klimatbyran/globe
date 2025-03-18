import { ActiveCompany } from './emissions';

export interface ParticleSystemConfig {
  earthRadius: number;
  minAtmosphereRadius: number;
  maxAtmosphereRadius: number;
  dispersionRate: number;
  particlesPerSecond: number;
  tonsPerParticle: number;
  maxAge: number;
  particleSize: number;
  heightVariation: number;
  baseHeight: number;
  riseSpeed?: number;
  particleSpeed?: number;
}

export interface ParticleColors {
  fresh: string;
  dispersed: string;
}

export interface ParticleData {
  positions: Float32Array;
  colors: Float32Array;
  opacities: Float32Array;
  velocities: Float32Array;
  ages: Float32Array;
  heights: Float32Array;
  count: number;
}

export interface CompanyEmissionPoint {
  startIndex: number;
  particleCount: number;
  position: { phi: number; theta: number };
  timeOffset: number;
}

export interface ParticleSystemState {
  activeParticleCount: number;
  lastUpdateTime: number;
  previousCompanies: ActiveCompany[];
}

export interface ParticleSystemProps {
  activeCompanies: ActiveCompany[];
  totalEmissions: number;
  onParticleCountChange?: (count: number) => void;
  speedMultiplier?: number;
  config?: Partial<ParticleSystemConfig>;
}