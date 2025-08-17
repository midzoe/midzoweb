import React, { useState } from 'react';
import { regions } from '../../data/regions';

interface LanguageCourse {
  provider: string;
  country: string;
  languages: string[];
  levels: string[];
  duration: string;
  price: string;
  features: string[];
  image: string;
  description: string;
}

const mockCourses: LanguageCourse[] = [
  {
    provider: "British Language Institute",
    country: "United Kingdom",
    languages: ["English"],
    levels: ["Beginner", "Intermediate", "Advanced"],
    duration: "4-12 weeks",
    price: "£200/week",
    features: ["Native Teachers", "Small Groups", "Certification"],
    image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    description: "Premier English language institute with experienced native speakers and modern teaching methods."
  },
  {
    provider: "Goethe Institut",
    country: "Germany",
    languages: ["German"],
    levels: ["A1", "A2", "B1", "B2", "C1"],
    duration: "8-16 weeks",
    price: "€180/week",
    features: ["Cultural Activities", "Online Platform", "Exam Preparation"],
    image: "https://images.unsplash.com/photo-1577985051167-0d49eec21977?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    description: "Official German language and cultural institute offering comprehensive language programs."
  },
  {
    provider: "Alliance Française",
    country: "France",
    languages: ["French"],
    levels: ["Beginner", "Intermediate", "Advanced"],
    duration: "6-24 weeks",
    price: "€190/week",
    features: ["Conversation Classes", "Cultural Workshops", "Official Certification"],
    image: "https://images.unsplash.com/photo-1505902987837-9e40ec37e607?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
    description: "Leading French language institution combining language learning with cultural immersion."
  }
];

const LanguageCenter: React.FC = () => {
  const [country, setCountry] = useState<string>("");
  const [language, setLanguage] = useState<string>("");
  const [level, setLevel] = useState<string>("");
  
  const allCountries = regions.flatMap(region => region.countries).sort();
  const languages = ["English", "German", "French", "Spanish", "Italian", "Chinese"];
  const levels = ["Beginner", "Intermediate", "Advanced", "A1", "A2", "B1", "B2", "C1", "C2"];

  const filteredCourses = mockCourses.filter(course => {
    if (country && course.country !== country) return false;
    if (language && !course.languages.includes(language)) return false;
    if (level && !course.levels.includes(level)) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-primary mb-8">Language Center</h1>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              >
                <option value="">All Countries</option>
                {allCountries.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              >
                <option value="">All Languages</option>
                {languages.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Level
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              >
                <option value="">All Levels</option>
                {levels.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={course.image}
                    alt={course.provider}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                  />
                  <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-medium text-primary">
                    {course.price}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-primary mb-2">{course.provider}</h3>
                  <p className="text-gray-600 mb-4">{course.country}</p>
                  <p className="text-gray-600 mb-4">{course.description}</p>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Languages:</span>{" "}
                      {course.languages.join(", ")}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Levels:</span>{" "}
                      {course.levels.join(", ")}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Duration:</span>{" "}
                      {course.duration}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Features:</span>{" "}
                      {course.features.join(", ")}
                    </p>
                  </div>
                  <button className="mt-4 w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors">
                    Enroll Now
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500 text-lg">No language courses found matching your criteria. Please adjust your filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LanguageCenter;