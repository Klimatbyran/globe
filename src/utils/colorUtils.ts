import chroma from 'chroma-js';

const COMPANY_COLORS = {
  primary: ['#FDC381', '#F6993A', '#C26B0B', '#7D4100', '#6B3700'], // Orange
  secondary: ['#A7D5FD', '#69ACE9', '#2E729E', '#16415D', '#13364E'], // Blue
  tertiary: ['#DEFD86', '#BCF51D', '#7CA605', '#495D12', '#3D4B16'], // Green
  quaternary: ['#F0ADC1', '#F080A1', '#AD516C', '#7C2E45', '#73263D'], // Pink
};

// Create a color scale for each color family
const colorScales = Object.values(COMPANY_COLORS).map(colors => 
  chroma.scale(colors).mode('lch')
);

export function getCompanyColor(wikidataId: string): [string, string] {
  // Use the wikidataId to deterministically select a color scale
  const hash = wikidataId.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  const scaleIndex = Math.abs(hash) % colorScales.length;
  const colorScale = colorScales[scaleIndex];
  
  // Return the same color for both states to maintain consistency
  const color = colorScale(0.2).hex();
  return [color, color];
}