import { useState, useEffect } from 'react';

export const useLeadCapture = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasAlreadyShown, setHasAlreadyShown] = useState(false);

  useEffect(() => {
    // Check if modal has already been shown in this session
    const modalShown = localStorage.getItem('midzo_modal_shown_today');
    const lastShownTime = localStorage.getItem('midzo_last_modal_show_time');
    const now = new Date().getTime();

    // Show modal only once per 24 hours
    if (
      !modalShown ||
      !lastShownTime ||
      now - parseInt(lastShownTime) > 24 * 60 * 60 * 1000
    ) {
      // Show modal after 30 seconds
      const timer = setTimeout(() => {
        // Check if user already captured lead
        const leadCaptured = localStorage.getItem('midzo_lead_captured');
        if (!leadCaptured) {
          setIsModalOpen(true);
          setHasAlreadyShown(true);
          localStorage.setItem('midzo_modal_shown_today', 'true');
          localStorage.setItem('midzo_last_modal_show_time', now.toString());
        }
      }, 30000);

      return () => clearTimeout(timer);
    }

    setHasAlreadyShown(true);
  }, []);

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  return {
    isModalOpen,
    closeModal,
    openModal,
    hasAlreadyShown,
  };
};
