import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dotenv from "dotenv";
dotenv.config({path:"../../.env"});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define:{
    "import.meta.env.DEPLOYED_SEPOLIA_CONTRACT_HIGHSCORE":`"${process.env.DEPLOYED_SEPOLIA_CONTRACT_HIGHSCORE||''}"`,
    "import.meta.env.API_URL":`"${process.env.API_URL||''}"`,
    "import.meta.env.THE_GRAPH_URL":`"${process.env.THE_GRAPH_URL||''}"`,
    "import.meta.env.PROD":`"${process.env.PROD||''}"`
  }
})
