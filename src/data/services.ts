interface ServiceDetail {
  name: string;
  description: string;
  image: string;
  learnMoreLink: string;
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
      description: 'Find the perfect university match based on your academic interests, budget, and location preferences. Our comprehensive database includes thousands of institutions worldwide.',
      image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      learnMoreLink: '/services/university-finder'
    },
    'Document Legalization & Recognition': {
      name: 'Document Legalization & Recognition',
      description: 'Complete support for document legalization in your country and recognition in your destination country. From authentication to official recognition of your qualifications.',
      image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      learnMoreLink: '/services/document-legalization'
    },
    'Student accommodation': {
      name: 'Student Accommodation',
      description: 'Find safe and comfortable housing options near your university, from dormitories to shared apartments.',
      image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      learnMoreLink: '/services/student-accommodation'
    },
    'Student visa assistance': {
      name: 'Student Visa Assistance',
      description: 'Complete support throughout your student visa application process, from documentation to interview preparation.',
      image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      learnMoreLink: '/services/student-visa'
    },
    'Bank account': {
      name: 'Bank Account Setup',
      description: 'Assistance in opening a student bank account in your destination country, including documentation and bank selection guidance.',
      image: 'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      learnMoreLink: '/services/bank-account'
    },
    'Insurance': {
      name: 'Insurance',
      description: 'Comprehensive insurance coverage tailored to your needs, whether for study, travel, business, or professional purposes.',
      image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      learnMoreLink: '/insurance'
    },
    'Language center': {
      name: 'Language Center',
      description: 'Access to quality language courses and certification programs to enhance your language skills for academic success.',
      image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      learnMoreLink: '/services/language-center'
    },
    'Flight booking': {
      name: 'Flight Booking',
      description: 'Book your flights with special student rates and flexible options for international travel.',
      image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      learnMoreLink: '/flights'
    }
  },
  professional: {
    'Professional training finder': {
      name: 'Professional Training Finder',
      description: 'Access a curated selection of professional development courses and certification programs worldwide.',
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      learnMoreLink: '/services/training-finder'
    },
    'Jobs finder': {
      name: 'Jobs Finder',
      description: 'Connect with international employers and find career opportunities matching your skills and aspirations.',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      learnMoreLink: '/services/jobs-finder'
    },
    'Work visa assistance': {
      name: 'Work Visa Assistance',
      description: 'Expert guidance through work permit and visa applications, ensuring compliance with local regulations.',
      image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      learnMoreLink: '/services/work-visa'
    },
    'Skills certification': {
      name: 'Skills Certification',
      description: 'Get your professional skills certified and recognized internationally to enhance your career prospects.',
      image: 'https://images.unsplash.com/photo-1434626881859-194d67b2b86f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      learnMoreLink: '/services/skills-certification'
    },
    'Insurance': {
      name: 'Insurance',
      description: 'Comprehensive insurance coverage tailored to your needs, whether for study, travel, business, or professional purposes.',
      image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      learnMoreLink: '/insurance'
    },
    'Language center': {
      name: 'Language Center',
      description: 'Access to quality language courses and certification programs to enhance your professional communication skills.',
      image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      learnMoreLink: '/services/language-center'
    },
    'Flight booking': {
      name: 'Flight Booking',
      description: 'Convenient flight booking service with professional travel arrangements and flexible scheduling.',
      image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      learnMoreLink: '/flights'
    }
  },
  tourism: {
    'Accommodation finder': {
      name: 'Accommodation Finder',
      description: 'Find and book the perfect accommodation for your travel needs, from luxury hotels to cozy apartments.',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      learnMoreLink: '/services/accommodation'
    },
    'Flight booking': {
      name: 'Flight Booking',
      description: 'Access competitive airfare rates and convenient flight options to destinations worldwide.',
      image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      learnMoreLink: '/flights'
    },
    'Restaurant reservations': {
      name: 'Restaurant Reservations',
      description: 'Discover and book tables at the finest restaurants, from local cuisine to international dining.',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      learnMoreLink: '/services/restaurants'
    },
    'Tourist visa assistance': {
      name: 'Tourist Visa Assistance',
      description: 'Streamlined tourist visa application support for hassle-free international travel.',
      image: 'https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      learnMoreLink: '/services/tourist-visa'
    },
    'Travel insurance': {
      name: 'Travel Insurance',
      description: 'Comprehensive travel insurance coverage for peace of mind during your international adventures.',
      image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      learnMoreLink: '/services/travel-insurance'
    },
    'Tourist sites finder': {
      name: 'Tourist Sites Finder',
      description: 'Discover popular attractions, hidden gems, and must-visit locations at your travel destination.',
      image: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      learnMoreLink: '/services/tourist-sites'
    },
    'Insurance': {
      name: 'Insurance',
      description: 'Comprehensive insurance coverage tailored to your needs, whether for study, travel, business, or professional purposes.',
      image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      learnMoreLink: '/insurance'
    },
    'Language center': {
      name: 'Language Center',
      description: 'Access to quality language courses and basic communication skills for travelers.',
      image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      learnMoreLink: '/services/language-center'
    }
  },
  business: {
    'Business networking events': {
      name: 'Business Networking Events',
      description: 'Participate in curated business events to expand your professional network internationally.',
      image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      learnMoreLink: '/services/networking-events'
    },
    'Corporate accommodation': {
      name: 'Corporate Accommodation',
      description: 'Premium accommodation solutions for business travelers, with all necessary amenities for productive stays.',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      learnMoreLink: '/services/corporate-accommodation'
    },
    'Business visa assistance': {
      name: 'Business Visa Assistance',
      description: 'Expert support for business visa applications, ensuring smooth international business travel.',
      image: 'https://images.unsplash.com/photo-1434626881859-194d67b2b86f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      learnMoreLink: '/services/business-visa'
    },
    'Transportation services': {
      name: 'Transportation Services',
      description: 'Reliable transportation solutions for business travelers, from airport transfers to city navigation.',
      image: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      learnMoreLink: '/services/transportation'
    },
    'Meeting venues': {
      name: 'Meeting Venues',
      description: 'Access to professional meeting spaces and conference facilities worldwide.',
      image: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      learnMoreLink: '/services/meeting-venues'
    },
    'Restaurant reservations': {
      name: 'Restaurant Reservations',
      description: 'Book tables at business-appropriate restaurants for client meetings and corporate events.',
      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      learnMoreLink: '/services/business-restaurants'
    },
    'Insurance': {
      name: 'Insurance',
      description: 'Comprehensive insurance coverage tailored to your needs, whether for study, travel, business, or professional purposes.',
      image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      learnMoreLink: '/insurance'
    },
    'Language center': {
      name: 'Language Center',
      description: 'Access to quality language courses and business communication skills development programs.',
      image: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      learnMoreLink: '/services/language-center'
    },
    'Flight booking': {
      name: 'Flight Booking',
      description: 'Premium flight booking service with business class options and corporate travel arrangements.',
      image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      learnMoreLink: '/flights'
    }
  }
};