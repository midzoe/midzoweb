import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Hero from './components/Hero';
import Destinations from './components/Destinations';
import NewsSlider from './components/NewsSlider';
import Services from './components/Services';
import About from './components/About';
import Contact from './components/Contact';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import FAQ from './components/FAQ';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import FlightBooking from './components/FlightBooking';
import Insurance from './components/Insurance';
import CountryDetail from './components/CountryDetail';

// Study Components
import UniversityFinder from './components/study/UniversityFinder';
import DocumentServices from './components/study/DocumentLegalization';
import StudentVisa from './components/study/StudentVisa';
import StudentAccommodation from './components/study/StudentAccommodation';
import BankAccount from './components/study/BankAccount';
import LanguageCenter from './components/study/LanguageCenter';

// Tourism Components
import TourismAccommodation from './components/tourism/TourismAccommodation';
import TourismRestaurants from './components/tourism/TourismRestaurants';
import TouristSites from './components/tourism/TouristSites';
import TouristVisa from './components/tourism/TouristVisa';

// Professional Components
import TrainingFinder from './components/professional/TrainingFinder';
import JobsFinder from './components/professional/JobsFinder';
import WorkVisa from './components/professional/WorkVisa';
import DocumentLegalization from './components/professional/DocumentLegalization';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={
                <>
                  <Hero />
                  <NewsSlider />
                  <Destinations />
                </>
              } />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/flights" element={<FlightBooking />} />
              <Route path="/insurance" element={<Insurance />} />
              
              {/* Study Routes */}
              <Route path="/services/university-finder" element={<UniversityFinder />} />
              <Route path="/services/document-legalization" element={<DocumentServices />} />
              <Route path="/services/student-visa" element={<StudentVisa />} />
              <Route path="/services/student-accommodation" element={<StudentAccommodation />} />
              <Route path="/services/bank-account" element={<BankAccount />} />
              <Route path="/services/language-center" element={<LanguageCenter />} />

              {/* Tourism Routes */}
              <Route path="/services/accommodation" element={<TourismAccommodation />} />
              <Route path="/services/restaurants" element={<TourismRestaurants />} />
              <Route path="/services/tourist-sites" element={<TouristSites />} />
              <Route path="/services/tourist-visa" element={<TouristVisa />} />

              {/* Professional Routes */}
              <Route path="/services/training-finder" element={<TrainingFinder />} />
              <Route path="/services/jobs-finder" element={<JobsFinder />} />
              <Route path="/services/work-visa" element={<WorkVisa />} />
              <Route path="/services/document-legalization" element={<DocumentLegalization />} />

              {/* Country Detail Route */}
              <Route path="/country/:country" element={<CountryDetail />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;