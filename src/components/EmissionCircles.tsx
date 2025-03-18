import React from 'react';
import { ActiveCompany } from '../types/emissions';
import { getCompanyColor } from '../utils/colorUtils';

interface EmissionCirclesProps {
  company: ActiveCompany;
  tonsPerParticle: number;
}

export function EmissionCircles({ company, tonsPerParticle }: EmissionCirclesProps) {
  const circleCount = Math.ceil(company.emissions / tonsPerParticle);
  const circles = Array.from({ length: circleCount }, (_, i) => i);
  const [freshColor] = getCompanyColor(company.company.wikidataId);
  
  return (
    <div className="mt-2">
      <div className="flex flex-wrap gap-1 max-w-[300px]">
        {circles.map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: freshColor }}
            title={`${tonsPerParticle.toLocaleString()} tons CO2`}
          />
        ))}
      </div>
      <p className="text-xs mt-1 text-gray-400">
        Each circle represents {tonsPerParticle.toLocaleString()} tons of CO2
      </p>
    </div>
  );
}