
import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useCountries } from '../../hooks/useCountries';
import { useApiList } from '../../hooks/useApiList';
import { apiService } from '../../services/api';

// Offres d'emploi servies par le backend (Job).
interface Job {
  id: number;
  title: string;
  company: string;
  country: string;
  city?: string;
  location: string;
  type: string;
  salary?: string;
  experience?: string;
  description?: string;
  requirements?: string[];
  benefits?: string[];
  applyUrl?: string;
  image?: string;
  postedAt?: string;
}

/** « il y a 2 jours » à partir de la date de publication renvoyée par l'API. */
const postedLabel = (postedAt?: string) => {
  if (!postedAt) return '';
  const date = new Date(postedAt);
  return isNaN(date.getTime()) ? '' : formatDistanceToNow(date, { addSuffix: true });
};

const JobsFinder: React.FC = () => {
  const [location, setLocation] = useState<string>("");
  const [jobType, setJobType] = useState<string>("");
  const [experience, setExperience] = useState<string>("");
  const [industry, setIndustry] = useState<string>("");

  const { countries: allCountries } = useCountries();
  const jobTypes = ["Full-time", "Part-time", "Contract", "Remote"];
  const experienceLevels = ["Entry Level", "1-3 years", "3-5 years", "5+ years"];
  const industries = ["Technology", "Marketing", "Finance", "Healthcare", "Education"];

  const { items: filteredJobs, loading, error } = useApiList<Job>(
    () => apiService.getJobs({ country: location, type: jobType }),
    [location, jobType],
    { errorMessage: 'Unable to load job offers. Please try again later.' }
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-primary mb-8">Jobs Finder</h1>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              >
                <option value="">All Locations</option>
                {allCountries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Type
              </label>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              >
                <option value="">All Types</option>
                {jobTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experience Level
              </label>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              >
                <option value="">All Levels</option>
                {experienceLevels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Industry
              </label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              >
                <option value="">All Industries</option>
                {industries.map(ind => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Loading / Error */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-gray-600">Loading job offers...</p>
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Results */}
        {!loading && (
        <div className="space-y-6">
          {filteredJobs.length > 0 ? (
            filteredJobs.map(job => (
              <div key={job.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-primary">{job.title}</h3>
                      <p className="text-gray-600">{job.company}</p>
                    </div>
                    {job.postedAt && (
                      <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                        {postedLabel(job.postedAt)}
                      </span>
                    )}
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-gray-600 mb-4">{job.description}</p>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Location:</span> {job.location}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Type:</span> {job.type}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Salary:</span> {job.salary}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Experience:</span> {job.experience}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Requirements</h4>
                        <ul className="list-disc list-inside space-y-1 text-gray-600">
                          {(job.requirements ?? []).map((req, idx) => (
                            <li key={idx}>{req}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Benefits</h4>
                        <ul className="list-disc list-inside space-y-1 text-gray-600">
                          {(job.benefits ?? []).map((benefit, idx) => (
                            <li key={idx}>{benefit}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-4">
                    <button className="px-4 py-2 border border-primary text-primary rounded-md hover:bg-primary/10 transition-colors">
                      Save Job
                    </button>
                    <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors">
                      Apply Now
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg">No jobs found matching your criteria. Please adjust your filters.</p>
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
};

export default JobsFinder;