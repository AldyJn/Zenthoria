import { defineConfig } from 'vite'
import laravel from 'laravel-vite-plugin'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/css/app.css',
                'resources/js/app.js'
            ],
            refresh: true,
        }),
        vue({
            template: {
                transformAssetUrls: {
                    base: null,
                    includeAbsolute: false,
                },
            },
        }),
        vuetify({
            autoImport: true,
            theme: {
                defaultTheme: 'light'
            }
        }),
    ],
    define: {
        global: 'globalThis',
    },
    resolve: {
        alias: {
            '@': '/resources/js',
        },
    },
    optimizeDeps: {
        include: ['vuetify'],
        exclude: ['@mdi/font']
    },
    build: {
        rollupOptions: {
            external: ['@mdi/font']
        }
    }
})