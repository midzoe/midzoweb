import React, { useState } from 'react';
import { regions } from '../../data/regions';

interface Job {
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  experience: string;
  description: string;
  requirements: string[];
  benefits: string[];
  posted: string;
  image: string;
}

const mockJobs: Job[] = [
  {
    title: "Senior Software Engineer",
    company: "Tech Innovations GmbH",
    location: "Berlin, Germany",
    type: "Full-time",
    salary: "€65,000 - €85,000",
    experience: "5+ years",
    description: "Looking for an experienced software engineer to join our growing team.",
    requirements: [
      "5+ years of experience in full-stack development",
      "Strong knowledge of JavaScript/TypeScript",
      "Experience with React and Node.js",
      "Good understanding of cloud services"
    ],
    benefits: [
      "Flexible working hours",
      "Remote work options",
      "Health insurance",
      "Professional development budget"
    ],
    posted: "2 days ago",
    image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Marketing Manager",
    company: "Global Brands Ltd",
    location: "London, United Kingdom",
    type: "Full-time",
    salary: "£45,000 - £60,000",
    experience: "3-5 years",
    description: "Seeking a creative marketing manager to lead our digital campaigns.",
    requirements: [
      "3-5 years of digital marketing experience",
      "Strong analytical skills",
      "Experience with marketing automation tools",
      "Excellent communication skills"
    ],
    benefits: [
      "Performance bonuses",
      "Gym membership",
      "Company events",
      "Training opportunities"
    ],
    posted: "1 week ago",
    image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    title: "Data Scientist",
    company: "Analytics Pro",
    location: "Paris, France",
    type: "Full-time",
    salary: "€50,000 - €70,000",
    experience: "2-4 years",
    description: "Join our data science team to work on cutting-edge AI projects.",
    requirements: [
      "Masters in Data Science or related field",
      "Experience with Python and ML frameworks",
      "Strong statistical background",
      "Good communication skills"
    ],
    benefits: [
      "Flexible hours",
      "Remote work options",
      "Health coverage",
      "Stock options"
    ],
    posted: "3 days ago",
    image: "https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  }
];

const JobsFinder: React.FC = () => {
  const [location, setLocation] = useState<string>("");
  const [jobType, setJobType] = useState<string>("");
  const [experience, setExperience] = useState<string>("");
  const [industry, setIndustry] = useState<string>("");

  const allCountries = regions.flatMap(region => region.countries).sort();
  const jobTypes = ["Full-time", "Part-time", "Contract", "Remote"];
  const experienceLevels = ["Entry Level", "1-3 years", "3-5 years", "5+ years"];
  const industries = ["Technology", "Marketing", "Finance", "Healthcare", "Education"];

  const filteredJobs = mockJobs.filter(job => {
    if (location && !job.location.includes(location)) return false;
    if (jobType && job.type !== jobType) return false;
    return true;
  });

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

        {/* Results */}
        <div className="space-y-6">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job, index) => (
              <div key={index} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-primary">{job.title}</h3>
                      <p className="text-gray-600">{job.company}</p>
                    </div>
                    <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                      {job.posted}
                    </span>
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
                          {job.requirements.map((req, idx) => (
                            <li key={idx}>{req}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Benefits</h4>
                        <ul className="list-disc list-inside space-y-1 text-gray-600">
                          {job.benefits.map((benefit, idx) => (
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
      </div>
    </div>
  );
};

export default JobsFinder;