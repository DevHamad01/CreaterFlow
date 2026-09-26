import { createServer } from 'vite';
import React from 'react';
import { renderToString } from 'react-dom/server';
import fs from 'node:fs';

const server = await createServer({
  configFile: 'D:/nanoo/CreaterFlow/vite.config.js',
  root: 'D:/nanoo/CreaterFlow',
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
});

const { AuthProvider } = await server.ssrLoadModule('/src/lib/AuthContext.jsx');
const { MemoryRouter } = await import('react-router-dom');
const wrap = (el) =>
  React.createElement(AuthProvider, null, React.createElement(MemoryRouter, null, el));

for (const [label, path] of [
  ['Home', '/src/pages/Home.jsx'],
  ['Marketplace', '/src/pages/Marketplace.jsx'],
  ['Pricing', '/src/pages/Pricing.jsx'],
]) {
  const mod = await server.ssrLoadModule(path);
  const html = renderToString(wrap(React.createElement(mod.default)));
  fs.writeFileSync(`.agent-logs/ssr-${label}.html`, html);
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  console.log(`OK ${label} (${html.length} bytes) :: ${text.slice(0, 80)}`);
}

await server.close();
