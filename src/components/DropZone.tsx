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
  isLocked?: boolean;
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
  isLocked = false,
  onDrop,
  onWordDragStart,
  onWordDragEnd,
  onWordRemove,
  className = '',
}) => {
  const [isDragOver, setIsDragOver] = React.useState(false);
  const dropZoneRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleWordDrop = (e: Event) => {
      const customEvent = e as CustomEvent<{ wordIndex: number }>;
      if (customEvent.detail) {
        onDrop(index);
      }
    };

    const element = dropZoneRef.current;
    if (element) {
      element.addEventListener('word-drop', handleWordDrop);
      return () => {
        element.removeEventListener('word-drop', handleWordDrop);
      };
    }
  }, [index, onDrop]);

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
    if (onWordRemove && word && !isLocked) {
      onWordRemove(index);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    // Space or Enter to remove word or place selected word
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (word && onWordRemove && !isLocked) {
        onWordRemove(index);
      } else if (!word) {
        onDrop(index);
      }
    }
  };

  const handleEmptyClick = () => {
    if (!word) {
      onDrop(index);
    }
  };

  const classNames = [
    styles.dropZone,
    word ? styles.filled : styles.empty,
    isDragOver ? styles.dragOver : '',
    isCorrect ? styles.correct : '',
    isIncorrect ? styles.incorrect : '',
    isLocked ? styles.locked : '',
    isRTL ? styles.rtl : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={dropZoneRef}
      className={classNames}
      data-drop-zone="true"
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleEmptyClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
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
          isLocked={isLocked}
          isRTL={isRTL}
          onDragStart={onWordDragStart}
          onDragEnd={onWordDragEnd}
          onClick={handleWordClick}
        />
      ) : null}
    </div>
  );
};
