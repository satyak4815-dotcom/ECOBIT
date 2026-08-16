import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { calculateEmissions } from '../calculations/emissions';
import { calculateESGScore } from '../calculations/esgScore';
import { DEMO_DATASET } from '../config/demoData';

export const useESGStore = create(
  persist(
    (set, get) => ({
      isDemoMode: false,
      
      // Raw input data from Data Center (or loaded from Demo)
      rawData: {},
      
      // Calculated outputs
      metrics: {
        emissions: null,
        score: null,
      },
      
      // Scenarios for the What-If Simulator
      scenarios: {
        baseline: null, // Snapshotted from current rawData
        scenarioA: null, // Interactive scenario
      },

      // Generated Reports Library
      reports: [],

      // Actions
      loadDemoData: () => {
        const raw = { 
          ...DEMO_DATASET.energy,
          ...DEMO_DATASET.water,
          ...DEMO_DATASET.waste,
          ...DEMO_DATASET.companyInfo 
        };
        
        const emissions = calculateEmissions(raw);
        const score = calculateESGScore(raw);
        
        set({
          isDemoMode: true,
          rawData: raw,
          metrics: { emissions, score },
          scenarios: {
            baseline: { raw, emissions, score },
            scenarioA: { raw, emissions, score },
          }
        });
      },
      
      clearData: () => {
        set({
          isDemoMode: false,
          rawData: {},
          metrics: { emissions: null, score: null },
          scenarios: { baseline: null, scenarioA: null },
          reports: []
        });
      },
      
      updateRawData: (newData) => {
        const state = get();
        const updatedRaw = { ...state.rawData, ...newData };
        const emissions = calculateEmissions(updatedRaw);
        const score = calculateESGScore(updatedRaw);
        
        set({
          isDemoMode: false,
          rawData: updatedRaw,
          metrics: { emissions, score },
          scenarios: {
            baseline: { raw: updatedRaw, emissions, score },
            scenarioA: { raw: updatedRaw, emissions, score },
          }
        });
      },

      // For Simulator
      updateScenarioA: (overrides) => {
        const state = get();
        if (!state.scenarios.baseline) return;

        const newRaw = { ...state.scenarios.baseline.raw, ...overrides };
        const newEmissions = calculateEmissions(newRaw);
        const newScore = calculateESGScore(newRaw);

        set({
          scenarios: {
            ...state.scenarios,
            scenarioA: { raw: newRaw, emissions: newEmissions, score: newScore }
          }
        });
      },

      // For Reports Hub
      addReport: (report) => {
        const state = get();
        
        // Handle Versioning: find how many reports of this type exist for this company/period
        const existingVersions = state.reports.filter(
          r => r.type === report.type && r.company === report.company && r.period === report.period
        );
        
        const newReport = {
          ...report,
          id: Date.now().toString(),
          version: `v${existingVersions.length + 1}`,
          createdAt: new Date().toISOString()
        };

        set({
          reports: [newReport, ...state.reports]
        });
      },

      deleteReport: (id) => {
        set((state) => ({
          reports: state.reports.filter(r => r.id !== id)
        }));
      }
    }),
    {
      name: 'ecobit-esg-storage', // key in localStorage
    }
  )
);
