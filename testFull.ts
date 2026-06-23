import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// Mock import.meta.env for Node.js
(global as any).import = {
  meta: {
    env: {
      VITE_RAPIDAPI_KEY: process.env.VITE_RAPIDAPI_KEY,
      VITE_GEMINI_API_KEY: process.env.VITE_GEMINI_API_KEY
    }
  }
};

import { runLiveSearch } from './src/lib/liveSearch.js';
import { Preferences } from './src/types.js';

async function testPipeline() {
  const prefs: Preferences = {
    amenities: [],
    settings: [],
    travelers: 'Couple',
    mood: 'City energy',
    scene: 'Concrete jungle',
    timeline: 'Literally ASAP'
  };
  
  console.log("Running pipeline for:", prefs);
  try {
    const stays = await runLiveSearch(prefs);
    console.log("Returned Stays:", stays.length);
    if (stays.length > 0) {
      console.log(stays[0]);
    }
  } catch (e) {
    console.error("Pipeline failed!", e);
  }
}

testPipeline();
