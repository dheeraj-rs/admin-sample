'use client';
import { useCallback } from 'react';

interface EditorManagerProps {
    editorRef: React.RefObject<any>;
    selectedSnippetId: string;
    codeContent: Record<string, string>;
    setCodeContent: React.Dispatch<React.SetStateAction<Record<string, string>>>;
    cssSnippetId: string;
    setLastValidCssContent: React.Dispatch<React.SetStateAction<string>>;
    getEditorLanguage: (language: string) => string;
}

const EditorManager = ({
    editorRef,
    selectedSnippetId,
    codeContent,
    setCodeContent,
    cssSnippetId,
    setLastValidCssContent,
    getEditorLanguage,
}: EditorManagerProps) => {
    const handleEditorDidMount = useCallback(
        (editor: any, monaco: any) => {
            (editorRef as any).current = editor;

            // Force update the editor value
            if (editor && selectedSnippetId && codeContent[selectedSnippetId]) {
                setTimeout(() => {
                    editor.setValue(codeContent[selectedSnippetId] || '');
                }, 100);
            }

            if (monaco) {
                monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
                    noSemanticValidation: false,
                    noSyntaxValidation: false,
                });
                monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
                    target: monaco.languages.typescript.ScriptTarget.ES2020,
                    allowNonTsExtensions: true,
                    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
                    module: monaco.languages.typescript.ModuleKind.ESNext,
                    jsx: monaco.languages.typescript.JsxEmit.React,
                    allowJs: true,
                    typeRoots: ['node_modules/@types'],
                });

                // Configure HTML formatter
                if (monaco.languages.html) {
                    monaco.languages.html.htmlDefaults.setOptions({
                        format: {
                            tabSize: 2,
                            insertSpaces: true,
                            wrapLineLength: 100,
                            contentUnformatted: 'pre,code,textarea',
                            indentInnerHtml: true,
                            wrapAttributes: 'auto',
                        },
                    });
                }

                // Configure CSS formatter
                if (monaco.languages.css) {
                    monaco.languages.css.cssDefaults.setOptions({
                        format: {
                            tabSize: 2,
                            insertSpaces: true,
                            newlineBetweenRules: true,
                            newlineBetweenSelectors: false,
                        },
                    });
                }
            }
        },
        [editorRef, selectedSnippetId, codeContent]
    );

    const handleCodeChange = useCallback(
        (value: string | undefined) => {
            if (value !== codeContent[selectedSnippetId]) {
                setCodeContent((prev) => ({
                    ...prev,
                    [selectedSnippetId]: value || '',
                }));
                if (selectedSnippetId === cssSnippetId && value && value.trim() !== '') {
                    setLastValidCssContent(value);
                }
            }
        },
        [selectedSnippetId, cssSnippetId, codeContent, setCodeContent, setLastValidCssContent]
    );

    const editorValue = codeContent[selectedSnippetId] || '';
    const resetCode = useCallback(
        (element: any, snippets: any[], selectedSnippetId: string, cssSnippetId: string) => {
            if (!element || !selectedSnippetId) return;

            const snippet = snippets.find((s) => s.id === selectedSnippetId);
            if (snippet) {
                setCodeContent((prev) => ({
                    ...prev,
                    [selectedSnippetId]: snippet.code,
                }));

                if (selectedSnippetId === cssSnippetId && snippet.code.trim() !== '') {
                    setLastValidCssContent(snippet.code);
                }
            }
        },
        [setCodeContent, setLastValidCssContent]
    );

    return {
        handleEditorDidMount,
        handleCodeChange,
        editorValue,
        resetCode,
    };
};

export default EditorManager;
