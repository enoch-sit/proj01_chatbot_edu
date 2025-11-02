import type { Slide } from '../data/slides';
import { CodeBlock } from './CodeBlock';
import { MermaidDiagram } from './MermaidDiagram';

interface SlideViewProps {
  slide: Slide;
}

export const SlideView = ({ slide }: SlideViewProps) => {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        padding: '3rem',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: slide.backgroundColor || '#ffffff',
        color: slide.textColor || '#000000',
        overflow: 'auto'
      }}
    >
      {/* Title */}
      <h1 style={{
        fontSize: '2.5rem',
        marginBottom: '2rem',
        borderBottom: '3px solid currentColor',
        paddingBottom: '0.5rem'
      }}>
        {slide.title}
      </h1>

      {/* Bullet Points */}
      <ul style={{
        fontSize: '1.5rem',
        lineHeight: '2.5',
        listStyleType: 'disc',
        paddingLeft: '2rem',
        marginBottom: '2rem'
      }}>
        {slide.bullets.map((bullet, index) => (
          <li key={index}>
            {typeof bullet === 'string' ? (
              bullet
            ) : (
              <div>
                <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
                  {bullet.point}
                </div>
                {bullet.subtext && (
                  <div style={{ 
                    fontSize: '1.1rem', 
                    opacity: 0.8,
                    lineHeight: '1.6',
                    marginTop: '0.3rem'
                  }}>
                    {bullet.subtext}
                  </div>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>

      {/* Code Snippet */}
      {slide.codeSnippet && (
        <CodeBlock
          language={slide.codeSnippet.language}
          code={slide.codeSnippet.code}
        />
      )}

      {/* Mermaid Diagram */}
      {slide.mermaidDiagram && (
        <MermaidDiagram
          diagram={slide.mermaidDiagram}
          id={`slide-${slide.id}`}
        />
      )}
    </div>
  );
};
