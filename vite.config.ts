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
      name: "vite-obfuscator",
      closeBundle: () => {
        const distDir = path.resolve(__dirname, "dist");
        const files = readdirSync(distDir);

        // Procura automaticamente o arquivo JS gerado
        const targetFile = files.find((f) =>
          f.endsWith(".js") && f.startsWith("index")
        );

        if (!targetFile) {
          console.warn("⚠️ Nenhum arquivo index*.js encontrado para ofuscar.");
          return;
        }

        const filePath = path.join(distDir, targetFile);
        const code = readFileSync(filePath, "utf8");

        const obfuscated = javascriptObfuscator.obfuscate(code, {
          compact: true,
          controlFlowFlattening: true,
          deadCodeInjection: true,
          debugProtection: true,
          disableConsoleOutput: true,
          selfDefending: true,
        });

        const outputFile = path.join(distDir, "index-protegido.js");
        writeFileSync(outputFile, obfuscated.getObfuscatedCode());

        console.log(`✅ Código ofuscado salvo em: ${outputFile}`);
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
