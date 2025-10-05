import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from './Modal';

describe('Modal', () => {
  it('renders when isOpen is true', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal">
        <div>Modal Content</div>
      </Modal>
    );

    expect(screen.getByText('Modal Content')).toBeInTheDocument();
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(
      <Modal isOpen={false} onClose={() => {}} title="Test Modal">
        <div>Modal Content</div>
      </Modal>
    );

    expect(screen.queryByText('Modal Content')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = jest.fn();
    render(
      <Modal isOpen={true} onClose={onClose} title="Test Modal">
        <div>Modal Content</div>
      </Modal>
    );

    const closeButton = screen.getByLabelText('Close modal');
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when overlay is clicked', () => {
    const onClose = jest.fn();
    const { container } = render(
      <Modal isOpen={true} onClose={onClose} title="Test Modal">
        <div>Modal Content</div>
      </Modal>
    );

    const overlay = container.querySelector('[role="dialog"]');
    if (overlay) {
      fireEvent.click(overlay);
      expect(onClose).toHaveBeenCalledTimes(1);
    }
  });

  it('does not close when modal content is clicked', () => {
    const onClose = jest.fn();
    render(
      <Modal isOpen={true} onClose={onClose} title="Test Modal">
        <div>Modal Content</div>
      </Modal>
    );

    const content = screen.getByText('Modal Content');
    fireEvent.click(content);

    expect(onClose).not.toHaveBeenCalled();
  });

  it('calls onClose when Escape key is pressed', () => {
    const onClose = jest.fn();
    render(
      <Modal isOpen={true} onClose={onClose} title="Test Modal">
        <div>Modal Content</div>
      </Modal>
    );

    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose for other keys', () => {
    const onClose = jest.fn();
    render(
      <Modal isOpen={true} onClose={onClose} title="Test Modal">
        <div>Modal Content</div>
      </Modal>
    );

    fireEvent.keyDown(document, { key: 'Enter', code: 'Enter' });
    fireEvent.keyDown(document, { key: 'Space', code: 'Space' });

    expect(onClose).not.toHaveBeenCalled();
  });

  it('renders children correctly', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal">
        <h1>Title</h1>
        <p>Paragraph</p>
        <button>Button</button>
      </Modal>
    );

    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Paragraph')).toBeInTheDocument();
    expect(screen.getByText('Button')).toBeInTheDocument();
  });

  it('has correct ARIA attributes', () => {
    const { container } = render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal">
        <div>Modal Content</div>
      </Modal>
    );

    const overlay = container.querySelector('[role="dialog"]');
    expect(overlay).toHaveAttribute('role', 'dialog');
    expect(overlay).toHaveAttribute('aria-modal', 'true');
    expect(overlay).toHaveAttribute('aria-labelledby', 'modal-title');
  });

  it('applies correct CSS classes', () => {
    const { container } = render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal">
        <div>Modal Content</div>
      </Modal>
    );

    // Component uses CSS modules
    expect(container.querySelector('[class*="overlay"]')).toBeInTheDocument();
    expect(container.querySelector('[class*="modal"]')).toBeInTheDocument();
    expect(container.querySelector('[class*="closeButton"]')).toBeInTheDocument();
  });

  it('cleans up event listener on unmount', () => {
    const onClose = jest.fn();
    const { unmount } = render(
      <Modal isOpen={true} onClose={onClose} title="Test Modal">
        <div>Modal Content</div>
      </Modal>
    );

    unmount();

    // After unmount, Escape key should not trigger onClose
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('updates event listener when isOpen changes', () => {
    const onClose = jest.fn();
    const { rerender } = render(
      <Modal isOpen={false} onClose={onClose} title="Test Modal">
        <div>Modal Content</div>
      </Modal>
    );

    // Escape key should not work when closed
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();

    // Open the modal
    rerender(
      <Modal isOpen={true} onClose={onClose} title="Test Modal">
        <div>Modal Content</div>
      </Modal>
    );

    // Now Escape key should work
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders footer when provided', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal" footer={<button>Footer Button</button>}>
        <div>Modal Content</div>
      </Modal>
    );

    expect(screen.getByText('Footer Button')).toBeInTheDocument();
  });

  it('does not render footer when not provided', () => {
    const { container } = render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal">
        <div>Modal Content</div>
      </Modal>
    );

    expect(container.querySelector('[class*="footer"]')).not.toBeInTheDocument();
  });
});
