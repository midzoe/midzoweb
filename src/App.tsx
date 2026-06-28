import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AuthProvider } from './context/AuthContext';
import LeadMagnetModal from './components/leadMagnet/LeadMagnetModal';
import { useLeadCapture } from './hooks/useLeadCapture';

// Admin
import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminUsers from './components/admin/AdminUsers';
import AdminNews from './components/admin/AdminNews';
import AdminBlogs from './components/admin/AdminBlogs';
import AdminVisa from './components/admin/AdminVisa';
import AdminCountries from './components/admin/AdminCountries';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Hero from './components/Hero';
import NewsSlider from './components/NewsSlider';
import Services from './components/Services';
import About from './components/About';
import Contact from './components/Contact';
import Login from './components/Login';
import Register from './components/Register';
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
import TourismEvents from './components/tourism/TourismEvents';
import SafariAfrica from './components/tourism/SafariAfrica';
import SportsTourism from './components/tourism/SportsTourism';
import TourismPartners from './components/tourism/TourismPartners';

// Orientation Components
import Orientation from './components/orientation/Orientation';

// Tourism Home
import TourismHome from './components/TourismHome';
import Community from './components/Community';
import DestinationGuide from './components/DestinationGuide';

// Professional Components
import TrainingFinder from './components/professional/TrainingFinder';
import JobsFinder from './components/professional/JobsFinder';
import WorkVisa from './components/professional/WorkVisa';
import DocumentLegalization from './components/professional/DocumentLegalization';

// Wrapper that hides Navbar/Footer on admin routes
function PublicLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  if (isAdmin) return <>{children}</>;
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
    </div>
  );
}

function AppContent() {
  const { i18n } = useTranslation();
  const { isModalOpen, closeModal } = useLeadCapture();

  useEffect(() => {
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <>
      <LeadMagnetModal isOpen={isModalOpen} onClose={closeModal} />
      <Router>
        <PublicLayout>
          <Routes>
            {/* ─── Admin Routes ──────────────────────────────── */}
            <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
            <Route path="/admin/users" element={<AdminLayout><AdminUsers /></AdminLayout>} />
            <Route path="/admin/news" element={<AdminLayout><AdminNews /></AdminLayout>} />
            <Route path="/admin/blogs" element={<AdminLayout><AdminBlogs /></AdminLayout>} />
            <Route path="/admin/visa" element={<AdminLayout><AdminVisa /></AdminLayout>} />
            <Route path="/admin/countries" element={<AdminLayout><AdminCountries /></AdminLayout>} />

            {/* ─── Public Routes ─────────────────────────────── */}
            <Route path="/" element={<><Hero /><NewsSlider /></>} />
            <Route path="/tourism" element={<TourismHome />} />
            <Route path="/community" element={<Community />} />
            <Route path="/destination/:destination" element={<DestinationGuide />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
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
            <Route path="/services/tourism-events" element={<TourismEvents />} />
            <Route path="/services/tourism-safari" element={<SafariAfrica />} />
            <Route path="/services/tourism-sports" element={<SportsTourism />} />
            <Route path="/services/tourism-partners" element={<TourismPartners />} />

            {/* Orientation Routes */}
            <Route path="/services/orientation" element={<Orientation />} />
            <Route path="/services/orientation-study" element={<Orientation />} />
            <Route path="/services/orientation-career" element={<Orientation />} />
            <Route path="/services/orientation-training" element={<Orientation />} />

            {/* Professional Routes */}
            <Route path="/services/training-finder" element={<TrainingFinder />} />
            <Route path="/services/jobs-finder" element={<JobsFinder />} />
            <Route path="/services/work-visa" element={<WorkVisa />} />
            <Route path="/services/document-pro-legalization" element={<DocumentLegalization />} />

            {/* Country Detail */}
            <Route path="/country/:country" element={<CountryDetail />} />
          </Routes>
        </PublicLayout>
      </Router>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
