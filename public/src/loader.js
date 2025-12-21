// Simple module loader for browser
(function() {
    const modules = {};
    const cache = {};

    function resolvePath(base, relative) {
        const baseParts = base.split('/').filter(p => p && p !== '.');
        const relParts = relative.split('/').filter(p => p && p !== '.');
        
        for (const part of relParts) {
            if (part === '..') {
                baseParts.pop();
            } else {
                baseParts.push(part);
            }
        }
        
        return '/' + baseParts.join('/');
    }

    window.require = function(path) {
        if (cache[path]) {
            return cache[path];
        }

        // Handle node_modules
        if (path === 'react') {
            return window.React;
        }
        if (path === 'react-dom') {
            return window.ReactDOM;
        }

        // Handle relative paths - need to resolve from caller
        const module = modules[path];
        if (!module) {
            // Try to find it
            const allPaths = Object.keys(modules);
            const found = allPaths.find(p => p.endsWith(path) || p.includes(path));
            if (found) {
                return window.require(found);
            }
            throw new Error(`Module not found: ${path}. Available: ${allPaths.join(', ')}`);
        }

        const exports = {};
        const moduleObj = { exports };
        
        if (typeof module === 'function') {
            const moduleRequire = (reqPath) => {
                if (reqPath === 'react') return window.React;
                if (reqPath === 'react-dom') return window.ReactDOM;
                
                // Resolve relative paths
                if (reqPath.startsWith('./') || reqPath.startsWith('../')) {
                    const basePath = path.substring(0, path.lastIndexOf('/'));
                    const resolved = resolvePath(basePath, reqPath);
                    return window.require(resolved);
                }
                
                return window.require(reqPath);
            };
            
            module(moduleObj.exports, moduleRequire, moduleObj);
        } else {
            Object.assign(exports, module);
        }

        cache[path] = moduleObj.exports;
        return moduleObj.exports;
    };

    window.defineModule = function(path, factory) {
        modules[path] = factory;
    };

    window.loadModules = async function() {
        const moduleOrder = [
            '/src/constants/api.js',
            '/src/utils/formatters.js',
            '/src/services/localStorage.js',
            '/src/services/api.js',
            '/src/components/StatusMessage.jsx',
            '/src/components/AccountTabs.jsx',
            '/src/components/AccountModal.jsx',
            '/src/components/RecentActivity.jsx',
            '/src/components/TransactionForm.jsx',
            '/src/App.jsx'
        ];

        for (const modulePath of moduleOrder) {
            try {
                const response = await fetch(modulePath);
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                let code = await response.text();
                
                // Transform JSX
                if (modulePath.endsWith('.jsx')) {
                    code = Babel.transform(code, {
                        presets: ['react']
                    }).code;
                }

                // Create module function
                const moduleFn = new Function('module', 'require', 'exports', code);
                
                window.defineModule(modulePath, function(exports, require, module) {
                    moduleFn(module, require, exports);
                });
            } catch (error) {
                // Log error but don't expose internal details to user
                throw new Error(`Failed to load module: ${modulePath.split('/').pop()}`);
            }
        }
    };
})();
