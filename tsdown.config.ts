import { defineConfig } from "tsdown";

export default defineConfig({
  entry: [
    'src/contact.ts',
    'src/cors.ts',
    'src/email.ts',
    'src/handler.ts',
    'src/types.ts',
    'src/validation.ts',
  ],
  format: 'esm',
  dts: true,
  sourcemap: true,
  clean: true,
  unbundle: true,
});
