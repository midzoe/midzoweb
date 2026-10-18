import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Bouton d'action des pages annuaire (« Book Now », « Get Quote », « Apply Now »…).
 * Ces boutons ne faisaient rien. Désormais : le lien officiel de la fiche s'il existe,
 * sinon le formulaire de contact pré-rempli avec le service et l'élément concernés.
 */
interface Props {
  href?: string | null;
  /** Objet de la demande, ex. « Assurance voyage — AXA ». */
  service: string;
  className?: string;
  children: React.ReactNode;
}

const external = (url: string) => (/^https?:\/\//i.test(url) ? url : `https://${url}`);

const ActionButton: React.FC<Props> = ({ href, service, className = '', children }) => {
  const classes = `${className} inline-block text-center`;
  if (href && href.trim()) {
    return <a href={external(href.trim())} target="_blank" rel="noopener noreferrer" className={classes}>{children}</a>;
  }
  return <Link to={`/contact?service=${encodeURIComponent(service)}`} className={classes}>{children}</Link>;
};

export default ActionButton;
