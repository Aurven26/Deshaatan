import tseslint from 'typescript-eslint';

export default tseslint.config(
  {ignores:['.next/**','.data/**','node_modules/**','src/payload-types.ts','src/migrations/**','src/app/(payload)/admin/importMap.js','design-reference.tsx']},
  ...tseslint.configs.recommended,
  {files:['src/**/*.ts','src/**/*.tsx','scripts/**/*.ts'],rules:{'@typescript-eslint/no-unused-vars':['error',{argsIgnorePattern:'^_',varsIgnorePattern:'^_',caughtErrors:'none'}],'@typescript-eslint/no-empty-object-type':'error'}},
);
