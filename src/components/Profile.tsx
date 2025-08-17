import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  GlobeAltIcon,
  AcademicCapIcon,
  BriefcaseIcon,
  LanguageIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 234 567 890',
    nationality: 'United States',
    languages: ['English', 'Spanish', 'French'],
    education: 'Bachelor in Computer Science',
    occupation: 'Software Developer',
    interests: ['Technology', 'Travel', 'Languages']
  });

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically update the user profile
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="relative h-48 bg-primary">
            <div className="absolute inset-0 bg-black/20"></div>
          </div>
          <div className="relative px-6 pb-6">
            <div className="flex flex-col items-center -mt-20">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150&q=80"
                alt="Profile"
                className="w-32 h-32 rounded-full border-4 border-white shadow-lg mb-4"
              />
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900">{formData.fullName}</h1>
                <p className="text-gray-600">{formData.occupation}</p>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                {isEditing ? (
                  <>
                    <XMarkIcon className="h-5 w-5 mr-2" />
                    Cancel Editing
                  </>
                ) : (
                  <>
                    <PencilIcon className="h-5 w-5 mr-2" />
                    Edit Profile
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6">
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {/* Personal Information */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Full Name</label>
                      <div className="mt-1 flex items-center">
                        <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                        {isEditing ? (
                          <input
                            type="text"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                          />
                        ) : (
                          <span className="text-gray-900">{formData.fullName}</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <div className="mt-1 flex items-center">
                        <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-2" />
                        {isEditing ? (
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                          />
                        ) : (
                          <span className="text-gray-900">{formData.email}</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <div className="mt-1 flex items-center">
                        <PhoneIcon className="h-5 w-5 text-gray-400 mr-2" />
                        {isEditing ? (
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                          />
                        ) : (
                          <span className="text-gray-900">{formData.phone}</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nationality</label>
                      <div className="mt-1 flex items-center">
                        <GlobeAltIcon className="h-5 w-5 text-gray-400 mr-2" />
                        {isEditing ? (
                          <input
                            type="text"
                            value={formData.nationality}
                            onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                          />
                        ) : (
                          <span className="text-gray-900">{formData.nationality}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Education & Work */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Education & Work</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Education</label>
                      <div className="mt-1 flex items-center">
                        <AcademicCapIcon className="h-5 w-5 text-gray-400 mr-2" />
                        {isEditing ? (
                          <input
                            type="text"
                            value={formData.education}
                            onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                          />
                        ) : (
                          <span className="text-gray-900">{formData.education}</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Occupation</label>
                      <div className="mt-1 flex items-center">
                        <BriefcaseIcon className="h-5 w-5 text-gray-400 mr-2" />
                        {isEditing ? (
                          <input
                            type="text"
                            value={formData.occupation}
                            onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm"
                          />
                        ) : (
                          <span className="text-gray-900">{formData.occupation}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Languages & Interests */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Languages & Interests</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Languages</label>
                      <div className="mt-1">
                        <div className="flex items-center">
                          <LanguageIcon className="h-5 w-5 text-gray-400 mr-2" />
                          <div className="flex flex-wrap gap-2">
                            {formData.languages.map((language, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary"
                              >
                                {language}
                                {isEditing && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newLanguages = formData.languages.filter((_, i) => i !== index);
                                      setFormData({ ...formData, languages: newLanguages });
                                    }}
                                    className="ml-2 text-primary hover:text-primary/80"
                                  >
                                    <XMarkIcon className="h-4 w-4" />
                                  </button>
                                )}
                              </span>
                            ))}
                            {isEditing && (
                              <button
                                type="button"
                                onClick={() => {
                                  const newLanguage = prompt('Enter new language');
                                  if (newLanguage) {
                                    setFormData({
                                      ...formData,
                                      languages: [...formData.languages, newLanguage]
                                    });
                                  }
                                }}
                                className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
                              >
                                Add Language
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Interests</label>
                      <div className="mt-1">
                        <div className="flex flex-wrap gap-2">
                          {formData.interests.map((interest, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-secondary/10 text-secondary"
                            >
                              {interest}
                              {isEditing && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newInterests = formData.interests.filter((_, i) => i !== index);
                                    setFormData({ ...formData, interests: newInterests });
                                  }}
                                  className="ml-2 text-secondary hover:text-secondary/80"
                                >
                                  <XMarkIcon className="h-4 w-4" />
                                </button>
                              )}
                            </span>
                          ))}
                          {isEditing && (
                            <button
                              type="button"
                              onClick={() => {
                                const newInterest = prompt('Enter new interest');
                                if (newInterest) {
                                  setFormData({
                                    ...formData,
                                    interests: [...formData.interests, newInterest]
                                  });
                                }
                              }}
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
                            >
                              Add Interest
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                {isEditing && (
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                      <CheckIcon className="h-5 w-5 mr-2" />
                      Save Changes
                    </button>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;