/**
 * Draggable Word component
 */

import React, { DragEvent, KeyboardEvent, TouchEvent } from 'react';
import styles from './Word.module.css';

interface WordProps {
  word: string;
  index: number;
  isPlaced: boolean;
  isLocked?: boolean;
  isRTL?: boolean;
  disabled?: boolean;
  onDragStart: (index: number) => void;
  onDragEnd: () => void;
  onClick?: () => void;
  className?: string;
}

export const Word: React.FC<WordProps> = ({
  word,
  index,
  isPlaced,
  isLocked = false,
  isRTL = false,
  disabled = false,
  onDragStart,
  onDragEnd,
  onClick,
  className = '',
}) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const touchStartPos = React.useRef<{ x: number; y: number } | null>(null);

  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    if (disabled || isLocked) {
      e.preventDefault();
      return;
    }

    setIsDragging(true);
    onDragStart(index);

    // Set drag data
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    onDragEnd();
  };

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (disabled || isLocked) {
      return;
    }

    const touch = e.touches[0];
    touchStartPos.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (disabled || isLocked || !touchStartPos.current) {
      return;
    }

    const touch = e.touches[0];
    const dx = Math.abs(touch.clientX - touchStartPos.current.x);
    const dy = Math.abs(touch.clientY - touchStartPos.current.y);

    // If moved more than 10px, consider it a drag
    if (dx > 10 || dy > 10) {
      if (!isDragging) {
        setIsDragging(true);
        onDragStart(index);
      }
    }
  };

  const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    if (disabled || isLocked) {
      return;
    }

    if (isDragging) {
      // Find drop zone at touch position
      const touch = e.changedTouches[0];
      const elementAtPoint = document.elementFromPoint(touch.clientX, touch.clientY);

      if (elementAtPoint) {
        const dropZone = elementAtPoint.closest('[data-drop-zone]');
        if (dropZone) {
          // Trigger drop event on the drop zone
          const dropEvent = new CustomEvent('word-drop', {
            bubbles: true,
            detail: { wordIndex: index }
          });
          dropZone.dispatchEvent(dropEvent);
        }
      }

      setIsDragging(false);
      onDragEnd();
    } else if (touchStartPos.current) {
      // If not dragging, treat as a click
      const touch = e.changedTouches[0];
      const dx = Math.abs(touch.clientX - touchStartPos.current.x);
      const dy = Math.abs(touch.clientY - touchStartPos.current.y);

      if (dx < 10 && dy < 10) {
        handleClick();
      }
    }

    touchStartPos.current = null;
  };

  const handleClick = () => {
    if (!disabled && !isLocked && onClick) {
      onClick();
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (disabled || isLocked) return;

    // Space or Enter to select/activate word
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleClick();
    }
  };

  const classNames = [
    styles.word,
    isDragging ? styles.dragging : '',
    isPlaced ? styles.placed : '',
    isLocked ? styles.locked : '',
    disabled ? styles.disabled : '',
    isRTL ? styles.rtl : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={classNames}
      draggable={!disabled && !isLocked}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={disabled || isLocked ? -1 : 0}
      role="button"
      aria-label={`Word: ${word}${isLocked ? ' (locked)' : ''}`}
      aria-pressed={isPlaced}
      aria-disabled={disabled || isLocked}
    >
      {word}
    </div>
  );
};
