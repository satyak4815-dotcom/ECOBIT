import { DEFAULT_CARBON_PRICE_INR } from '../config/emissionFactors';

/**
 * Calculates ROI and Financial Impact of a Scenario vs Baseline
 */
export const calculateFinancialImpact = (baselineMetrics, scenarioMetrics, customCarbonPrice) => {
  if (!baselineMetrics || !scenarioMetrics) return null;

  const carbonPrice = customCarbonPrice || DEFAULT_CARBON_PRICE_INR;
  
  // 1. Carbon Reduction
  const baselineTotal = baselineMetrics.totalEmissions || 0;
  const scenarioTotal = scenarioMetrics.totalEmissions || 0;
  const carbonReduction = Math.max(0, baselineTotal - scenarioTotal);
  
  // 2. Financial Benefit (Avoided Carbon Cost)
  // Simple proxy for MVP: tCO2e reduced * Carbon Price
  const annualAvoidedCarbonCost = carbonReduction * carbonPrice;
  
  // Example specific investments (MVP simplified assumptions):
  // Renewable Energy: ₹40,000 per kW installed. Assuming 1 kW saves ~1.5 tCO2e/year
  // We estimate investment based on the carbon reduction directly for the MVP
  const estimatedInvestment = carbonReduction > 0 ? (carbonReduction / 1.5) * 40000 : 0;
  
  // ROI = (Annual Benefit / Investment) * 100
  let roi = 0;
  let paybackYears = 0;
  
  if (estimatedInvestment > 0) {
    roi = (annualAvoidedCarbonCost / estimatedInvestment) * 100;
    paybackYears = estimatedInvestment / annualAvoidedCarbonCost;
  }

  return {
    carbonReduction: Number(carbonReduction.toFixed(2)),
    annualSavings: Number(annualAvoidedCarbonCost.toFixed(0)),
    estimatedInvestment: Number(estimatedInvestment.toFixed(0)),
    roi: Number(roi.toFixed(1)),
    paybackYears: Number(paybackYears.toFixed(1))
  };
};

export const formatCurrency = (value) => {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)} Cr`;
  }
  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(2)} L`;
  }
  return `₹${value.toLocaleString()}`;
};
