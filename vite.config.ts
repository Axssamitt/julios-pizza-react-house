import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import javascriptObfuscator from "javascript-obfuscator";
import { readFileSync, writeFileSync, readdirSync } from "fs";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    mode === "production" && {
      name: "vite-obfuscator-all-js",
      closeBundle: () => {
        const distDir = path.resolve(__dirname, "dist");
        const jsFiles = readdirSync(distDir).filter(f => f.endsWith(".js"));

        if (jsFiles.length === 0) {
          console.warn("⚠️ Nenhum arquivo .js encontrado para ofuscar.");
          return;
        }

        jsFiles.forEach(file => {
          const filePath = path.join(distDir, file);
          const code = readFileSync(filePath, "utf8");

          const obfuscated = javascriptObfuscator.obfuscate(code, {
            compact: true,
            controlFlowFlattening: true,
            deadCodeInjection: true,
            debugProtection: true,
            disableConsoleOutput: true,
            selfDefending: true,
          });

          writeFileSync(filePath, obfuscated.getObfuscatedCode());
          console.log(`🔒 ${file} ofuscado com sucesso.`);
        });
      },
    },
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: "./",
  build: {
    outDir: path.resolve(__dirname, "dist"),
  },
}));
