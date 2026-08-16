import { INDIA_EMISSION_FACTORS } from '../config/emissionFactors';

/**
 * Calculates Scope 1, Scope 2, and combined emissions based on raw inputs.
 * Returns results in tCO2e (tonnes of CO2 equivalent).
 */
export const calculateEmissions = (data) => {
  if (!data) return null;
  
  // Destructure with defaults to avoid NaN
  const {
    totalElectricity_kwh = 0,
    renewablePercent = 0,
    fuelDiesel_litres = 0,
  } = data;

  // ----------------------------------------
  // SCOPE 1
  // ----------------------------------------
  // Fuel consumed * Emission Factor
  const scope1 = fuelDiesel_litres * INDIA_EMISSION_FACTORS.diesel;

  // ----------------------------------------
  // SCOPE 2
  // ----------------------------------------
  // Grid electricity = Total - (Total * renewable%)
  const gridElectricity = totalElectricity_kwh * (1 - renewablePercent / 100);
  const renewableElectricity = totalElectricity_kwh * (renewablePercent / 100);

  const scope2 = 
    (gridElectricity * INDIA_EMISSION_FACTORS.gridElectricity) +
    (renewableElectricity * INDIA_EMISSION_FACTORS.renewableElectricity);

  // ----------------------------------------
  // TOTAL EMISSIONS
  // ----------------------------------------
  const totalEmissions = scope1 + scope2;

  return {
    scope1: Number(scope1.toFixed(2)),
    scope2: Number(scope2.toFixed(2)),
    totalEmissions: Number(totalEmissions.toFixed(2)),
    gridElectricity,
    renewableElectricity
  };
};
