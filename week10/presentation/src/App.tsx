import { useState } from 'react';
import { slides } from './data/slides';
import { SlideView } from './components/SlideView';
import { exportToPptx } from './utils/exportToPptx';
import './App.css';

function App() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  const currentSlide = slides[currentSlideIndex];

  const handleNext = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowRight' || event.key === ' ') {
      handleNext();
    } else if (event.key === 'ArrowLeft') {
      handlePrevious();
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportToPptx(slides);
      alert('Presentation exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Check console for details.');
    } finally {
      setIsExporting(false);
    }
  };

  // Add keyboard event listener
  useState(() => {
    window.addEventListener('keydown', handleKeyDown as any);
    return () => window.removeEventListener('keydown', handleKeyDown as any);
  });

  return (
    <div className="app">
      {/* Slide Container */}
      <div className="slide-container">
        <SlideView slide={currentSlide} />
      </div>

      {/* Controls */}
      <div className="controls">
        <button
          onClick={handlePrevious}
          disabled={currentSlideIndex === 0}
          className="nav-button"
        >
          ← Previous
        </button>

        <span className="slide-counter">
          {currentSlideIndex + 1} / {slides.length}
        </span>

        <button
          onClick={handleNext}
          disabled={currentSlideIndex === slides.length - 1}
          className="nav-button"
        >
          Next →
        </button>

        <button
          onClick={handleExport}
          disabled={isExporting}
          className="export-button"
        >
          {isExporting ? 'Exporting...' : '📥 Export to PowerPoint'}
        </button>
      </div>

      {/* Instructions */}
      <div className="instructions">
        Use arrow keys or space to navigate • Click Export to download .pptx
      </div>
    </div>
  );
}

export default App;

