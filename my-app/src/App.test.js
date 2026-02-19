/**
 * Simple test to check if the App.js file exists and contains expected content.
 */

describe('App Component', () => {
  test('App.js file exists and contains expected content', () => {
    const fs = require('fs');
    const path = require('path');
    
    const appPath = path.join(__dirname, 'App.js');
    expect(fs.existsSync(appPath)).toBe(true);
    
    const content = fs.readFileSync(appPath, 'utf8');
    
    // Vérifie la structure de base
    expect(content).toContain('function App');
    expect(content).toContain('export default App');
    expect(content).toContain('return (');
    expect(content).toContain('UserProvider');
    expect(content).toContain('Router');
    expect(content).toContain('Routes');
    expect(content).toContain('Route');
  });

  test('App.js has correct imports', () => {
    const fs = require('fs');
    const path = require('path');
    
    const content = fs.readFileSync(path.join(__dirname, 'App.js'), 'utf8');
    
    expect(content).toContain('import React from \'react\'');
    expect(content).toContain('BrowserRouter as Router');
    expect(content).toContain('UserProvider');
    expect(content).toContain('HomePage');
    expect(content).toContain('RegisterPage');
  });

  test('App.js contains route structure', () => {
    const fs = require('fs');
    const path = require('path');
    
    const content = fs.readFileSync(path.join(__dirname, 'App.js'), 'utf8');
    
    expect(content).toContain('path="/"');
    expect(content).toContain('path="/register"');
    expect(content).toContain('<HomePage />');
    expect(content).toContain('<RegisterPage />');
  });
});
