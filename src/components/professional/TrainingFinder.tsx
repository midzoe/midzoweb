import React, { useState } from 'react';
import { regions } from '../../data/regions';

interface Training {
  provider: string;
  country: string;
  course: string;
  duration: string;
  price: string;
  certification: string;
  rating: number;
  reviews: number;
  features: string[];
  image: string;
  description: string;
  category?: string;
}

const mockTrainings: Training[] = [
  {
    provider: "Global Tech Academy",
    country: "Germany",
    course: "Full Stack Development",
    duration: "6 months",
    price: "€5,000",
    certification: "Professional Developer Certificate",
    rating: 4.8,
    reviews: 450,
    features: [
      "Industry Expert Instructors",
      "Project-Based Learning",
      "Career Support",
      "Internship Placement"
    ],
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    description: "Comprehensive full stack development program with focus on modern technologies.",
    category: "Technology"
  },
  {
    provider: "Medical Training Institute",
    country: "United Kingdom",
    course: "Nursing Assistant Program",
    duration: "12 months",
    price: "£8,000",
    certification: "Certified Nursing Assistant",
    rating: 4.9,
    reviews: 320,
    features: [
      "Hands-on Clinical Training",
      "Patient Care Techniques",
      "Medical Ethics",
      "Hospital Placement",
      "Emergency Response Training"
    ],
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    description: "Comprehensive nursing assistant program with extensive practical training and hospital placement.",
    category: "Healthcare"
  },
  {
    provider: "European Medical Academy",
    country: "Germany",
    course: "Emergency Medical Technician",
    duration: "9 months",
    price: "€7,500",
    certification: "EMT Professional Certificate",
    rating: 4.8,
    reviews: 275,
    features: [
      "Advanced Life Support Training",
      "Emergency Response Protocols",
      "Medical Equipment Operation",
      "Clinical Rotations",
      "Ambulance Service Training"
    ],
    image: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    description: "Professional EMT training program with focus on emergency medical care and response.",
    category: "Healthcare"
  },
  {
    provider: "Healthcare Training Center",
    country: "France",
    course: "Medical Laboratory Technician",
    duration: "15 months",
    price: "€9,000",
    certification: "Medical Lab Tech Certificate",
    rating: 4.7,
    reviews: 190,
    features: [
      "Laboratory Techniques",
      "Sample Analysis",
      "Quality Control Procedures",
      "Medical Testing Equipment",
      "Clinical Laboratory Practice"
    ],
    image: "https://images.unsplash.com/photo-1579165466741-7f35e4755660?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    description: "Comprehensive training in medical laboratory procedures and techniques.",
    category: "Healthcare"
  },
  {
    provider: "Business Excellence Institute",
    country: "France",
    course: "Digital Marketing",
    duration: "3 months",
    price: "€3,500",
    certification: "Digital Marketing Professional",
    rating: 4.7,
    reviews: 320,
    features: [
      "Real Campaign Experience",
      "Industry Tools Training",
      "Portfolio Development",
      "Networking Events"
    ],
    image: "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    description: "Advanced digital marketing program covering latest trends and strategies.",
    category: "Business"
  },
  {
    provider: "Innovation Hub",
    country: "United Kingdom",
    course: "Data Science",
    duration: "8 months",
    price: "£6,000",
    certification: "Data Science Professional",
    rating: 4.9,
    reviews: 580,
    features: [
      "Machine Learning",
      "Big Data Analytics",
      "Python Programming",
      "Industry Projects"
    ],
    image: "https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    description: "Comprehensive data science program with focus on practical applications.",
    category: "Technology"
  },
  {
    provider: "Medical Skills Institute",
    country: "Spain",
    course: "Pharmacy Technician",
    duration: "12 months",
    price: "€8,500",
    certification: "Certified Pharmacy Technician",
    rating: 4.8,
    reviews: 230,
    features: [
      "Pharmaceutical Calculations",
      "Medication Dispensing",
      "Pharmacy Law and Ethics",
      "Inventory Management",
      "Clinical Pharmacy Practice"
    ],
    image: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    description: "Complete pharmacy technician training with hands-on experience in clinical settings.",
    category: "Healthcare"
  }
];

const TrainingFinder: React.FC = () => {
  const [country, setCountry] = useState<string>("");
  const [course, setCourse] = useState<string>("");
  const [duration, setDuration] = useState<string>("");
  const [priceRange, setPriceRange] = useState<string>("");
  const [category, setCategory] = useState<string>("");

  const allCountries = regions.flatMap(region => region.countries).sort();
  const courses = [
    // Healthcare Courses
    "Nursing Assistant Program",
    "Emergency Medical Technician",
    "Medical Laboratory Technician",
    "Pharmacy Technician",
    // Technology Courses
    "Full Stack Development",
    "Data Science",
    "Cloud Computing",
    "Cybersecurity",
    // Business Courses
    "Digital Marketing",
    "Project Management",
    "Business Analytics",
    "Financial Management"
  ].sort();

  const categories = [
    "Healthcare",
    "Technology",
    "Business",
    "Education"
  ].sort();

  const durations = [
    "1-3 months",
    "3-6 months",
    "6-12 months",
    "Over 12 months"
  ];
  const priceRanges = [
    "Under €2,000",
    "€2,000-€5,000",
    "€5,000-€10,000",
    "Above €10,000"
  ];

  const filteredTrainings = mockTrainings.filter(training => {
    if (country && training.country !== country) return false;
    if (course && training.course !== course) return false;
    if (category && training.category !== category) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-primary mb-8">Professional Training Finder</h1>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
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
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course
              </label>
              <select
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              >
                <option value="">All Courses</option>
                {courses.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              >
                <option value="">All Durations</option>
                {durations.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range
              </label>
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              >
                <option value="">All Ranges</option>
                {priceRanges.map(range => (
                  <option key={range} value={range}>{range}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrainings.length > 0 ? (
            filteredTrainings.map((training, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="relative h-48">
                  <img
                    src={training.image}
                    alt={training.course}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-medium text-primary">
                    {training.price}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-primary mb-2">{training.course}</h3>
                      <p className="text-gray-600">{training.provider} - {training.country}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      training.category === 'Healthcare' ? 'bg-blue-100 text-blue-800' :
                      training.category === 'Technology' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {training.category}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{training.description}</p>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Duration:</span> {training.duration}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Certification:</span> {training.certification}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Rating:</span> {training.rating}/5.0 ({training.reviews} reviews)
                    </p>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Features:</span>
                      <ul className="list-disc list-inside mt-1">
                        {training.features.map((feature, idx) => (
                          <li key={idx}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <button className="mt-4 w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors">
                    Enroll Now
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500 text-lg">No training programs found matching your criteria. Please adjust your filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainingFinder;