const fs = require('fs');

const code = fs.readFileSync('frontend/src/hooks/useAppController.jsx', 'utf-8');

// Match top level declarations inside the hook:
// const [varName, setVarName] = useState
// const handleSomthing = ...
// const fetchSomething = ...
// let something = ...

const topLevelVars = new Set();
const lines = code.split('\n');
let insideHook = false;
let braceDepth = 0;

for (let i = 0; i < lines.length; i++) {
  let line = lines[i];
  
  if (line.includes('export const useAppController = () => {')) {
    insideHook = true;
    braceDepth = 1;
    continue;
  }
  
  if (!insideHook) continue;
  
  // Quick brace depth calculation
  const openBraces = (line.match(/\{/g) || []).length;
  const closeBraces = (line.match(/\}/g) || []).length;
  
  if (braceDepth === 1) {
    // We are at the top level of the hook body
    // Match const [var, setVar]
    let m = line.match(/^\s*const\s+\[\s*([a-zA-Z0-9_]+)\s*,\s*([a-zA-Z0-9_]+)\s*\]\s*=/);
    if (m) {
      topLevelVars.add(m[1]);
      topLevelVars.add(m[2]);
    }
    // Match const var = 
    m = line.match(/^\s*(?:const|let)\s+([a-zA-Z0-9_]+)\s*=/);
    if (m) {
      topLevelVars.add(m[1]);
    }
    // Match function var(
    m = line.match(/^\s*function\s+([a-zA-Z0-9_]+)\s*\(/);
    if (m) {
      topLevelVars.add(m[1]);
    }
  }
  
  braceDepth += openBraces - closeBraces;
  if (braceDepth === 0) {
    insideHook = false;
  }
}

// Ensure base context variables are included
['navigate', 'location', 'showStatus', 'ricerche', 'candidati', 'clienti', 'operatori', 'commerciali', 'fetchRicerche', 'fetchCandidati', 'fetchClienti', 'fetchCommerciali'].forEach(v => topLevelVars.add(v));

const exportsList = Array.from(topLevelVars).sort();

// Find the return block
const returnIndex = code.indexOf('return {\n    navigate,');
if (returnIndex !== -1) {
  const endIndex = code.indexOf('  };\n}', returnIndex);
  if (endIndex !== -1) {
    const newReturn = 'return {\n    ' + exportsList.join(',\n    ') + '\n  };';
    const newCode = code.substring(0, returnIndex) + newReturn + code.substring(endIndex + 4);
    fs.writeFileSync('frontend/src/hooks/useAppController.jsx', newCode);
    console.log('Fixed exports! Kept ' + exportsList.length + ' variables.');
  } else {
    console.log('Could not find end of return block');
  }
} else {
  console.log('Could not find return block');
}
