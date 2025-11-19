import React from 'react';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div 
        className="bg-primary text-white py-20 relative"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")',
          backgroundPosition: 'center',
          backgroundSize: 'cover'
        }}
      >
        <div className="absolute inset-0 bg-primary/80"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-6">
            About Midzoe
          </h1>
          <p className="text-xl text-center max-w-3xl mx-auto">
            Connecting people across borders through comprehensive travel, education, and business solutions.
          </p>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              To simplify international mobility by providing comprehensive solutions for students, professionals, tourists, and businesses, making global opportunities accessible to everyone.
            </p>
          </div>

          {/* Values */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white p-8 rounded-lg shadow-lg text-center">
              <img 
                src="https://images.unsplash.com/photo-1533421644343-45b606745fb1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Excellence" 
                className="w-full h-48 object-cover rounded-lg mb-6"
              />
              <div className="text-4xl mb-4">🌟</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Excellence</h3>
              <p className="text-gray-600">
                We strive for excellence in every service we provide, ensuring the highest quality and satisfaction for our clients.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg text-center">
              <img 
                src="https://images.unsplash.com/photo-1556484687-30636164638b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Trust" 
                className="w-full h-48 object-cover rounded-lg mb-6"
              />
              <div className="text-4xl mb-4">🤝</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Trust</h3>
              <p className="text-gray-600">
                Building lasting relationships through transparency, reliability, and commitment to our clients' success.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg text-center">
              <img 
                src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Global Perspective" 
                className="w-full h-48 object-cover rounded-lg mb-6"
              />
              <div className="text-4xl mb-4">🌍</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Global Perspective</h3>
              <p className="text-gray-600">
                Embracing diversity and fostering cross-cultural understanding in everything we do.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Story Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-600">
                <p>
                  Founded in 2023, Midzoe emerged from a simple observation: international mobility shouldn't be complicated. Our founders, having experienced the challenges of studying and working abroad, decided to create a comprehensive solution.
                </p>
                <p>
                  Starting with student services, we quickly expanded to cover all aspects of international mobility, from tourism to business travel. Today, we're rapidly growing and helping students, professionals, and travelers navigate their international journeys with ease.
                </p>
                <p>
                  Our commitment to innovation and customer service drives us to continuously improve and expand our services to meet the evolving needs of our global community.
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img 
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Students studying" 
                className="w-full h-48 object-cover rounded-lg"
              />
              <img 
                src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Business meeting" 
                className="w-full h-48 object-cover rounded-lg"
              />
              <img 
                src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Tourism" 
                className="w-full h-48 object-cover rounded-lg"
              />
              <img 
                src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Global network" 
                className="w-full h-48 object-cover rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div 
        className="bg-primary text-white py-16 relative"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1512075135822-67cdd9dd7314?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")',
          backgroundPosition: 'center',
          backgroundSize: 'cover'
        }}
      >
        <div className="absolute inset-0 bg-primary/90"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">15+</div>
              <div className="text-lg">Services Offered</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">1k+</div>
              <div className="text-lg">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">10+</div>
              <div className="text-lg">Countries Served</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">98%</div>
              <div className="text-lg">User Satisfaction</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;