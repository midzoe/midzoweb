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
  "United Kingdom": {
    heroImage: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
    motto: "Dieu et mon droit",
    quickFacts: [
      { title: "Capital", value: "London" },
      { title: "Language", value: "English" },
      { title: "Population", value: "67 million" },
      { title: "Currency", value: "Pound Sterling (£)" }
    ],
    history: "The United Kingdom has a rich history spanning from ancient Celtic settlements through Roman occupation, the Norman Conquest of 1066, the British Empire, and two World Wars, to its current role as a leading global democracy and cultural power.",
    culturalImage: "https://images.unsplash.com/photo-1486299267070-83823f5448dd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    traditions: [
      {
        name: "Changing of the Guard",
        description: "Ceremonial military tradition at Buckingham Palace, a symbol of the British monarchy.",
        image: "https://images.unsplash.com/photo-1529655683826-aba9b3e77383?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      },
      {
        name: "Afternoon Tea",
        description: "A beloved British tradition of tea served with scones, sandwiches, and cakes in the afternoon.",
        image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      },
      {
        name: "Guy Fawkes Night",
        description: "Annual bonfire and fireworks celebration on November 5th commemorating the Gunpowder Plot of 1605.",
        image: "https://images.unsplash.com/photo-1467810563316-b5476525c0f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      }
    ],
    cuisine: [
      {
        name: "Fish and Chips",
        description: "Iconic British dish of battered fried fish served with thick-cut chips.",
        image: "https://images.unsplash.com/photo-1579223668893-72f9b21e5b9f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      },
      {
        name: "Sunday Roast",
        description: "Traditional weekly meal of roasted meat, potatoes, vegetables, and Yorkshire pudding.",
        image: "https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      },
      {
        name: "Scones",
        description: "Classic British baked goods served with clotted cream and jam, a staple of afternoon tea.",
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      }
    ],
    modernLife: "Modern Britain is a vibrant multicultural society that balances deep-rooted traditions with cutting-edge innovation. London is a global hub for finance, fashion, arts, and technology, while the rest of the country thrives in creativity and enterprise.",
    trends: [
      "Thriving tech and fintech startup ecosystem in London",
      "Sustainable living and green energy investment",
      "Multicultural cuisine and food scene growth",
      "University innovation and research excellence"
    ],
    modernImage: "https://images.unsplash.com/photo-1505761671935-60b3a7427bad?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    places: [
      {
        name: "Big Ben & Houses of Parliament",
        description: "Iconic Gothic Revival parliament buildings on the Thames in Westminster.",
        image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      },
      {
        name: "Buckingham Palace",
        description: "Official residence of the British monarch and a major tourist landmark.",
        image: "https://images.unsplash.com/photo-1520986606214-8b456906c813?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      },
      {
        name: "Stonehenge",
        description: "Prehistoric monument on Salisbury Plain, one of the world's most famous archaeological sites.",
        image: "https://images.unsplash.com/photo-1599833975787-5c143f373c30?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      }
    ]
  },
  "United States": {
    heroImage: "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
    motto: "In God We Trust",
    quickFacts: [
      { title: "Capital", value: "Washington D.C." },
      { title: "Language", value: "English" },
      { title: "Population", value: "331 million" },
      { title: "Currency", value: "US Dollar ($)" }
    ],
    history: "The United States was founded in 1776 after declaring independence from Britain. It expanded westward throughout the 19th century, survived a Civil War, emerged as a global superpower after World War II, and continues to lead in innovation, culture, and international affairs.",
    culturalImage: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    traditions: [
      {
        name: "Thanksgiving",
        description: "Annual harvest festival celebrated on the fourth Thursday of November with family gatherings and feasting.",
        image: "https://images.unsplash.com/photo-1574226516831-e1dff420e562?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      },
      {
        name: "Fourth of July",
        description: "Independence Day celebration with fireworks, parades, and barbecues across the country.",
        image: "https://images.unsplash.com/photo-1467810563316-b5476525c0f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      },
      {
        name: "Halloween",
        description: "Spooky celebration on October 31st with costumes, trick-or-treating, and pumpkin carving.",
        image: "https://images.unsplash.com/photo-1572985025058-e8e2b4f3d6b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      }
    ],
    cuisine: [
      {
        name: "Burgers",
        description: "The classic American hamburger, a cultural icon found from diners to gourmet restaurants.",
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      },
      {
        name: "BBQ Ribs",
        description: "Slow-smoked barbecue ribs with regional variations from Texas to Memphis to the Carolinas.",
        image: "https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      },
      {
        name: "Apple Pie",
        description: "Quintessential American dessert made with spiced apple filling in a flaky pastry crust.",
        image: "https://images.unsplash.com/photo-1535920527002-b35e96722eb9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      }
    ],
    modernLife: "The United States is a global leader in technology, entertainment, and innovation. Silicon Valley drives the digital economy, Hollywood shapes world culture, and world-class universities attract students from across the globe.",
    trends: [
      "Leading innovation in AI, tech, and space exploration",
      "Diverse and rapidly growing startup ecosystem",
      "Expanding renewable energy and sustainability focus",
      "Cultural diversity driving creative industries"
    ],
    modernImage: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    places: [
      {
        name: "Grand Canyon",
        description: "Stunning natural wonder carved by the Colorado River in Arizona.",
        image: "https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      },
      {
        name: "Statue of Liberty",
        description: "Iconic symbol of freedom and democracy in New York Harbor.",
        image: "https://images.unsplash.com/photo-1485738422979-f5c462d49f74?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      },
      {
        name: "Yellowstone National Park",
        description: "World's first national park, famous for geysers, hot springs, and wildlife.",
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      }
    ]
  },
  "Canada": {
    heroImage: "https://images.unsplash.com/photo-1534430480872-3498386e7856?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
    motto: "A Mari Usque Ad Mare",
    quickFacts: [
      { title: "Capital", value: "Ottawa" },
      { title: "Language", value: "English & French" },
      { title: "Population", value: "38 million" },
      { title: "Currency", value: "Canadian Dollar (CAD)" }
    ],
    history: "Canada's history spans thousands of years of Indigenous cultures, followed by French and British colonization, Confederation in 1867, and its growth into a prosperous bilingual, multicultural nation known for peacekeeping and humanitarian values.",
    culturalImage: "https://images.unsplash.com/photo-1517935706615-2717063c2225?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    traditions: [
      {
        name: "Canada Day",
        description: "National day celebrated on July 1st with fireworks, parades, and festivities marking Confederation in 1867.",
        image: "https://images.unsplash.com/photo-1467810563316-b5476525c0f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      },
      {
        name: "Maple Syrup Festival",
        description: "Spring celebration of Canada's iconic maple syrup harvest in sugar bush forests.",
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      },
      {
        name: "Caribana",
        description: "Toronto's vibrant Caribbean festival, one of North America's largest cultural celebrations.",
        image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      }
    ],
    cuisine: [
      {
        name: "Poutine",
        description: "Canadian comfort food of french fries topped with cheese curds and rich gravy.",
        image: "https://images.unsplash.com/photo-1600891964092-4316c288032e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      },
      {
        name: "Maple Syrup",
        description: "Canada produces over 70% of the world's maple syrup, used in everything from pancakes to glazes.",
        image: "https://images.unsplash.com/photo-1551529834-525807d6b4f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      },
      {
        name: "Butter Tarts",
        description: "Traditional Canadian pastry with a flaky shell filled with sweet buttery custard.",
        image: "https://images.unsplash.com/photo-1509461399763-ae67a981b254?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      }
    ],
    modernLife: "Canada is celebrated for its high quality of life, multiculturalism, and stunning natural landscapes. Its cities rank among the world's most livable, with strong public services, a welcoming immigration policy, and thriving tech and creative industries.",
    trends: [
      "Growing AI and tech hub in Toronto and Vancouver",
      "Strong commitment to environmental conservation",
      "Multicultural society embracing diversity",
      "World-leading universities attracting global students"
    ],
    modernImage: "https://images.unsplash.com/photo-1559511260-66a654ae982a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    places: [
      {
        name: "Niagara Falls",
        description: "Spectacular waterfall system on the border of Ontario and New York, one of the world's most visited natural wonders.",
        image: "https://images.unsplash.com/photo-1489447068241-b3490214e879?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      },
      {
        name: "Banff National Park",
        description: "Breathtaking Rocky Mountain park in Alberta with turquoise lakes and dramatic peaks.",
        image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      },
      {
        name: "Old Quebec City",
        description: "UNESCO-listed historic fortified city with French colonial architecture and cobblestone streets.",
        image: "https://images.unsplash.com/photo-1517935706615-2717063c2225?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      }
    ]
  },
  "Germany": {
    heroImage: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
    motto: "Einigkeit und Recht und Freiheit",
    quickFacts: [
      { title: "Capital", value: "Berlin" },
      { title: "Language", value: "German" },
      { title: "Population", value: "83 million" },
      { title: "Currency", value: "Euro (€)" }
    ],
    history: "Germany's history spans from the Germanic tribes of antiquity, through the Holy Roman Empire, the unification under Bismarck in 1871, two World Wars, division into East and West, and reunification in 1990 to become Europe's largest economy and a pillar of the European Union.",
    culturalImage: "https://images.unsplash.com/photo-1559329373-c4b1a5dac0d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    traditions: [
      {
        name: "Oktoberfest",
        description: "World-famous annual beer festival held in Munich, celebrating Bavarian culture with food, music, and beer.",
        image: "https://images.unsplash.com/photo-1536184025026-0f2d5e9b8a6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      },
      {
        name: "Christmas Markets",
        description: "Traditional Weihnachtsmärkte held across Germany, filled with crafts, mulled wine, and festive lights.",
        image: "https://images.unsplash.com/photo-1512389142860-9c449e58a543?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      },
      {
        name: "Carnival (Karneval)",
        description: "Colorful pre-Lenten festival celebrated in Cologne and Düsseldorf with parades and costumes.",
        image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      }
    ],
    cuisine: [
      {
        name: "Bratwurst",
        description: "Grilled pork sausage, a staple of German cuisine served at markets and festivals nationwide.",
        image: "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      },
      {
        name: "Schnitzel",
        description: "Thin breaded and pan-fried meat cutlet, a beloved German classic served with lemon and potatoes.",
        image: "https://images.unsplash.com/photo-1600891964092-4316c288032e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      },
      {
        name: "Black Forest Cake",
        description: "Iconic German dessert of chocolate sponge, cherries, and whipped cream from the Schwarzwald region.",
        image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      }
    ],
    modernLife: "Modern Germany is Europe's economic powerhouse, renowned for engineering excellence, automotive innovation, and a strong social market economy. Berlin has also emerged as a world-class hub for startups, arts, and nightlife.",
    trends: [
      "Leading Europe's green energy and Energiewende transition",
      "Berlin's thriving startup and creative tech scene",
      "Engineering innovation in automotive and industrial sectors",
      "Strong social welfare system and work-life balance culture"
    ],
    modernImage: "https://images.unsplash.com/photo-1560969184-10fe8719e047?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    places: [
      {
        name: "Brandenburg Gate",
        description: "Neoclassical landmark in Berlin, symbol of German reunification and European unity.",
        image: "https://images.unsplash.com/photo-1467269204594-9661b134dd2b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      },
      {
        name: "Neuschwanstein Castle",
        description: "Fairy-tale Romanesque Revival castle in Bavaria, inspiring Walt Disney's Sleeping Beauty castle.",
        image: "https://images.unsplash.com/photo-1560969184-10fe8719e047?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      },
      {
        name: "Black Forest",
        description: "Dense forested mountain range in southwest Germany, rich in folklore and natural beauty.",
        image: "https://images.unsplash.com/photo-1559329373-c4b1a5dac0d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      }
    ]
  },
  "Netherlands": {
    heroImage: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
    motto: "Je maintiendrai",
    quickFacts: [
      { title: "Capital", value: "Amsterdam" },
      { title: "Language", value: "Dutch" },
      { title: "Population", value: "17 million" },
      { title: "Currency", value: "Euro (€)" }
    ],
    history: "The Netherlands has a rich maritime history as a global trading power in the 17th-century Golden Age. Known for its fight against water through innovative engineering, it has grown into a progressive, open society and one of Europe's most prosperous nations.",
    culturalImage: "https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    traditions: [
      {
        name: "King's Day",
        description: "National celebration on April 27th when the Dutch dress in orange and fill the streets with outdoor markets and parties.",
        image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      },
      {
        name: "Tulip Festival",
        description: "Annual spring festival celebrating the Netherlands' iconic tulip fields and flower industry.",
        image: "https://images.unsplash.com/photo-1490750967868-88df5691cc30?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      },
      {
        name: "Sinterklaas",
        description: "Traditional Dutch winter festival celebrating the arrival of Sinterklaas with gifts and pepernoten.",
        image: "https://images.unsplash.com/photo-1512389142860-9c449e58a543?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      }
    ],
    cuisine: [
      {
        name: "Stroopwafel",
        description: "Iconic Dutch caramel waffle cookie made from two thin waffles sandwiching a syrup filling.",
        image: "https://images.unsplash.com/photo-1509461399763-ae67a981b254?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      },
      {
        name: "Haring",
        description: "Traditional Dutch raw herring eaten with onions and pickles, a street food staple.",
        image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      },
      {
        name: "Dutch Cheese",
        description: "World-famous cheeses including Gouda and Edam, enjoyed worldwide and sold in traditional markets.",
        image: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      }
    ],
    modernLife: "The Netherlands is celebrated for its progressive values, cycling culture, and innovative design. Amsterdam is a global tech and startup hub while the country leads in water management, sustainable agriculture, and international trade.",
    trends: [
      "World leader in circular economy and sustainability",
      "Cycling infrastructure as a model for cities worldwide",
      "Thriving tech startup scene in Amsterdam and Eindhoven",
      "Innovative water management and climate adaptation"
    ],
    modernImage: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    places: [
      {
        name: "Anne Frank House",
        description: "Historic museum in Amsterdam where Anne Frank wrote her famous diary during WWII.",
        image: "https://images.unsplash.com/photo-1534351590666-13e3e96b5017?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      },
      {
        name: "Keukenhof Gardens",
        description: "World's largest flower garden showcasing millions of tulips, daffodils, and hyacinths each spring.",
        image: "https://images.unsplash.com/photo-1490750967868-88df5691cc30?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      },
      {
        name: "Kinderdijk Windmills",
        description: "UNESCO-listed network of 19 historic windmills, an iconic symbol of Dutch water management.",
        image: "https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      }
    ]
  },
  "Spain": {
    heroImage: "https://images.unsplash.com/photo-1543783207-ec64e4d95325?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
    motto: "Plus Ultra",
    quickFacts: [
      { title: "Capital", value: "Madrid" },
      { title: "Language", value: "Spanish" },
      { title: "Population", value: "47 million" },
      { title: "Currency", value: "Euro (€)" }
    ],
    history: "Spain's history includes ancient Iberian civilizations, Roman conquest, Moorish rule for nearly 800 years, the Reconquista, and the Spanish Empire that shaped the Americas. Today Spain is a vibrant democracy and major European cultural force.",
    culturalImage: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    traditions: [
      {
        name: "La Tomatina",
        description: "World's biggest tomato fight held in Buñol each August, attracting thousands of participants.",
        image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      },
      {
        name: "Flamenco",
        description: "Passionate Spanish dance and music art form originating in Andalusia, a UNESCO cultural heritage.",
        image: "https://images.unsplash.com/photo-1518998053901-5348d3961a04?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      },
      {
        name: "San Fermín (Running of the Bulls)",
        description: "Famous festival in Pamplona featuring the iconic bull run through the city's streets each July.",
        image: "https://images.unsplash.com/photo-1536184025026-0f2d5e9b8a6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      }
    ],
    cuisine: [
      {
        name: "Paella",
        description: "Iconic Spanish rice dish from Valencia, cooked with saffron, vegetables, and seafood or meat.",
        image: "https://images.unsplash.com/photo-1534080564583-6be75777b70a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      },
      {
        name: "Tapas",
        description: "Small savory dishes shared among friends — from patatas bravas to jamón ibérico — a social dining tradition.",
        image: "https://images.unsplash.com/photo-1515443961218-a51367888e4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      },
      {
        name: "Churros",
        description: "Fried dough pastry served with thick hot chocolate, a beloved Spanish breakfast and street snack.",
        image: "https://images.unsplash.com/photo-1624300629298-e9de39c13be5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      }
    ],
    modernLife: "Modern Spain is a dynamic country blending tradition with innovation. Barcelona and Madrid are world-class cities for architecture, fashion, and gastronomy, while Spain's beaches and warm climate attract millions of tourists each year.",
    trends: [
      "Booming tourism and hospitality industry",
      "Growing renewable energy sector — solar and wind leader in Europe",
      "Vibrant arts and architecture scene",
      "Startup growth in Barcelona and Madrid tech hubs"
    ],
    modernImage: "https://images.unsplash.com/photo-1543783207-ec64e4d95325?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    places: [
      {
        name: "Sagrada Família",
        description: "Gaudí's extraordinary unfinished basilica in Barcelona, a UNESCO World Heritage Site.",
        image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      },
      {
        name: "Alhambra",
        description: "Stunning Moorish palace and fortress complex in Granada, a masterpiece of Islamic architecture.",
        image: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      },
      {
        name: "Park Güell",
        description: "Colorful public park in Barcelona designed by Gaudí, filled with mosaic sculptures and terraces.",
        image: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      }
    ]
  },
  "Sweden": {
    heroImage: "https://images.unsplash.com/photo-1509356843151-3e7d96241e11?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
    motto: "För Sverige – i tiden",
    quickFacts: [
      { title: "Capital", value: "Stockholm" },
      { title: "Language", value: "Swedish" },
      { title: "Population", value: "10 million" },
      { title: "Currency", value: "Swedish Krona (SEK)" }
    ],
    history: "Sweden has a history spanning Viking Age exploration, a powerful medieval kingdom, and the Swedish Empire of the 17th century. Today it is a model welfare state known for innovation, gender equality, and a high standard of living.",
    culturalImage: "https://images.unsplash.com/photo-1518606372722-b8f0f3e83185?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    traditions: [
      {
        name: "Midsommar",
        description: "Sweden's most beloved festival celebrating the summer solstice with dancing, flower crowns, and traditional songs.",
        image: "https://images.unsplash.com/photo-1490750967868-88df5691cc30?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      },
      {
        name: "Saint Lucia Day",
        description: "Celebration on December 13th where a girl dressed in white with candles in her crown leads a procession.",
        image: "https://images.unsplash.com/photo-1512389142860-9c449e58a543?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      },
      {
        name: "Walpurgis Night",
        description: "Traditional spring celebration on April 30th with bonfires and student choirs welcoming the coming of spring.",
        image: "https://images.unsplash.com/photo-1467810563316-b5476525c0f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      }
    ],
    cuisine: [
      {
        name: "Swedish Meatballs",
        description: "Classic dish of seasoned pork and beef meatballs served with creamy gravy, lingonberry jam, and mashed potatoes.",
        image: "https://images.unsplash.com/photo-1600891964092-4316c288032e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      },
      {
        name: "Gravlax",
        description: "Traditional cured salmon marinated with dill, salt, and sugar, served as a classic Nordic appetizer.",
        image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      },
      {
        name: "Kanelbullar",
        description: "Swedish cinnamon rolls, a beloved fika staple enjoyed with coffee throughout the day.",
        image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      }
    ],
    modernLife: "Sweden is a global leader in sustainability, innovation, and quality of life. Stockholm is one of Europe's top startup cities, home to Spotify, IKEA, and Volvo. The Swedish concept of 'lagom' — balance and moderation — shapes daily life.",
    trends: [
      "World leader in sustainability and clean technology",
      "Thriving startup ecosystem (Spotify, King, Klarna born here)",
      "Fika culture promoting work-life balance",
      "Strong focus on gender equality and social welfare"
    ],
    modernImage: "https://images.unsplash.com/photo-1509356843151-3e7d96241e11?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    places: [
      {
        name: "Stockholm Old Town (Gamla Stan)",
        description: "Medieval island city center with colorful 17th-century buildings, cobblestone streets, and royal palace.",
        image: "https://images.unsplash.com/photo-1518606372722-b8f0f3e83185?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      },
      {
        name: "Northern Lights in Lapland",
        description: "Spectacular aurora borealis visible in northern Sweden, best seen from Abisko National Park.",
        image: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      },
      {
        name: "Vasa Museum",
        description: "Extraordinary Stockholm museum housing a fully preserved 17th-century warship that sank on its maiden voyage.",
        image: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      }
    ]
  },
  "Switzerland": {
    heroImage: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
    motto: "Unus pro omnibus, omnes pro uno",
    quickFacts: [
      { title: "Capital", value: "Bern" },
      { title: "Language", value: "German, French, Italian, Romansh" },
      { title: "Population", value: "8.5 million" },
      { title: "Currency", value: "Swiss Franc (CHF)" }
    ],
    history: "Switzerland's history began with the Federal Charter of 1291, forming one of the world's oldest democracies. Its long tradition of neutrality, humanitarian leadership (home of the Red Cross), and banking excellence has made it one of the world's most prosperous nations.",
    culturalImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    traditions: [
      {
        name: "Swiss National Day",
        description: "Celebrated on August 1st with bonfires, fireworks, and speeches commemorating the 1291 Federal Charter.",
        image: "https://images.unsplash.com/photo-1467810563316-b5476525c0f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      },
      {
        name: "Fasnacht",
        description: "Basel's extraordinary carnival with elaborate costumes, lantern processions, and drum and fife music.",
        image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      },
      {
        name: "Alpabzug (Cow Parade)",
        description: "Traditional autumn procession of decorated cows descending from Alpine pastures to valley farms.",
        image: "https://images.unsplash.com/photo-1474511320723-9a56873867b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      }
    ],
    cuisine: [
      {
        name: "Fondue",
        description: "Melted Swiss cheese dip served with bread, a beloved communal dish from the Alpine regions.",
        image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      },
      {
        name: "Raclette",
        description: "Melted cheese scraped over potatoes, pickles, and charcuterie — a traditional Swiss Alpine dinner.",
        image: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      },
      {
        name: "Swiss Chocolate",
        description: "World-renowned Swiss chocolate, perfected since the 19th century by brands like Lindt, Toblerone, and Nestlé.",
        image: "https://images.unsplash.com/photo-1548907040-4baa42d10919?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      }
    ],
    modernLife: "Switzerland consistently tops global rankings for quality of life, innovation, and competitiveness. It is home to major international organizations, leading pharmaceutical companies, and a world-class financial sector, all set against breathtaking Alpine scenery.",
    trends: [
      "Global hub for international diplomacy and organizations (UN, Red Cross)",
      "Leader in pharmaceutical and biotech research",
      "Innovation in precision engineering and watchmaking",
      "Sustainable Alpine tourism and eco-friendly transport"
    ],
    modernImage: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    places: [
      {
        name: "Matterhorn",
        description: "Iconic pyramid-shaped peak on the Swiss-Italian border, one of the most photographed mountains in the world.",
        image: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      },
      {
        name: "Lake Geneva",
        description: "Europe's largest Alpine lake, bordered by vineyards and the cities of Geneva and Lausanne.",
        image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      },
      {
        name: "Jungfrau Region",
        description: "Spectacular high Alpine area in the Bernese Oberland, home to glaciers, ski resorts, and panoramic railways.",
        image: "https://images.unsplash.com/photo-1559329373-c4b1a5dac0d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      }
    ]
  },
  "Portugal": {
    heroImage: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
    motto: "Esta é a ditosa pátria minha amada",
    quickFacts: [
      { title: "Capital", value: "Lisbon" },
      { title: "Language", value: "Portuguese" },
      { title: "Population", value: "10 million" },
      { title: "Currency", value: "Euro (€)" }
    ],
    history: "Portugal is one of the world's oldest nations, with a rich history of maritime exploration in the Age of Discovery. Portuguese explorers like Vasco da Gama opened sea routes to India and Brazil, building a global empire that shaped modern world history.",
    culturalImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    traditions: [
      {
        name: "Fado Music",
        description: "Soulful traditional Portuguese music expressing longing and melancholy, recognized as UNESCO intangible heritage.",
        image: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      },
      {
        name: "Santos Populares",
        description: "June popular saints festivals in Lisbon and Porto, with street parties, grilled sardines, and dancing.",
        image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      },
      {
        name: "Carnaval de Torres Vedras",
        description: "Portugal's most famous carnival, known for its satirical floats and vibrant street celebrations.",
        image: "https://images.unsplash.com/photo-1536184025026-0f2d5e9b8a6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      }
    ],
    cuisine: [
      {
        name: "Pastel de Nata",
        description: "Iconic Portuguese custard tart with a flaky pastry shell, best enjoyed warm with cinnamon.",
        image: "https://images.unsplash.com/photo-1509461399763-ae67a981b254?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      },
      {
        name: "Bacalhau",
        description: "Salt cod, the cornerstone of Portuguese cuisine with over 365 different preparation methods.",
        image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      },
      {
        name: "Francesinha",
        description: "Porto's famous sandwich layered with meats, covered in melted cheese and spicy tomato sauce.",
        image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      }
    ],
    modernLife: "Modern Portugal is a welcoming, safe country with a booming tourism industry and a growing tech startup scene. Lisbon and Porto have become major European destinations for digital nomads, expats, and students attracted by quality of life and affordable living.",
    trends: [
      "Lisbon emerging as a top European startup and tech hub",
      "Growing digital nomad and expat community",
      "Sustainable wine and food tourism in the Douro Valley",
      "Thriving surf and outdoor adventure tourism"
    ],
    modernImage: "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    places: [
      {
        name: "Belém Tower",
        description: "UNESCO-listed 16th-century fortified tower in Lisbon, a symbol of the Age of Discovery.",
        image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      },
      {
        name: "Sintra",
        description: "Fairy-tale hilltop town near Lisbon with colorful palaces and lush forested hills.",
        image: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      },
      {
        name: "Douro Valley",
        description: "UNESCO-listed terraced wine region along the Douro River, home to some of the world's finest port wine.",
        image: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      }
    ]
  },
  "China": {
    heroImage: "https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
    motto: "Serve the People",
    quickFacts: [
      { title: "Capital", value: "Beijing" },
      { title: "Language", value: "Mandarin Chinese" },
      { title: "Population", value: "1.4 billion" },
      { title: "Currency", value: "Chinese Yuan (CNY)" }
    ],
    history: "China is home to one of the world's oldest continuous civilizations, with over 5,000 years of history. From ancient dynasties like the Qin and Han to the modern People's Republic founded in 1949, China has shaped global culture, science, and trade throughout the ages.",
    culturalImage: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    traditions: [
      {
        name: "Chinese New Year",
        description: "The most important festival in China, celebrated with fireworks, dragon dances, red envelopes, and family feasts.",
        image: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      },
      {
        name: "Mid-Autumn Festival",
        description: "Harvest moon festival celebrated with mooncakes, lanterns, and family gatherings under the full moon.",
        image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      },
      {
        name: "Dragon Boat Festival",
        description: "Ancient festival honoring poet Qu Yuan with dragon boat races and sticky rice dumplings (zongzi).",
        image: "https://images.unsplash.com/photo-1536184025026-0f2d5e9b8a6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      }
    ],
    cuisine: [
      {
        name: "Peking Duck",
        description: "Beijing's most famous dish — crispy roasted duck served with thin pancakes, scallions, and hoisin sauce.",
        image: "https://images.unsplash.com/photo-1600891964092-4316c288032e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      },
      {
        name: "Dim Sum",
        description: "Cantonese tradition of small steamed and fried dumplings, buns, and rolls enjoyed with tea.",
        image: "https://images.unsplash.com/photo-1569864358642-9d1684040f43?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      },
      {
        name: "Hot Pot",
        description: "Communal Chinese meal of broth bubbling at the table, with diners cooking meats, vegetables, and noodles.",
        image: "https://images.unsplash.com/photo-1548507780-50c9bb84c5b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      }
    ],
    modernLife: "Modern China is the world's second-largest economy and a global leader in technology, manufacturing, and innovation. Cities like Shanghai and Shenzhen are futuristic megacities, while the country invests massively in AI, renewable energy, and infrastructure.",
    trends: [
      "World leader in AI, 5G, and electric vehicle technology",
      "Rapid urbanization and smart city development",
      "Growing middle class and consumer culture",
      "Massive investment in renewable energy and green infrastructure"
    ],
    modernImage: "https://images.unsplash.com/photo-1474181487882-5abf3f0ba6c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    places: [
      {
        name: "Great Wall of China",
        description: "Ancient defensive fortification stretching over 13,000 miles across northern China, a UNESCO World Heritage Site.",
        image: "https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      },
      {
        name: "Forbidden City",
        description: "Imperial palace complex in Beijing housing 980 buildings, home to Chinese emperors for 500 years.",
        image: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
      },
      {
        name: "West Lake, Hangzhou",
        description: "UNESCO-listed freshwater lake surrounded by temples, pagodas, and gardens, celebrated in Chinese poetry.",
        image: "https://images.unsplash.com/photo-1474481420756-a2b9c04f0d55?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
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