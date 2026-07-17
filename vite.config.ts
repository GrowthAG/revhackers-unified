import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const offlineMode = mode === "offline";
  const offlineEnvDir = process.env.REVHACKERS_OFFLINE_ENV_DIR;
  const offlineOutDir = process.env.REVHACKERS_OFFLINE_OUT_DIR;

  if (offlineMode && (!offlineEnvDir || !offlineOutDir)) {
    throw new Error("Offline mode must be launched through scripts/build-offline.mjs");
  }

  return {
    base: "/",
    ...(offlineMode ? { envDir: offlineEnvDir } : {}),
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      ...(offlineMode ? { outDir: offlineOutDir, emptyOutDir: true } : {}),
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-supabase': ['@supabase/supabase-js'],
            'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-popover', '@radix-ui/react-tabs', '@radix-ui/react-tooltip', '@radix-ui/react-select', '@radix-ui/react-dropdown-menu', '@radix-ui/react-accordion'],
            'vendor-charts': ['recharts', 'd3'],
            'vendor-editor': ['@tiptap/react', '@tiptap/starter-kit', '@tiptap/extension-placeholder', '@tiptap/extension-task-item', '@tiptap/extension-task-list', '@tiptap/suggestion'],
            'vendor-mermaid': ['mermaid'],
            'vendor-motion': ['framer-motion'],
          },
        },
      },
    },
  };
});
