// pdf.js na mesma thread: o módulo só registra globalThis.pdfjsWorker (ver services/pdf-text.ts).
declare module 'pdfjs-dist/build/pdf.worker.mjs';
