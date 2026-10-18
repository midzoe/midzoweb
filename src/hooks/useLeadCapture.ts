import { useState, useEffect } from 'react';

/**
 * `enabled` = la page courante peut être interrompue. Sur une page de tâche (parcours
 * Study, connexion, dashboard…) la popup recouvrait le formulaire en pleine saisie :
 * le minuteur ne tourne alors pas, et il repart à zéro sur une page éligible.
 */
export const useLeadCapture = (enabled = true) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasAlreadyShown, setHasAlreadyShown] = useState(false);

  useEffect(() => {
    if (!enabled) return;
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
  }, [enabled]);

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
