import React, { useState } from 'react';

interface ComponentObject {
    id: string;
    name: string;
    type: string;
    language: string;
    version: string;
    props: Record<string, string | number | boolean>;
    snippet: string;
    styles?: string;
    script?: string;
}

interface HtmlPreviewProps {
    components?: ComponentObject[];
    component?: ComponentObject; // New prop for single component
    refreshKey?: number;
    previewScope?: string;
}

const LoadingIndicator: React.FC = () => (
    <div className="flex items-center justify-center h-full mt-3">
        <div className="flex flex-col items-center space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
            <p className="text-sm text-gray-500">Compiling components...</p>
        </div>
    </div>
);

const WebsitePreview: React.FC<HtmlPreviewProps> = ({ 
    components = [], 
    component, // Single component prop
    previewScope = 'editor-preview-content' 
}) => {
    console.log(' :', component);
    const [isCompiling, setIsCompiling] = useState(false);
    const [htmlPreviewKey, setHtmlPreviewKey] = useState(0);
    const [compiledCss, setCompiledCss] = useState<string>('');
    const [cssCompileError, setCssCompileError] = useState<string | null>(null);
    const [jsError, setJsError] = useState<string | null>(null);

    // Determine which components to process - single component takes priority
    const componentsToProcess = React.useMemo(() => {
        if (component) {
            return [component]; // Single component mode
        }
        return components; // Array mode (existing functionality)
    }, [component, components]);

    // Stable reference for component ID to prevent infinite loops
    const componentId = React.useMemo(() => {
        return component?.id || components.map(c => c.id).join('-');
    }, [component?.id, components]);

    // Process template literals in snippets with props
    const processSnippetWithProps = React.useCallback((snippet: string, props: Record<string, string | number | boolean>): string => {
        let processed = snippet;
        Object.keys(props).forEach((propName) => {
            const regex1 = new RegExp(`\\$\\{${propName}\\}`, 'g');
            const regex2 = new RegExp(`\\{${propName}\\}`, 'g');
            const propValue = String(props[propName] || '');
            processed = processed.replace(regex1, propValue);
            processed = processed.replace(regex2, propValue);
        });

        return processed;
    }, []);

    // Check if content contains fixed positioning classes
    const containsFixedClasses = React.useCallback((content: string): boolean => {
        const fixedClassPatterns = [
            /\bfixed\b/,
            /class\s*=\s*["'][^"']*\bfixed\b[^"']*["']/,
            /className\s*=\s*["'][^"']*\bfixed\b[^"']*["']/,
            /class\s*=\s*\{[^}]*\bfixed\b[^}]*\}/,
            /className\s*=\s*\{[^}]*\bfixed\b[^}]*\}/
        ];
        return fixedClassPatterns.some(pattern => pattern.test(content));
    }, []);

    // Compile SASS/SCSS to CSS (basic implementation)
    const compileSassToCSS = React.useCallback((sassCode: string): string => {
        try {
            let css = sassCode;
            css = css.replace(/(\.[a-zA-Z-_]+)\s*\{([^{}]*&[^{}]*)\}/g, (match, selector, content) => {
                let result = '';
                const lines = content.split('\n');
                const mainStyles: string[] = [];
                const nestedRules: string[] = [];
                lines.forEach((line: string) => {
                    line = line.trim();
                    if (line.includes('&')) {
                        const parts = line.split('{');
                        if (parts.length >= 2) {
                            const nestedSelector = parts[0].replace('&', '').trim();
                            const nestedStyle = parts[1].replace('}', '').trim();
                            nestedRules.push(`${selector}${nestedSelector} { ${nestedStyle} }`);
                        }
                    } else if (line && !line.includes('{') && !line.includes('}')) {
                        mainStyles.push(line);
                    }
                });
                if (mainStyles.length > 0) {
                    result += `${selector} {\n  ${mainStyles.join('\n  ')}\n}\n`;
                }
                result += nestedRules.join('\n') + '\n';
                return result;
            });
            return css;
        } catch (error) {
            console.warn('SASS compilation failed, using as CSS:', error);
            return sassCode;
        }
    }, []);

    // Improved TypeScript to JavaScript compilation
    const compileTypeScriptToJS = React.useCallback((tsCode: string): string => {
        try {
            let js = tsCode;
            // Remove interface declarations
            js = js.replace(/interface\s+\w+\s*\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g, '');
            // Remove type aliases
            js = js.replace(/type\s+\w+\s*=\s*[^;]+;/g, '');
            // Remove function parameter types (more comprehensive)
            js = js.replace(/(\w+)\s*:\s*[a-zA-Z<>\[\]|&\s_{}.,]+(?=\s*[,)=])/g, '$1');
            // Remove function return types
            js = js.replace(/\)\s*:\s*[a-zA-Z<>\[\]|&\s_{}.,]+(?=\s*[{=>;])/g, ')');
            // Remove variable type annotations
            js = js.replace(/(let|const|var)\s+(\w+)\s*:\s*[a-zA-Z<>\[\]|&\s_{}.,]+\s*=/g, '$1 $2 =');

            // Remove type assertions
            js = js.replace(/\s+as\s+[a-zA-Z<>\[\]|&\s_{}.,]+/g, '');

            // Remove generic type parameters
            js = js.replace(/<[a-zA-Z<>\[\]|&\s_{}.,]*>/g, '');

            // Remove optional property markers
            js = js.replace(/\?\s*:/g, ':');

            // Clean up any remaining type-related syntax
            js = js.replace(/:\s*\w+\s*\|[^=;,)}\]]+/g, '');

            return js;
        } catch (error) {
            console.warn('TypeScript compilation failed, using as JavaScript:', error);
            return tsCode;
        }
    }, []);

    // Convert React/JSX to HTML
    const convertReactToHTML = React.useCallback(
        (reactCode: string, props: Record<string, string | number | boolean>): string => {
            try {
                let processed = processSnippetWithProps(reactCode, props);

                // Extract JSX from React component
                if (processed.includes('return (') || processed.includes('return<') || processed.includes('=>(') || processed.includes('=><')) {
                    const jsxMatch =
                        processed.match(/return\s*\(([^]*?)\)/m) ||
                        processed.match(/return\s*(<[^]*?)/m) ||
                        processed.match(/=>\s*\(([^]*?)\)/m) ||
                        processed.match(/=>\s*(<[^]*?)/m);

                    if (jsxMatch) {
                        processed = jsxMatch[1] || jsxMatch[0];
                    }
                }

                // Convert JSX to HTML
                processed = processed
                    .replace(/className=/g, 'class=')
                    .replace(/htmlFor=/g, 'for=')
                    .replace(/onClick=/g, 'onclick=')
                    .replace(/onChange=/g, 'onchange=')
                    .replace(/<React\.Fragment>/g, '')
                    .replace(/<\/React\.Fragment>/g, '')
                    .replace(/<>/g, '')
                    .replace(/<\/>/g, '');

                return processed;
            } catch (error) {
                console.warn('React to HTML conversion failed:', error);
                return reactCode;
            }
        },
        [processSnippetWithProps]
    );

    // Process content based on type
    const processContent = React.useCallback(
        (component: ComponentObject) => {
            const { snippet, styles, script, language, props = {} } = component;

            let processedHTML = '';
            let processedCSS = '';
            let processedJS = '';

            // Process snippet
            if (snippet) {
                const lowerLang = (language || '').toLowerCase();
                const snippetContent = snippet.trim();

                if (
                    lowerLang === 'react' ||
                    lowerLang === 'jsx' ||
                    lowerLang === 'tsx' ||
                    snippetContent.includes('React') ||
                    snippetContent.includes('jsx') ||
                    snippetContent.includes('return (') ||
                    snippetContent.includes('=>(')
                ) {
                    processedHTML = convertReactToHTML(snippetContent, props);
                } else {
                    processedHTML = processSnippetWithProps(snippetContent, props);
                }

                processedHTML = processedHTML.replace(/className=/g, 'class=');
            }

            // Process styles
            if (styles) {
                const stylesContent = styles.trim();
                if (stylesContent.includes('&') || stylesContent.includes('$') || stylesContent.includes('@mixin') || stylesContent.includes('@include')) {
                    processedCSS = compileSassToCSS(stylesContent);
                } else {
                    processedCSS = stylesContent;
                }
            }

            // Process script
            if (script) {
                const scriptContent = script.trim();
                if (
                    scriptContent.includes(': ') &&
                    (scriptContent.includes('interface') || scriptContent.includes('type ') || (scriptContent.includes('<') && scriptContent.includes('>')))
                ) {
                    processedJS = compileTypeScriptToJS(scriptContent);
                } else {
                    processedJS = scriptContent;
                }
            }

            return {
                html: processedHTML,
                css: processedCSS,
                js: processedJS,
            };
        },
        [processSnippetWithProps, convertReactToHTML, compileSassToCSS, compileTypeScriptToJS]
    );

    // Combine all components (now works with single component too) - REMOVED setState from here
    const combinedContent = React.useMemo(() => {
        let combinedHtml = '';
        let combinedCss = '';
        let combinedJs = '';
        let hasFixedPositioning = false;

        // Check if we should apply fixed positioning CSS
        // Only apply when there's exactly one component AND it contains fixed classes
        if (componentsToProcess.length === 1) {
            const singleComponent = componentsToProcess[0];
            const allContent = `${singleComponent.snippet || ''} ${singleComponent.styles || ''}`;
            hasFixedPositioning = containsFixedClasses(allContent);
        }

        componentsToProcess.forEach((componentItem) => {
            const processed = processContent(componentItem);

            if (processed.html) {
                combinedHtml += processed.html + '\n';
            }

            if (processed.css) {
                combinedCss += processed.css + '\n';
            }

            if (processed.js) {
                // Extract element IDs from the script to wait for them
                const elementIdMatches = processed.js.match(/getElementById\(['"`]([^'"`]+)['"`]\)/g);
                const elementIds = elementIdMatches ? elementIdMatches.map(match => {
                    const idMatch = match.match(/getElementById\(['"`]([^'"`]+)['"`]\)/);
                    return idMatch ? idMatch[1] : null;
                }).filter(Boolean) : [];

                // Check if the script contains function declarations that need global scope
                const hasGlobalFunctions =
                    processed.js.includes('function ') &&
                    (processed.html.includes('onclick=') || processed.html.includes('onchange=') || processed.html.includes('oninput='));

                let wrappedScript = '';

                if (hasGlobalFunctions) {
                    // For scripts with global functions (needed for HTML onclick handlers)
                    wrappedScript = `
                        try {
                            // Component ${componentItem.name} script - Global scope for HTML handlers
                            function executeScript_${componentItem.id.replace(/[^a-zA-Z0-9]/g, '_')}() {
                                ${processed.js}
                            }
                            
                            function waitForElements_${componentItem.id.replace(/[^a-zA-Z0-9]/g, '_')}() {
                                ${elementIds.length > 0 ? `
                                const requiredIds = ${JSON.stringify(elementIds)};
                                const missingElements = requiredIds.filter(id => !document.getElementById(id));
                                
                                if (missingElements.length === 0) {
                                    executeScript_${componentItem.id.replace(/[^a-zA-Z0-9]/g, '_')}();
                                } else {
                                    setTimeout(waitForElements_${componentItem.id.replace(/[^a-zA-Z0-9]/g, '_')}, 50);
                                }
                                ` : `
                                executeScript_${componentItem.id.replace(/[^a-zA-Z0-9]/g, '_')}();
                                `}
                            }
                            
                            setTimeout(waitForElements_${componentItem.id.replace(/[^a-zA-Z0-9]/g, '_')}, 100);
                        } catch(e) {
                            console.error('Error in component "${componentItem.name}" script:', e);
                            console.error('Script content:', ${JSON.stringify(processed.js)});
                        }
                    `;
                } else {
                    // For other scripts, use contained scope with element waiting
                    wrappedScript = `
                        try {
                            // Component ${componentItem.name} script - Contained scope
                            (function(window, document) {
                                function executeScript() {
                                    ${processed.js}
                                }
                                
                                function waitForElements() {
                                    ${elementIds.length > 0 ? `
                                    const requiredIds = ${JSON.stringify(elementIds)};
                                    const missingElements = requiredIds.filter(id => !document.getElementById(id));
                                    
                                    if (missingElements.length === 0) {
                                        executeScript();
                                    } else {
                                        setTimeout(waitForElements, 50);
                                    }
                                    ` : `
                                    executeScript();
                                    `}
                                }
                                
                                setTimeout(waitForElements, 100);
                            })(window, document);
                        } catch(e) {
                            console.error('Error in component "${componentItem.name}" script:', e);
                            console.error('Script content:', ${JSON.stringify(processed.js)});
                        }
                    `;
                }

                combinedJs += wrappedScript + '\n';
            }
        });

        // Only add fixed positioning CSS if conditions are met
        let previewFixCSS = '';
        if (hasFixedPositioning) {
            previewFixCSS = `
                /* Preview container adjustments for fixed elements */
                .${previewScope}-content {
                    position: relative;
                    min-height: 100vh;
                    overflow-x: auto;
                }
                
                /* Convert fixed positioning to absolute for preview */
                .${previewScope}-content .fixed {
                    position: absolute !important;
                }
                
                /* Ensure backdrop blur works in preview */
                .${previewScope}-content .backdrop-blur-lg {
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                }
                
                /* Add some padding to body content to account for fixed header */
                .${previewScope}-content > *:not(nav) {
                    padding-top: 80px;
                }
            `;
        } else {
            // Basic container styles for normal components - allow natural height
            previewFixCSS = `
                .${previewScope}-content {
                    position: relative;
                    overflow-x: auto;
                    min-height: auto;
                    height: auto;
                }
                
                /* Ensure components display at natural height */
                .${previewScope}-content > * {
                    margin-bottom: 1rem;
                }
                
                /* Remove excessive spacing for multiple components */
                .${previewScope}-content > *:last-child {
                    margin-bottom: 0;
                }
            `;
        }

        combinedCss = previewFixCSS + '\n' + combinedCss;

        return {
            html: combinedHtml.trim(),
            css: combinedCss.trim(),
            js: combinedJs.trim(),
            hasJs: !!combinedJs.trim(),
            hasCss: !!combinedCss.trim(),
            hasFixedPositioning,
        };
    }, [componentsToProcess, processContent, previewScope, containsFixedClasses]);

    // Handle compilation state in useEffect instead of useMemo
    React.useEffect(() => {
        if (componentsToProcess.length > 0) {
            setIsCompiling(true);
            // Simulate compilation time
            const timer = setTimeout(() => {
                setIsCompiling(false);
            }, 300);
            return () => clearTimeout(timer);
        } else {
            setIsCompiling(false);
        }
    }, [componentId]); // Use stable componentId instead of componentsToProcess

    // Process CSS
    React.useEffect(() => {
        if (combinedContent.hasCss) {
            setCompiledCss(combinedContent.css);
        } else {
            setCompiledCss('');
        }
    }, [combinedContent.css, combinedContent.hasCss]);

    // Execute JavaScript with improved error handling
    React.useEffect(() => {
        if (combinedContent.hasJs && combinedContent.html) {
            const executeJsTimer = setTimeout(() => {
                try {
                    setJsError(null); // Clear previous errors

                    const htmlContainer = document.getElementById('html-preview-container');
                    if (htmlContainer) {
                        // Remove existing scripts
                        const existingScripts = htmlContainer.querySelectorAll('script[data-component-script]');
                        existingScripts.forEach((script) => script.remove());

                        // Create and execute new script
                        const scriptElement = document.createElement('script');
                        scriptElement.type = 'text/javascript';
                        scriptElement.setAttribute('data-component-script', 'true');

                        // Use text content instead of innerHTML for better compatibility
                        scriptElement.textContent = combinedContent.js;

                        // Add error handling for script execution
                        scriptElement.onerror = (error) => {
                            console.error('Script execution failed:', error);
                            setJsError(`Script execution failed: ${error}`);
                        };

                        // Add a global error handler for runtime errors
                        const originalErrorHandler = window.onerror;
                        window.onerror = (message, source, lineno, colno, error) => {
                            if (source && (source.includes('data-component-script') || source.includes('VM'))) {
                                console.error('Component script runtime error:', message);
                                setJsError(`Runtime error: ${message}`);
                                return true;
                            }
                            return originalErrorHandler ? originalErrorHandler(message, source, lineno, colno, error) : false;
                        };

                        // Append script to container for execution
                        htmlContainer.appendChild(scriptElement);

                        console.log('Script injected successfully');
                    }
                } catch (error) {
                    console.error('JavaScript execution error:', error);
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    setJsError(errorMessage);
                }
            }, 300); // Increased delay to ensure HTML is rendered

            return () => clearTimeout(executeJsTimer);
        } else {
            setJsError(null); // Clear errors when no JS
        }
    }, [combinedContent.js, combinedContent.hasJs, combinedContent.html, componentId]); // Use componentId instead of htmlPreviewKey

    // Show loading indicator while compiling
    if (isCompiling && componentsToProcess.length > 0) {
        return <LoadingIndicator />;
    }

    // Show empty state when no components provided
    if (componentsToProcess.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-center">
                    <div className="text-gray-400 text-lg mb-2">📋</div>
                    <p className="text-gray-500">No component to preview</p>
                    <p className="text-sm text-gray-400 mt-1">
                        Pass a component object or components array to see the preview
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={`html-preview ${previewScope}`} key={htmlPreviewKey}>
            {compiledCss && <style dangerouslySetInnerHTML={{ __html: compiledCss }} />}

            {cssCompileError && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-3">
                    <strong className="text-red-700">CSS Compilation Error:</strong>
                    <pre className="text-red-600 text-sm mt-1 whitespace-pre-wrap">{cssCompileError}</pre>
                </div>
            )}

            <div
                id="html-preview-container"
                className={`html-content ${previewScope}-content`}
                // style={{
                //     position: 'relative',
                //     isolation: 'isolate',
                //     transform: 'translateZ(0)',
                //     fontFamily: 'system-ui, -apple-system, sans-serif',
                //     minHeight: 'max-content',
                // }}
            >
                <div
                    className="preview-viewport"
                    style={{
                        position: 'relative',
                        width: '100%',
                        height: 'max-content',
                        minHeight: '100%',
                        overflow: 'auto',
                        transform: 'translateZ(0)',
                    }}
                    dangerouslySetInnerHTML={{ __html: combinedContent.html }}
                />
            </div>

            {jsError && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 mt-3">
                    <strong className="text-red-700">JavaScript Runtime Error:</strong>
                    <div className="text-red-600 text-sm mt-1">{jsError}</div>
                </div>
            )}
            
            
        </div>
    );
};

export default WebsitePreview;