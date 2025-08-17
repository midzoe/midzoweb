interface QuickFact {
  title: string;
  value: string;
}

interface Tradition {
  name: string;
  description: string;
  image: string;
}

interface Cuisine {
  name: string;
  description: string;
  image: string;
}

interface Place {
  name: string;
  description: string;
  image: string;
}

interface CountryDetail {
  heroImage: string;
  motto: string;
  quickFacts: QuickFact[];
  history: string;
  culturalImage: string;
  traditions: Tradition[];
  cuisine: Cuisine[];
  modernLife: string;
  trends: string[];
  modernImage: string;
  places: Place[];
}

export const countryDetails: { [key: string]: CountryDetail } = {
  "France": {
    heroImage: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
    motto: "Liberty, Equality, Fraternity",
    quickFacts: [
      { title: "Capital", value: "Paris" },
      { title: "Language", value: "French" },
      { title: "Population", value: "67 million" },
      { title: "Currency", value: "Euro (€)" }
    ],
    history: "France has a rich history spanning over two millennia, from ancient Roman Gaul to the powerful French monarchy, the French Revolution, and its current position as a leading global power. The country has been at the forefront of European art, science, and culture for centuries.",
    culturalImage: "https://images.unsplash.com/photo-1543349689-9a4d426bee8e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    traditions: [
      {
        name: "Bastille Day",
        description: "Annual celebration of the French Revolution with parades, fireworks, and festivities.",
        image: "https://images.unsplash.com/photo-1534551767192-78b8dd45b51b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      },
      {
        name: "Wine Harvest Festival",
        description: "Traditional celebration of grape harvest season in wine-producing regions.",
        image: "https://images.unsplash.com/photo-1516594798947-e65505dbb29d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      },
      {
        name: "Christmas Markets",
        description: "Traditional winter markets featuring local crafts, food, and festive atmosphere.",
        image: "https://images.unsplash.com/photo-1512389142860-9c449e58a543?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      }
    ],
    cuisine: [
      {
        name: "Croissants",
        description: "Flaky, buttery pastries that are a staple of French breakfast.",
        image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      },
      {
        name: "Coq au Vin",
        description: "Traditional dish of chicken braised in wine, lardons, mushrooms, and garlic.",
        image: "https://images.unsplash.com/photo-1600891964092-4316c288032e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      },
      {
        name: "Macarons",
        description: "Colorful meringue-based sandwich cookies with various flavored fillings.",
        image: "https://images.unsplash.com/photo-1569864358642-9d1684040f43?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      }
    ],
    modernLife: "Modern France blends traditional values with contemporary lifestyle. The country maintains its reputation for fashion, gastronomy, and art while embracing innovation in technology and sustainable living.",
    trends: [
      "Growing focus on sustainable fashion and eco-friendly practices",
      "Rise of modern French cuisine fusion",
      "Expanding startup and tech scene",
      "Emphasis on work-life balance"
    ],
    modernImage: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    places: [
      {
        name: "Eiffel Tower",
        description: "Iconic iron lattice tower on the Champ de Mars in Paris.",
        image: "https://images.unsplash.com/photo-1543349689-9a4d426bee8e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      },
      {
        name: "Palace of Versailles",
        description: "Opulent royal château and gardens that symbolize French monarchy.",
        image: "https://images.unsplash.com/photo-1524396309943-e03f5249f002?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      },
      {
        name: "Mont Saint-Michel",
        description: "Medieval monastery perched on a tidal island in Normandy.",
        image: "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      }
    ]
  },
  "Italy": {
    heroImage: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
    motto: "L'Italia è cultura (Italy is culture)",
    quickFacts: [
      { title: "Capital", value: "Rome" },
      { title: "Language", value: "Italian" },
      { title: "Population", value: "60 million" },
      { title: "Currency", value: "Euro (€)" }
    ],
    history: "Italy's rich history spans from the Roman Empire through the Renaissance to modern times. The country has been a cradle of Western civilization, art, and culture, influencing the world through its contributions to architecture, art, fashion, and cuisine.",
    culturalImage: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    traditions: [
      {
        name: "Carnevale",
        description: "Pre-Lenten carnival with elaborate masks and costumes, especially famous in Venice.",
        image: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      },
      {
        name: "Palio di Siena",
        description: "Historic horse race held twice each summer in Siena's main square.",
        image: "https://images.unsplash.com/photo-1568822617270-2c1579f8dfe2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      },
      {
        name: "Opera",
        description: "Traditional Italian art form combining music and drama.",
        image: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      }
    ],
    cuisine: [
      {
        name: "Pizza Napoletana",
        description: "Traditional Neapolitan pizza with simple, fresh ingredients.",
        image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      },
      {
        name: "Pasta alla Carbonara",
        description: "Classic Roman pasta dish with eggs, pecorino cheese, guanciale, and black pepper.",
        image: "https://images.unsplash.com/photo-1612874742237-6526221588e3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      },
      {
        name: "Gelato",
        description: "Italian-style ice cream made with high-quality ingredients.",
        image: "https://images.unsplash.com/photo-1557142046-c704a3adf364?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      }
    ],
    modernLife: "Modern Italy balances its rich historical heritage with contemporary innovation in fashion, design, and technology. The country maintains its reputation for style, craftsmanship, and la dolce vita while embracing modern developments.",
    trends: [
      "Sustainable fashion initiatives",
      "Slow food movement",
      "Digital innovation in traditional industries",
      "Green tourism development"
    ],
    modernImage: "https://images.unsplash.com/photo-1534445867742-43195f401b6c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    places: [
      {
        name: "Colosseum",
        description: "Ancient amphitheater and icon of Rome.",
        image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      },
      {
        name: "Venice Canals",
        description: "Historic waterways and gondolas of Venice.",
        image: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      },
      {
        name: "Tuscany",
        description: "Rolling hills, vineyards, and historic villages.",
        image: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      }
    ]
  }
};