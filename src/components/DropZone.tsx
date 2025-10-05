/**
 * Drop zone component for word placement
 */

import React, { DragEvent, KeyboardEvent } from 'react';
import { Word } from './Word';
import styles from './DropZone.module.css';

interface DropZoneProps {
  index: number;
  word: string | null;
  wordIndex: number | null;
  isRTL?: boolean;
  isCorrect?: boolean;
  isIncorrect?: boolean;
  onDrop: (dropIndex: number) => void;
  onWordDragStart: (wordIndex: number) => void;
  onWordDragEnd: () => void;
  onWordRemove?: (dropIndex: number) => void;
  className?: string;
}

export const DropZone: React.FC<DropZoneProps> = ({
  index,
  word,
  wordIndex,
  isRTL = false,
  isCorrect = false,
  isIncorrect = false,
  onDrop,
  onWordDragStart,
  onWordDragEnd,
  onWordRemove,
  className = '',
}) => {
  const [isDragOver, setIsDragOver] = React.useState(false);

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    onDrop(index);
  };

  const handleWordClick = () => {
    if (onWordRemove && word) {
      onWordRemove(index);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    // Space or Enter to remove word
    if ((e.key === ' ' || e.key === 'Enter') && word && onWordRemove) {
      e.preventDefault();
      onWordRemove(index);
    }
  };

  const classNames = [
    styles.dropZone,
    word ? styles.filled : styles.empty,
    isDragOver ? styles.dragOver : '',
    isCorrect ? styles.correct : '',
    isIncorrect ? styles.incorrect : '',
    isRTL ? styles.rtl : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={classNames}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onKeyDown={handleKeyDown}
      tabIndex={word ? 0 : -1}
      role="button"
      aria-label={
        word ? `Position ${index + 1}: ${word}` : `Empty position ${index + 1}`
      }
      aria-dropeffect="move"
    >
      {word && wordIndex !== null ? (
        <Word
          word={word}
          index={wordIndex}
          isPlaced={true}
          isRTL={isRTL}
          onDragStart={onWordDragStart}
          onDragEnd={onWordDragEnd}
          onClick={handleWordClick}
        />
      ) : null}
    </div>
  );
};
