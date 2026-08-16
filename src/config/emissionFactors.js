// Source: Central Electricity Authority (CEA) India & typical MVP averages

export const INDIA_EMISSION_FACTORS = {
  // Grid electricity (tCO2e per kWh)
  // Baseline CO2 emission factor for Indian grid is ~0.71 tCO2/MWh -> 0.00071 tCO2/kWh
  gridElectricity: 0.00071,
  
  // Renewable electricity (tCO2e per kWh)
  renewableElectricity: 0,
  
  // Diesel (tCO2e per litre)
  diesel: 0.00268,
  
  // Petrol (tCO2e per litre)
  petrol: 0.00231,
  
  // Natural Gas (tCO2e per cubic meter)
  naturalGas: 0.00202,
  
  // Water consumption (tCO2e per cubic meter - proxy for processing/pumping)
  waterSupply: 0.00034,
  
  // General waste to landfill (tCO2e per tonne)
  wasteLandfill: 0.45,
  
  // Recycled waste (tCO2e per tonne - mostly transport/processing, much lower)
  wasteRecycled: 0.02,
};

export const DEFAULT_CARBON_PRICE_INR = 2500; // ₹ per tCO2e (Scenario Carbon Tax)
