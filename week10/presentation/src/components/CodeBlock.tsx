import { useEffect, useRef } from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-http';

interface CodeBlockProps {
  language: string;
  code: string;
}

export const CodeBlock = ({ language, code }: CodeBlockProps) => {
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [code, language]);

  // Map language names to Prism language classes
  const languageMap: Record<string, string> = {
    python: 'python',
    javascript: 'javascript',
    typescript: 'typescript',
    json: 'json',
    bash: 'bash',
    http: 'http',
    shell: 'bash',
  };

  const prismLanguage = languageMap[language.toLowerCase()] || 'javascript';

  return (
    <div style={{ 
      fontSize: '0.85rem', 
      marginTop: '1rem',
      maxHeight: '400px',
      overflow: 'auto',
      borderRadius: '8px',
      backgroundColor: '#2d2d2d'
    }}>
      <pre style={{ margin: 0 }}>
        <code 
          ref={codeRef} 
          className={`language-${prismLanguage}`}
          style={{ fontSize: '0.9rem' }}
        >
          {code}
        </code>
      </pre>
    </div>
  );
};
