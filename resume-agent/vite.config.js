import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// During local `vite dev`, proxy /api/* to `vercel dev` (port 3000) so the
// serverless functions in ./api are reachable. Run `vercel dev` in parallel,
// or deploy to Vercel where /api is served automatically.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})
