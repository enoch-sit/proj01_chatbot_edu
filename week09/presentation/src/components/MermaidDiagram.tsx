import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

interface MermaidDiagramProps {
  diagram: string;
  id: string;
}

// Initialize mermaid once
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  fontFamily: 'Arial, sans-serif',
  flowchart: {
    useMaxWidth: true,
    htmlLabels: true,
    curve: 'basis'
  }
});

export const MermaidDiagram = ({ diagram, id }: MermaidDiagramProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const renderDiagram = async () => {
      if (containerRef.current && diagram) {
        try {
          // Clear previous content
          containerRef.current.innerHTML = '';
          
          // Generate unique ID for this diagram
          const uniqueId = `mermaid-${id}-${Date.now()}`;
          
          // Render the diagram
          const { svg: renderedSvg } = await mermaid.render(uniqueId, diagram);
          
          // Insert the SVG
          if (containerRef.current) {
            containerRef.current.innerHTML = renderedSvg;
          }
        } catch (error) {
          console.error('Mermaid rendering error:', error);
          if (containerRef.current) {
            containerRef.current.innerHTML = '<p style="color: red;">Error rendering diagram</p>';
          }
        }
      }
    };

    renderDiagram();
  }, [diagram, id]);

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '1rem',
        padding: '1rem',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px',
        minHeight: '200px'
      }}
    />
  );
};
