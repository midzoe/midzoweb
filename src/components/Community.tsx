import { useState } from 'react';
import { Link } from 'react-router-dom';

interface Story {
  id: number;
  author: string;
  location: string;
  trip: string;
  image: string;
  likes: number;
  caption: string;
  date: string;
  videoUrl?: string;
  rating: number;
}

const Community = () => {
  // const { i18n } = useTranslation();
  // const lang = i18n.language.startsWith('fr') ? 'fr' : i18n.language.startsWith('de') ? 'de' : 'en';
  const [liked, setLiked] = useState<number[]>([]);

  const stories: Story[] = [
    {
      id: 1,
      author: 'Marie Dupont',
      location: 'Paris, France',
      trip: 'World Cup 2026 — USA',
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      likes: 342,
      caption: '80,000 fans screaming, goosebumps everywhere. This is what Midzoe promised — and delivered. #WorldCup2026 #SoccerMagic',
      date: 'Mar 10, 2026',
      rating: 5
    },
    {
      id: 2,
      author: 'Ahmed Osman',
      location: 'Cairo, Egypt',
      trip: 'Botswana Safari — 7 Days',
      image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      likes: 512,
      caption: 'Woke up to lions roaring outside my tent. No words can describe this. Midzoe team made it seamless. Worth every penny! 🦁',
      date: 'Feb 28, 2026',
      rating: 5
    },
    {
      id: 3,
      author: 'Sophie Laurent',
      location: 'Lyon, France',
      trip: 'Paris Marathon + City Tour',
      image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      likes: 298,
      caption: 'Ran 42km through the streets of Paris. The support, the energy, the city... Unforgettable. Thank you Midzoe! 🏃‍♀️',
      date: 'Feb 15, 2026',
      rating: 5
    },
    {
      id: 4,
      author: 'Kgosi Modise',
      location: 'Gaborone, Botswana',
      trip: 'Lesotho Adventure — Mountain Trekking',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      likes: 421,
      caption: 'Standing at 3,500m in the Drakensberg. This is what adventure feels like. Every step was worth it. #LesothoLife',
      date: 'Feb 5, 2026',
      rating: 5
    },
    {
      id: 5,
      author: 'Isabella Romano',
      location: 'Milano, Italy',
      trip: 'Safari Botswana + Okavango',
      image: 'https://images.unsplash.com/photo-1489749798305-4fea3ba63d60?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      likes: 567,
      caption: 'Sunrise over the Okavango Delta. Saw elephants, leopards, and hippos. This trip changed my life. #MidzoeSafari',
      date: 'Jan 28, 2026',
      rating: 5
    },
    {
      id: 6,
      author: 'James Wilson',
      location: 'London, UK',
      trip: 'Grand Slam Tennis — Wimbledon Experience',
      image: 'https://images.unsplash.com/photo-1554224311-beee415c15b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      likes: 289,
      caption: 'Courtside at Wimbledon. Watched Djokovic vs Alcaraz. Midzoe handled everything perfectly. Legendary experience!',
      date: 'Jan 15, 2026',
      rating: 5
    }
  ];

  const toggleLike = (id: number) => {
    if (liked.includes(id)) {
      setLiked(liked.filter(l => l !== id));
    } else {
      setLiked([...liked, id]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-4">
            <Link to="/tourism" className="text-sm font-medium text-gray-600 hover:text-primary">
              ← Retour à Midzoe Tourism
            </Link>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Midzoe Community</h1>
          <p className="text-xl text-gray-600">
            Real stories from real travelers. Join thousands who've lived their dreams.
          </p>
        </div>
      </div>

      {/* Instagram-like Feed */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-8">
          {stories.map((story) => (
            <div
              key={story.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              {/* Image */}
              <div className="relative h-64 overflow-hidden bg-gray-200">
                <img
                  src={story.image}
                  alt={story.trip}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-1">
                  <span className="text-yellow-400">★</span>
                  <span className="font-bold text-gray-900">{story.rating}.0</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-gray-900">{story.author}</h3>
                    <p className="text-sm text-gray-600">
                      {story.location} · {story.date}
                    </p>
                  </div>
                  <img
                    src={`https://i.pravatar.cc/40?u=${story.id}`}
                    alt={story.author}
                    className="w-10 h-10 rounded-full"
                  />
                </div>

                <p className="text-sm font-semibold text-orange-600 mb-3">{story.trip}</p>

                <p className="text-gray-700 mb-4 line-clamp-3">{story.caption}</p>

                {/* Interactions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <button
                    onClick={() => toggleLike(story.id)}
                    className={`flex items-center gap-2 font-semibold transition-colors ${
                      liked.includes(story.id)
                        ? 'text-red-600'
                        : 'text-gray-600 hover:text-red-600'
                    }`}
                  >
                    <span className="text-xl">
                      {liked.includes(story.id) ? '❤️' : '🤍'}
                    </span>
                    {liked.includes(story.id)
                      ? (Number(story.likes) + 1)
                      : story.likes}
                  </button>

                  <button className="text-gray-600 hover:text-gray-900 font-semibold">
                    💬 Share
                  </button>

                  <button className="text-gray-600 hover:text-gray-900">
                    🔗
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl p-12 border-2 border-orange-200">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Create Your Story?</h2>
          <p className="text-gray-600 mb-8 max-w-xl mx-auto">
            Join thousands of travelers who've lived unforgettable moments. Your adventure is just one click away.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/trip-builder"
              className="px-8 py-4 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-700 transition-colors"
            >
              Build Your Trip 🚀
            </Link>
            <Link
              to="/tourism"
              className="px-8 py-4 border-2 border-orange-600 text-orange-600 font-bold rounded-lg hover:bg-orange-50 transition-colors"
            >
              Explore Experiences
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Community;
