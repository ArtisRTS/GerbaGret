const fs = require('node:fs');
const path = require('node:path');
let ts;try{ts=require('typescript')}catch{ts=require('../../work/typescript.cjs')}
const source=fs.readFileSync(path.join(__dirname,'src/game.ts'),'utf8');
const result=ts.transpileModule(source,{compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.None,strict:true},reportDiagnostics:true});
const errors=result.diagnostics.filter(d=>d.category===ts.DiagnosticCategory.Error);
if(errors.length){console.error(errors);process.exit(1)}
fs.writeFileSync(path.join(__dirname,'dist/game.js'),result.outputText);
console.log('TypeScript compiled successfully.');
