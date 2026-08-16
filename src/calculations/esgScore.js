/**
 * Calculates a 0-100 ESG Health Score based on configured weights.
 * 
 * Weights:
 * Environmental Performance: 40%
 * Resource Efficiency: 30%
 * Social/Workforce: 20%
 * Data Completeness: 10%
 */
export const calculateESGScore = (data) => {
  if (!data || Object.keys(data).length === 0) return null;

  let score = 0;
  const maxScore = 100;
  
  // 1. Environmental Performance (Max 40 points)
  // Heavily weighted by renewable energy adoption
  const renewable = data.renewablePercent || 0;
  const envScore = Math.min(40, (renewable / 100) * 40);
  score += envScore;

  // 2. Resource Efficiency (Max 30 points)
  // Based on Water Recycling and Waste Recycling
  const waterRecycled = data.waterRecycledPercent || 0;
  const wasteRecycled = data.wasteRecycledPercent || 0;
  const resScore = Math.min(30, ((waterRecycled + wasteRecycled) / 200) * 30);
  score += resScore;

  // 3. Social/Workforce (Max 20 points)
  // Based on diversity (e.g. female representation)
  const totalEmployees = data.employees || 0;
  const femaleEmployees = data.femaleEmployees || 0;
  let socialScore = 0;
  if (totalEmployees > 0) {
    const diversityRatio = femaleEmployees / totalEmployees;
    // Assume 50% is perfect score (20 points)
    socialScore = Math.min(20, (diversityRatio / 0.5) * 20);
  }
  score += socialScore;

  // 4. Data Completeness (Max 10 points)
  // Simple check of required fields
  const requiredFields = [
    'totalElectricity_kwh', 'renewablePercent', 'fuelDiesel_litres',
    'waterWithdrawal_m3', 'waterRecycledPercent', 'totalWaste_tonnes',
    'wasteRecycledPercent', 'employees', 'femaleEmployees'
  ];
  let filledFields = 0;
  requiredFields.forEach(field => {
    if (data[field] !== undefined && data[field] !== null && data[field] !== '') {
      filledFields++;
    }
  });
  const dataScore = (filledFields / requiredFields.length) * 10;
  score += dataScore;

  return {
    total: Math.round(score),
    breakdown: {
      environmental: Math.round(envScore),
      resource: Math.round(resScore),
      social: Math.round(socialScore),
      data: Math.round(dataScore)
    },
    completeness: Math.round((filledFields / requiredFields.length) * 100)
  };
};
