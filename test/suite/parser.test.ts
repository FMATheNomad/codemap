import * as assert from 'assert';

suite('Parser Tests', () => {
  test('TypeScript parser detects imports', () => {
    const code = `
      import { something } from './module';
      import * as lib from 'external-package';
      import defaultExport from '../other-module';
      export function myFunc() {}
      export default class MyClass {}
    `;

    // We'll test the actual parser class
    const { TypeScriptParser } = require('../../src/parser/typescript');
    const parser = new TypeScriptParser();
    const result = parser.parse('/test/file.ts', code);

    assert.ok(result.imports.includes('./module'), 'Should detect relative import');
    assert.ok(result.imports.includes('external-package'), 'Should detect external import');
    assert.ok(result.imports.includes('../other-module'), 'Should detect parent directory import');
    assert.ok(result.exports.length > 0, 'Should detect exports');
    assert.ok(result.localDependencies.length > 0, 'Should detect local dependencies');
  });

  test('Python parser detects imports', () => {
    const code = `
      import os
      import sys
      from .local_module import something
      from ..parent_module import OtherClass
      from external_package import useful_function
    `;

    const { PythonParser } = require('../../src/parser/python');
    const parser = new PythonParser();
    const result = parser.parse('/test/file.py', code);

    assert.ok(result.imports.includes('os'), 'Should detect stdlib import');
    assert.ok(result.imports.includes('.local_module'), 'Should detect relative import');
    assert.ok(result.localDependencies.length > 0, 'Should detect local dependencies');
  });

  test('Generic parser detects file references', () => {
    const code = `
      const config = require('./config.json');
      const data = import('./data/file.json');
      const ref = './some/path.txt';
    `;

    const { GenericParser } = require('../../src/parser/generic');
    const parser = new GenericParser();
    const result = parser.parse('/test/file.js', code);

    assert.ok(result.references.length > 0, 'Should detect references');
    assert.ok(result.localDependencies.length > 0, 'Should detect local dependencies');
  });
});
