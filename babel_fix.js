const fs = require('fs');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generator = require('@babel/generator').default;

const fileIn = 'frontend/src/hooks/useAppController.jsx';
const code = fs.readFileSync(fileIn, 'utf-8');

const ast = parser.parse(code, {
  sourceType: 'module',
  plugins: ['jsx']
});

traverse(ast, {
  FunctionDeclaration(path) {
    if (path.node.id && path.node.id.name === 'useAppController') {
      const rootBindings = Object.keys(path.scope.bindings);
      
      // Look for the return statement at the top level
      path.traverse({
        ReturnStatement(retPath) {
          if (retPath.parentPath.parentPath === path) {
            if (retPath.node.argument && retPath.node.argument.type === 'ObjectExpression') {
              // We replace the properties with ALL root bindings!
              const newProps = rootBindings.map(name => {
                return {
                  type: 'ObjectProperty',
                  key: { type: 'Identifier', name },
                  value: { type: 'Identifier', name },
                  shorthand: true
                };
              });
              retPath.node.argument.properties = newProps;
            }
          }
        }
      });
    }
  }
});

const output = generator(ast, {}, code);
fs.writeFileSync(fileIn, output.code);
console.log('Fixed exports cleanly via Babel directly on JSX!');
