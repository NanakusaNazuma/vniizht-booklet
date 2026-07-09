import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// host: true — чтобы dev-сервер был доступен по IP в локальной сети
// (нужно, чтобы отсканированный с телефона QR-код открывал сайт).
export default defineConfig({
    plugins: [react()],
    server: {
        host: true,
        port: 5173,
    },
});
