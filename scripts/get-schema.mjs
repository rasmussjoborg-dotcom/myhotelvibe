import fs from 'fs';

const REPLICATE_API_TOKEN = process.env.VITE_REPLICATE_API_TOKEN || process.env.REPLICATE_API_TOKEN;

async function getModelSchema() {
  const res = await fetch('https://api.replicate.com/v1/models/deforum/deforum_stable_diffusion/versions', {
    headers: {
      'Authorization': `Bearer ${REPLICATE_API_TOKEN}`
    }
  });
  const data = await res.json();
  const latest = data.results[0];
  console.log(JSON.stringify(latest.openapi_schema.components.schemas.Input, null, 2));
}

getModelSchema().catch(console.error);
