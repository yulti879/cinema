import { useEffect, useRef, useState } from 'react';

interface PopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Popup: React.FC<PopupProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  const [visible, setVisible] = useState(isOpen);
  const popupRef = useRef<HTMLDivElement>(null);
  const previousOverflow = useRef<string | null>(null);

  //
  // Управление scroll lock
  //
  useEffect(() => {
    if (isOpen) {
      previousOverflow.current = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      setVisible(true);
    } else {
      document.body.style.overflow = previousOverflow.current || '';
    }

    return () => {
      document.body.style.overflow = previousOverflow.current || '';
    };
  }, [isOpen]);

  //
  // Обработка ESC
  //
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  //
  // Определение окончания CSS-анимации закрытия
  //
  useEffect(() => {
    const node = popupRef.current;
    if (!node) return;

    const handleAnimationEnd = () => {
      if (!isOpen) setVisible(false);
    };

    node.addEventListener('animationend', handleAnimationEnd);
    node.addEventListener('transitionend', handleAnimationEnd);

    return () => {
      node.removeEventListener('animationend', handleAnimationEnd);
      node.removeEventListener('transitionend', handleAnimationEnd);
    };
  }, [isOpen]);

  if (!visible) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className={`popup ${isOpen ? 'active' : ''}`}
      onClick={handleOverlayClick}
      ref={popupRef}
    >
      <div className="popup__container">
        <div className="popup__content">

          {/* Header */}
          <div className="popup__header">
            <h2 className="popup__title">{title}</h2>
            <button
              className="popup__dismiss"
              onClick={onClose}
              aria-label="Закрыть"
            >
              <img src="/images/admin/close.png" alt="Закрыть" />
            </button>
          </div>

          {/* Content */}
          <div className="popup__wrapper">
            {children}
          </div>

        </div>
      </div>
    </div>
  );
};