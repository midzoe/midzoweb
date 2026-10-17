/// <reference types="vite/client" />
import emailjs from '@emailjs/browser';

// Initialize EmailJS - You'll need to add your credentials to .env
const SERVICE_ID = (import.meta.env.VITE_EMAILJS_SERVICE_ID as string) || 'service_placeholder';
const TEMPLATE_ID = (import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string) || 'template_placeholder';
const PUBLIC_KEY = (import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string) || 'public_key_placeholder';

// Initialize EmailJS only once
if (PUBLIC_KEY !== 'public_key_placeholder') {
  emailjs.init(PUBLIC_KEY);
}

export interface LeadMagnetSubmission {
  firstName: string;
  email: string;
  countryOfInterest?: string;
  language: string;
  timestamp: string;
}

export const sendLeadMagnetEmail = async (submission: LeadMagnetSubmission) => {
  try {
    // Check if credentials are configured
    if (SERVICE_ID === 'service_placeholder' || TEMPLATE_ID === 'template_placeholder') {
      console.warn('EmailJS credentials not configured. Please set VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, and VITE_EMAILJS_PUBLIC_KEY in your .env file');
      // For demo purposes, we'll simulate a successful send
      return { success: true, messageId: 'DEMO_MODE' };
    }

    const templateParams = {
      to_email: submission.email,
      user_name: submission.firstName,
      country: submission.countryOfInterest || 'Not specified',
      language: submission.language,
      guide_link: 'https://midzoe.com/downloads/study-abroad-guide.pdf',
      timestamp: submission.timestamp,
    };

    const response = await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams);
    return { success: true, messageId: response.status };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export const trackLeadEvent = (eventName: string, properties?: Record<string, any>) => {
  try {
    // Google Analytics tracking (if available)
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, properties);
    }

    // Store in localStorage for analytics
    const events = JSON.parse(localStorage.getItem('midzo_lead_events') || '[]');
    events.push({
      eventName,
      timestamp: new Date().toISOString(),
      properties,
    });
    localStorage.setItem('midzo_lead_events', JSON.stringify(events.slice(-100))); // Keep last 100
  } catch (error) {
    console.error('Error tracking event:', error);
  }
};

export const checkExistingLead = (email: string): boolean => {
  try {
    const leads = JSON.parse(localStorage.getItem('midzo_captured_leads') || '[]');
    return leads.includes(email);
  } catch (error) {
    console.error('Error checking existing lead:', error);
    return false;
  }
};

export const saveLead = (email: string) => {
  try {
    const leads = JSON.parse(localStorage.getItem('midzo_captured_leads') || '[]');
    if (!leads.includes(email)) {
      leads.push(email);
      localStorage.setItem('midzo_captured_leads', JSON.stringify(leads));
    }
  } catch (error) {
    console.error('Error saving lead:', error);
  }
};

// Declare gtag for TypeScript
declare global {
  interface Window {
    gtag?: (command: string, eventName: string, properties?: Record<string, any>) => void;
  }
}
