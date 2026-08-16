export const DEMO_DATASET = {
  companyInfo: {
    name: "Demo Manufacturing Ltd.",
    industry: "Heavy Manufacturing",
    employees: 1250,
    femaleEmployees: 340,
    reportingYear: "2025-26",
  },
  energy: {
    totalElectricity_kwh: 5000000,
    renewablePercent: 32, // 32%
    fuelDiesel_litres: 120000,
  },
  water: {
    waterWithdrawal_m3: 45000,
    waterRecycledPercent: 15,
  },
  waste: {
    totalWaste_tonnes: 850,
    wasteRecycledPercent: 40,
    hazardousWaste_tonnes: 120,
  },
  targets: {
    renewableTarget2030: 80, // %
    netZeroTarget: 2040,
  },
  // We include a "claim" that will trip the greenwashing detector for the WOW moment.
  publishedClaims: {
    renewableEnergy: 100, // Claiming 100% renewable, but actually 32%
  }
};
