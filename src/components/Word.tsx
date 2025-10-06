/**
 * Draggable Word component
 */

import React, { DragEvent, KeyboardEvent } from 'react';
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
