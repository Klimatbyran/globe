import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Earth } from './components/Earth';
import { ParticleSystem } from './components/ParticleSystem';
import { EmissionCircles } from './components/EmissionCircles';
import { fetchEmissionsData } from './services/api';
import { AlertTriangle, Timer, Wind, Clock, ArrowUp, Zap } from 'lucide-react';
import { ActiveCompany, Company, EmissionPeriod, EmissionsData } from './types/emissions';
import { toast, Toaster } from 'sonner';

function App() {
  const [emissionsData, setEmissionsData] = useState<EmissionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCompanies, setActiveCompanies] = useState<ActiveCompany[]>([]);
  const [currentYear, setCurrentYear] = useState(2021);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [particleCount, setParticleCount] = useState(0);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  
  // Particle system controls
  const [dispersionRate, setDispersionRate] = useState(0.02);
  const [particleLifetime, setParticleLifetime] = useState(60);
  const [riseSpeed, setRiseSpeed] = useState(1);
  const [particleSpeed, setParticleSpeed] = useState(1);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchEmissionsData(currentYear);
        setEmissionsData(data);
        animateCompanies(data.companies);
      } catch (err) {
        console.error('Error loading emissions data:', err);
        setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentYear]);

  const animateCompanies = async (companies: Company[]) => {
    setActiveCompanies([]);
    setAnimationComplete(false);

    const baseDelay = 2000;
    
    for (const company of companies) {
      const period = company.reportingPeriods[0];
      if (!period?.emissions) continue;

      const emissions = period.emissions.calculatedTotalEmissions ?? 
                       period.emissions.statedTotalEmissions?.total ?? 0;

      const adjustedDelay = baseDelay / speedMultiplier;
      
      toast(company.name, {
        description: (
          <div>
            <p>{Math.round(emissions).toLocaleString()} tons CO2</p>
            <EmissionCircles company={{ company, period, emissions }} tonsPerParticle={50000} />
          </div>
        ),
        duration: Math.min(5000, Math.max(1000, emissions / 1000000 * 1000)),
      });

      await new Promise(resolve => setTimeout(resolve, adjustedDelay));

      setActiveCompanies(prev => [...prev, {
        company,
        period,
        emissions
      }]);
    }

    setAnimationComplete(true);

    if (currentYear < 2023) {
      const yearTransitionDelay = 5000 / speedMultiplier;
      setTimeout(() => {
        setCurrentYear(prev => prev + 1);
      }, yearTransitionDelay);
    }
  };

  const getCurrentEmissions = () => {
    return activeCompanies.reduce((sum, { emissions }) => sum + emissions, 0);
  };

  if (loading) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="text-white text-2xl">Loading emissions data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="bg-red-900/50 p-6 rounded-lg max-w-md">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="text-red-500 w-6 h-6" />
            <h2 className="text-red-500 text-xl font-semibold">Error</h2>
          </div>
          <p className="text-red-400">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-black">
      <Canvas
        camera={{
          position: [0, 2, 5],
          fov: 45,
          near: 0.1,
          far: 1000
        }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        
        <Earth />
        {emissionsData && (
          <ParticleSystem 
            activeCompanies={activeCompanies}
            totalEmissions={emissionsData.totalEmissions}
            onParticleCountChange={setParticleCount}
            speedMultiplier={speedMultiplier}
            config={{
              dispersionRate,
              maxAge: particleLifetime * 1000,
              riseSpeed,
              particleSpeed
            }}
          />
        )}
        
        <OrbitControls
          enableZoom={true}
          enablePan={true}
          enableRotate={true}
          zoomSpeed={0.6}
          panSpeed={0.5}
          rotateSpeed={0.4}
        />
      </Canvas>

      {/* Stats Counter */}
      <div className="absolute bottom-4 left-4 text-white bg-black bg-opacity-50 p-4 rounded">
        <h2 className="text-xl font-bold mb-2">Year {currentYear}</h2>
        <p>Total Emissions: {Math.round(getCurrentEmissions()).toLocaleString()} tons CO2</p>
        <p>Companies Loaded: {activeCompanies.length}</p>
        <p>Active Particles: {particleCount.toLocaleString()}</p>
        {animationComplete && currentYear < 2023 && (
          <p className="mt-2 text-green-400">Loading next year in a few seconds...</p>
        )}
      </div>

      {/* Combined Controls Panel */}
      <div className="absolute right-4 top-4 text-white bg-black bg-opacity-50 p-4 rounded max-w-xs w-full space-y-6">
        <div>
          <h3 className="font-semibold mb-4 text-lg">Particle Controls</h3>
          
          <div className="space-y-4">
            {/* Animation Speed */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Timer className="w-4 h-4" />
                <label className="text-sm">Animation Speed</label>
              </div>
              <input
                type="range"
                min="0.1"
                max="10"
                step="0.1"
                value={speedMultiplier}
                onChange={(e) => setSpeedMultiplier(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between mt-1 text-xs">
                <span>0.1x</span>
                <span>{speedMultiplier.toFixed(1)}x</span>
                <span>10x</span>
              </div>
            </div>

            {/* Dispersion Rate */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Wind className="w-4 h-4" />
                <label className="text-sm">Dispersion Rate</label>
              </div>
              <input
                type="range"
                min="0.001"
                max="0.1"
                step="0.001"
                value={dispersionRate}
                onChange={(e) => setDispersionRate(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between mt-1 text-xs">
                <span>Slow</span>
                <span>{dispersionRate.toFixed(3)}</span>
                <span>Fast</span>
              </div>
            </div>

            {/* Particle Lifetime */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4" />
                <label className="text-sm">Particle Lifetime (seconds)</label>
              </div>
              <input
                type="range"
                min="10"
                max="120"
                step="1"
                value={particleLifetime}
                onChange={(e) => setParticleLifetime(parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between mt-1 text-xs">
                <span>10s</span>
                <span>{particleLifetime}s</span>
                <span>120s</span>
              </div>
            </div>

            {/* Rise Speed */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ArrowUp className="w-4 h-4" />
                <label className="text-sm">Rise Speed</label>
              </div>
              <input
                type="range"
                min="0.1"
                max="5"
                step="0.1"
                value={riseSpeed}
                onChange={(e) => setRiseSpeed(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between mt-1 text-xs">
                <span>Slow</span>
                <span>{riseSpeed.toFixed(1)}x</span>
                <span>Fast</span>
              </div>
            </div>

            {/* Particle Speed */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4" />
                <label className="text-sm">Particle Speed</label>
              </div>
              <input
                type="range"
                min="0.1"
                max="5"
                step="0.1"
                value={particleSpeed}
                onChange={(e) => setParticleSpeed(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between mt-1 text-xs">
                <span>Slow</span>
                <span>{particleSpeed.toFixed(1)}x</span>
                <span>Fast</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Toaster 
        theme="dark"
        position="bottom-left"
        closeButton
        richColors
        expand={true}
        visibleToasts={6}
        offset="24px"
      />
    </div>
  );
}

export default App;
