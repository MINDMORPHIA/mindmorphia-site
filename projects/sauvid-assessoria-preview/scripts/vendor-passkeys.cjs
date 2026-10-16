// Distribuição oficial MIT, servida pela própria SAUVID, sem CDN ou código alterado.
const fs=require('node:fs'),path=require('node:path');
const source=path.dirname(path.dirname(require.resolve('@simplewebauthn/browser',{paths:[require.resolve('@better-auth/passkey')]})));
fs.mkdirSync('vendor',{recursive:true});
fs.copyFileSync(path.join(source,'dist/bundle/index.umd.min.js'),'vendor/simplewebauthn-browser-13.3.0.js');
fs.copyFileSync(path.join(source,'LICENSE.md'),'vendor/simplewebauthn-LICENSE.md');
