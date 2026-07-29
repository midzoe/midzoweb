import React, { useState } from 'react';
import { useCountries } from '../../hooks/useCountries';
import { useApiList } from '../../hooks/useApiList';
import { apiService } from '../../services/api';

// Formations servies par le backend (Training).
interface Training {
  id: number;
  provider: string;
  country: string;
  city?: string;
  course: string;
  duration?: string;
  price?: string;
  certification?: string;
  category?: string;
  rating?: number;
  reviews?: number;
  features?: string[];
  image?: string;
  description?: string;
  link?: string;
}

const TrainingFinder: React.FC = () => {
  const [country, setCountry] = useState<string>("");
  const [course, setCourse] = useState<string>("");
  const [duration, setDuration] = useState<string>("");
  const [priceRange, setPriceRange] = useState<string>("");
  const [category, setCategory] = useState<string>("");

  const { countries: allCountries } = useCountries();
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

  // Pays et catégorie sont filtrés côté serveur ; l'intitulé exact du cours est
  // affiné ici (l'API cherche « contient », le select attend une correspondance stricte).
  const { items: trainings, loading, error } = useApiList<Training>(
    () => apiService.getTrainings({ country, category }),
    [country, category],
    { errorMessage: 'Unable to load training programs. Please try again later.' }
  );

  const filteredTrainings = course
    ? trainings.filter(t => t.course === course)
    : trainings;

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

        {/* Loading / Error */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-gray-600">Loading training programs...</p>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Results */}
        {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrainings.length > 0 ? (
            filteredTrainings.map(training => (
              <div key={training.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                {training.image && (
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
                )}
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
                    {training.rating != null && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Rating:</span> {training.rating}/5.0 ({training.reviews} reviews)
                      </p>
                    )}
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Features:</span>
                      <ul className="list-disc list-inside mt-1">
                        {(training.features ?? []).map((feature, idx) => (
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
        )}
      </div>
    </div>
  );
};

export default TrainingFinder;