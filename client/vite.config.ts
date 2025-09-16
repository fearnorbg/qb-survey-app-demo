import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import {appRuntimeConfig} from "../shared/appRuntimeConfig.ts";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        host: appRuntimeConfig.clientHost,
        port: appRuntimeConfig.clientPort,
    }
})
