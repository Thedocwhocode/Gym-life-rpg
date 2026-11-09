module.exports = {
  extends: ['expo', 'prettier', 'plugin:@typescript-eslint/recommended-type-checked'],
  plugins: ['prettier', 'eslint-plugin-react-compiler', 'unused-imports', '@typescript-eslint'],
  rules: {
    'prettier/prettier': 'error',
    'import/no-unresolved': 'off',
    'react-compiler/react-compiler': 'error',
    'unused-imports/no-unused-imports': 'error',
    'no-redeclare': 'off',
    '@typescript-eslint/no-redeclare': 'off',
    '@typescript-eslint/unbound-method': 'off',
    '@typescript-eslint/require-await': 'off',
    '@typescript-eslint/no-unnecessary-type-assertion': 'error',
    'no-empty-pattern': 'off',
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: 'react-redux',
            importNames: ['useSelector'],
            message: 'Use useAppSelector from @/store',
          },
          {
            name: '@material-symbols-react-native/outlined-400',
            message: 'This import does not work on android -- too big. We need to use the individual imports',
          },
          {
            name: 'react-native-paper',
            importNames: ['IconButton', 'TouchableRipple', 'Button'],
            message: 'Use our wrappers in @/components/presentation/gesture-wrappers/ - they are more reliable as they use GestureHandler',
          },
        ],
      },
    ],
  },
  overrides: [
    {
      // Regras puras recebem `today: LocalDate`; relógio e UTC aqui erram a semana (R2).
      files: ['store/**/derive*.ts', 'store/journey/rules/**/*.ts'],
      rules: {
        'no-restricted-syntax': [
          'error',
          {
            selector: 'NewExpression[callee.name="Date"]',
            message: 'Sem new Date() em regra pura: receba today: LocalDate.',
          },
          {
            selector: 'CallExpression[callee.property.name="toISOString"]',
            message: 'Sem toISOString(): é UTC. Use LocalDate (js-joda).',
          },
        ],
      },
    },
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    projectService: true,
    tsconfigRootDir: __dirname,
  },
};
