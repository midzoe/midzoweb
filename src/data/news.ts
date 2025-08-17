export interface NewsItem {
  id: number;
  title: string;
  description: string;
  category: string;
  image: string;
  date: string;
}

export const newsItems: NewsItem[] = [
  {
    id: 1,
    title: "New Student Visa Regulations for EU Countries",
    description: "Important changes to student visa requirements for European Union member states starting 2024.",
    category: "Study",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    date: "2023-08-15"
  },
  {
    id: 2,
    title: "Remote Work Opportunities Surge in Asia",
    description: "Tech companies in Southeast Asia are increasingly offering remote work positions to global talent.",
    category: "Professional",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    date: "2023-08-14"
  },
  {
    id: 3,
    title: "Sustainable Tourism Initiatives in South America",
    description: "New eco-friendly tourism programs launched across major South American destinations.",
    category: "Tourism",
    image: "https://images.unsplash.com/photo-1516815231560-8f41ec531527?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    date: "2023-08-13"
  },
  {
    id: 4,
    title: "African Business Hubs Expansion",
    description: "Major investments in business infrastructure across key African cities create new opportunities.",
    category: "Business",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    date: "2023-08-12"
  }
];