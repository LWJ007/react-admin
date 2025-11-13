import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import eslintPlugin from "vite-plugin-eslint";
import { createStyleImportPlugin, AntdResolve } from "vite-plugin-style-import";
import { resolve } from "path";
import Inspector from "vite-plugin-react-inspector";
function pathResolve(dir) {
  return resolve(process.cwd(), ".", dir);
}

// https://vitejs.dev/config/
export default defineConfig((config) => {
  console.log(config, "config=====");
  return {
    base: "./",
    plugins: [
      react(),
      eslintPlugin({
        cache: false,
        failOnError: false,
        include: ["src/**/*.js", "src/**/*.tsx", "src/**/*.ts"],
      }),
      createStyleImportPlugin({
        resolves: [AntdResolve()],
      }),
      config?.mode === "development" && Inspector(),
    ].filter(Boolean),
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
        },
      },
      postcss: {},
    },
    resolve: {
      alias: [
        {
          find: /@\//,
          replacement: `${pathResolve("src")}/`,
        },
      ],
    },
  };
});
