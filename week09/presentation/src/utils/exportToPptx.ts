import pptxgen from 'pptxgenjs';
import type { Slide } from '../data/slides';
import mermaid from 'mermaid';

export const exportToPptx = async (slides: Slide[]): Promise<void> => {
  const pptx = new pptxgen();

  // Configure presentation
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'Java to TypeScript Migration';
  pptx.title = 'Java to TypeScript Migration Guide';

  for (const slide of slides) {
    const pptxSlide = pptx.addSlide();

    // Set background color if specified
    if (slide.backgroundColor) {
      pptxSlide.background = { color: slide.backgroundColor.replace('#', '') };
    }

    // Add title
    pptxSlide.addText(slide.title, {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.8,
      fontSize: 36,
      bold: true,
      color: slide.textColor ? slide.textColor.replace('#', '') : '000000',
      fontFace: 'Arial'
    });

    // Add bullet points
    const bulletText = slide.bullets.map(bullet => ({ text: bullet, options: { bullet: true } }));
    pptxSlide.addText(bulletText, {
      x: 0.5,
      y: 1.5,
      w: 9,
      h: 3,
      fontSize: 20,
      color: slide.textColor ? slide.textColor.replace('#', '') : '000000',
      fontFace: 'Arial',
      valign: 'top'
    });

    // Add code snippet if present
    if (slide.codeSnippet) {
      pptxSlide.addText(slide.codeSnippet.code, {
        x: 0.5,
        y: 4.5,
        w: 9,
        h: 2.5,
        fontSize: 12,
        fontFace: 'Courier New',
        color: '000000',
        fill: { color: 'F5F5F5' },
        align: 'left',
        valign: 'top'
      });
    }

    // Add Mermaid diagram if present
    if (slide.mermaidDiagram) {
      try {
        // Render mermaid to SVG
        const { svg } = await mermaid.render(`diagram-${slide.id}`, slide.mermaidDiagram);
        
        // Convert SVG to base64 data URL
        const svgBase64 = btoa(unescape(encodeURIComponent(svg)));
        const dataUrl = `data:image/svg+xml;base64,${svgBase64}`;

        pptxSlide.addImage({
          data: dataUrl,
          x: 1,
          y: 4.5,
          w: 8,
          h: 2.5
        });
      } catch (error) {
        console.error('Error rendering Mermaid diagram:', error);
      }
    }
  }

  // Save the presentation
  await pptx.writeFile({ fileName: 'Java-to-TypeScript-Migration.pptx' });
};
