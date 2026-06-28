interface ServiceDetail {
  name: string;
  description: string;
  image: string;
  learnMoreLink: string;
  translationKey: string;
  isExternal?: boolean;
}

interface CategoryServices {
  [key: string]: {
    [key: string]: ServiceDetail;
  };
}

export const serviceDetails: CategoryServices = {
  study: {
    'University finder': {
      name: 'University Finder',
      description: 'Find the perfect university match based on your academic interests, budget, and location preferences.',
      image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      learnMoreLink: '/services/university-finder',
      translationKey: 'study.universityFinder'
    },
    'Document Legalization & Recognition': {
      name: 'Document Legalization & Recognition',
      description: 'Complete support for document legalization and recognition of your qualifications internationally.',
      image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      learnMoreLink: '/services/document-legalization',
      translationKey: 'study.documentLegalization'
    },
    'Student accommodation': {
      name: 'Student Accommodation',
      description: 'Find safe and comfortable housing options near your university, from dormitories to shared apartments.',
      image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      learnMoreLink: '/services/student-accommodation',
      translationKey: 'study.studentAccommodation'
    },
    'Student visa assistance': {
      name: 'Student Visa Assistance',
      description: 'Complete support throughout your student visa application process, from documentation to interview preparation.',
      image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      learnMoreLink: '/services/student-visa',
      translationKey: 'study.studentVisa'
    },
    'Bank account': {
      name: 'Bank Account Setup',
      description: 'Assistance in opening a student bank account in your destination country.',
      image: 'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      learnMoreLink: '/services/bank-account',
      translationKey: 'study.bankAccount'
    },
    'Insurance': {
      name: 'Insurance',
      description: 'Comprehensive insurance coverage tailored for students studying abroad.',
      image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      learnMoreLink: '/insurance',
      translationKey: 'study.insurance'
    },
    'Language center': {
      name: 'Language Center',
      description: 'Quality language courses and certification programs to enhance your language skills for academic success.',
      image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      learnMoreLink: '/services/language-center',
      translationKey: 'study.languageCenter'
    },
    'Flight booking': {
      name: 'Flight Booking',
      description: 'Book your flights with special student rates and flexible options for international travel.',
      image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      learnMoreLink: '/flights',
      translationKey: 'study.flightBooking'
    }
  },
  tourism: {
    'Events & Spectacles': {
      name: 'Events & Spectacles',
      description: 'Live the biggest global events: World Cup 2026, AFCON, Olympic Games. Complete packages: transport, accommodation, tickets.',
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      learnMoreLink: '/services/tourism-events',
      translationKey: 'tourism.events'
    },
    'Safari & Africa': {
      name: 'Safari & Africa Discovery',
      description: 'Unique experiences in the heart of Africa. Lesotho, Botswana, and destinations we master — curated for an authentic experience.',
      image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      learnMoreLink: '/services/tourism-safari',
      translationKey: 'tourism.safari'
    },
    'Sports Tourism': {
      name: 'Sports Tourism',
      description: 'Travel built around your passion for sport. Marathons, tournaments, sporting events — we organize your entire trip.',
      image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      learnMoreLink: '/services/tourism-sports',
      translationKey: 'tourism.sports'
    },
    'Tourist Visa': {
      name: 'Tourist Visa Assistance',
      description: 'Streamlined tourist visa application support for hassle-free international travel.',
      image: 'https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      learnMoreLink: '/services/tourist-visa',
      translationKey: 'tourism.touristVisa'
    },
    'Flights & Stays': {
      name: 'Flights & Stays — Partner Platforms',
      description: 'For standard flight + hotel packages, we redirect you to our trusted partner platforms: Booking.com, Expedia, Skyscanner.',
      image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      learnMoreLink: '/services/tourism-partners',
      translationKey: 'tourism.flightsStays',
      isExternal: true
    }
  },
  orientation: {
    'School Orientation': {
      name: 'School Orientation',
      description: 'Personalized guidance to choose the right school, country, and program for your education abroad.',
      image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      learnMoreLink: '/services/orientation-study',
      translationKey: 'orientation.school'
    },
    'Career Orientation': {
      name: 'Career Orientation',
      description: 'Define your professional path with our career advisors. International job market insights, skills assessment and career planning.',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      learnMoreLink: '/services/orientation-career',
      translationKey: 'orientation.career'
    },
    'Training Orientation': {
      name: 'Training Orientation',
      description: 'Find the right professional training program, certification, or vocational course abroad matching your career goals.',
      image: 'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      learnMoreLink: '/services/orientation-training',
      translationKey: 'orientation.training'
    }
  },
  professional: {
    'Professional training finder': {
      name: 'Professional Training Finder',
      description: 'Access a curated selection of professional development courses and certification programs worldwide.',
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      learnMoreLink: '/services/training-finder',
      translationKey: 'professional.trainingFinder'
    },
    'Jobs finder': {
      name: 'Jobs Finder',
      description: 'Connect with international employers and find career opportunities matching your skills.',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      learnMoreLink: '/services/jobs-finder',
      translationKey: 'professional.jobsFinder'
    },
    'Work visa assistance': {
      name: 'Work Visa Assistance',
      description: 'Expert guidance through work permit and visa applications.',
      image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      learnMoreLink: '/services/work-visa',
      translationKey: 'professional.workVisa'
    },
    'Skills certification': {
      name: 'Skills Certification',
      description: 'Get your professional skills certified and recognized internationally.',
      image: 'https://images.unsplash.com/photo-1434626881859-194d67b2b86f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      learnMoreLink: '/services/skills-certification',
      translationKey: 'professional.skillsCertification'
    },
    'Insurance': {
      name: 'Insurance',
      description: 'Comprehensive insurance coverage for professional purposes.',
      image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      learnMoreLink: '/insurance',
      translationKey: 'professional.insurance'
    },
    'Language center': {
      name: 'Language Center',
      description: 'Quality language courses to enhance your professional communication skills.',
      image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      learnMoreLink: '/services/language-center',
      translationKey: 'professional.languageCenter'
    },
    'Flight booking': {
      name: 'Flight Booking',
      description: 'Convenient flight booking service with professional travel arrangements.',
      image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      learnMoreLink: '/flights',
      translationKey: 'professional.flightBooking'
    }
  },
  business: {
    'Business networking events': {
      name: 'Business Networking Events',
      description: 'Participate in curated business events to expand your professional network internationally.',
      image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      learnMoreLink: '/services/networking-events',
      translationKey: 'business.networkingEvents'
    },
    'Corporate accommodation': {
      name: 'Corporate Accommodation',
      description: 'Premium accommodation solutions for business travelers.',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      learnMoreLink: '/services/corporate-accommodation',
      translationKey: 'business.corporateAccommodation'
    },
    'Business visa assistance': {
      name: 'Business Visa Assistance',
      description: 'Expert support for business visa applications.',
      image: 'https://images.unsplash.com/photo-1434626881859-194d67b2b86f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      learnMoreLink: '/services/business-visa',
      translationKey: 'business.businessVisa'
    },
    'Transportation services': {
      name: 'Transportation Services',
      description: 'Reliable transportation solutions for business travelers.',
      image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      learnMoreLink: '/services/transportation',
      translationKey: 'business.transportation'
    },
    'Meeting venues': {
      name: 'Meeting Venues',
      description: 'Access to professional meeting spaces and conference facilities worldwide.',
      image: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      learnMoreLink: '/services/meeting-venues',
      translationKey: 'business.meetingVenues'
    },
    'Restaurant reservations': {
      name: 'Restaurant Reservations',
      description: 'Book tables at business-appropriate restaurants for client meetings.',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      learnMoreLink: '/services/business-restaurants',
      translationKey: 'business.restaurants'
    },
    'Insurance': {
      name: 'Insurance',
      description: 'Comprehensive insurance coverage for business travel.',
      image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      learnMoreLink: '/insurance',
      translationKey: 'business.insurance'
    },
    'Language center': {
      name: 'Language Center',
      description: 'Business communication skills development programs.',
      image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      learnMoreLink: '/services/language-center',
      translationKey: 'business.languageCenter'
    },
    'Flight booking': {
      name: 'Flight Booking',
      description: 'Premium flight booking with business class options.',
      image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      learnMoreLink: '/flights',
      translationKey: 'business.flightBooking'
    }
  }
};
