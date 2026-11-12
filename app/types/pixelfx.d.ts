// vendor/pixelfx é JS puro (MIT) sem tipos; o app só fala com ele por components/presentation/fx/engine.ts.
declare module '@/vendor/pixelfx/*' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mod: any;
  export = mod;
}
