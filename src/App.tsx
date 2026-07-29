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
import AdminEmbassies from './components/admin/AdminEmbassies';
import AdminUniversities from './components/admin/AdminUniversities';
import AdminLanguageCenters from './components/admin/AdminLanguageCenters';
import AdminTourismPrograms from './components/admin/AdminTourismPrograms';
import AdminTourismEvents from './components/admin/AdminTourismEvents';
import AdminPartners from './components/admin/AdminPartners';
import AdminCountries from './components/admin/AdminCountries';
import AdminStudyCountries from './components/admin/AdminStudyCountries';
import AdminTourismCountries from './components/admin/AdminTourismCountries';
import AdminAccommodations from './components/admin/AdminAccommodations';
import AdminPackages from './components/admin/AdminPackages';
import AdminContactMessages from './components/admin/AdminContactMessages';
import AdminNewsletter from './components/admin/AdminNewsletter';
import AdminValidation from './components/admin/AdminValidation';
import AdminSettings from './components/admin/AdminSettings';
import AdminOrientation from './components/admin/AdminOrientation';
import AdminScraping from './components/admin/AdminScraping';
import AdminFlights from './components/admin/AdminFlights';
import AdminInsurancePlans from './components/admin/AdminInsurancePlans';
import AdminBanks from './components/admin/AdminBanks';
import AdminTouristSites from './components/admin/AdminTouristSites';
import AdminRestaurants from './components/admin/AdminRestaurants';
import AdminTourismAccommodations from './components/admin/AdminTourismAccommodations';
import AdminJobs from './components/admin/AdminJobs';
import AdminTrainings from './components/admin/AdminTrainings';
import AdminServiceProviders from './components/admin/AdminServiceProviders';
import OrientationResources from './components/Orientation';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Hero from './components/Hero';
import NewsSlider from './components/NewsSlider';
import Services from './components/Services';
import PackageBuilder from './components/PackageBuilder';
import About from './components/About';
import Contact from './components/Contact';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import MyTripsSpace from './components/MyTripsSpace';
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
import NewsArticle from './components/news/NewsArticle';
import BlogList from './components/blog/BlogList';
import BlogArticle from './components/blog/BlogArticle';

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
            <Route path="/admin/embassies" element={<AdminLayout><AdminEmbassies /></AdminLayout>} />
            <Route path="/admin/universities" element={<AdminLayout><AdminUniversities /></AdminLayout>} />
            <Route path="/admin/language-centers" element={<AdminLayout><AdminLanguageCenters /></AdminLayout>} />
            <Route path="/admin/tourism-programs" element={<AdminLayout><AdminTourismPrograms /></AdminLayout>} />
            <Route path="/admin/tourism-events" element={<AdminLayout><AdminTourismEvents /></AdminLayout>} />
            <Route path="/admin/partners" element={<AdminLayout><AdminPartners /></AdminLayout>} />
            <Route path="/admin/countries" element={<AdminLayout><AdminCountries /></AdminLayout>} />
            <Route path="/admin/study-countries" element={<AdminLayout><AdminStudyCountries /></AdminLayout>} />
            <Route path="/admin/tourism-countries" element={<AdminLayout><AdminTourismCountries /></AdminLayout>} />
            <Route path="/admin/accommodations" element={<AdminLayout><AdminAccommodations /></AdminLayout>} />
            <Route path="/admin/packages" element={<AdminLayout><AdminPackages /></AdminLayout>} />
            <Route path="/admin/contact-messages" element={<AdminLayout><AdminContactMessages /></AdminLayout>} />
            <Route path="/admin/newsletter" element={<AdminLayout><AdminNewsletter /></AdminLayout>} />
            <Route path="/admin/validation" element={<AdminLayout><AdminValidation /></AdminLayout>} />
            <Route path="/admin/settings" element={<AdminLayout><AdminSettings /></AdminLayout>} />
            <Route path="/admin/orientation" element={<AdminLayout><AdminOrientation /></AdminLayout>} />
            <Route path="/admin/scraping" element={<AdminLayout><AdminScraping /></AdminLayout>} />
            <Route path="/admin/flights" element={<AdminLayout><AdminFlights /></AdminLayout>} />
            <Route path="/admin/insurance-plans" element={<AdminLayout><AdminInsurancePlans /></AdminLayout>} />
            <Route path="/admin/banks" element={<AdminLayout><AdminBanks /></AdminLayout>} />
            <Route path="/admin/tourist-sites" element={<AdminLayout><AdminTouristSites /></AdminLayout>} />
            <Route path="/admin/restaurants" element={<AdminLayout><AdminRestaurants /></AdminLayout>} />
            <Route path="/admin/tourism-accommodations" element={<AdminLayout><AdminTourismAccommodations /></AdminLayout>} />
            <Route path="/admin/jobs" element={<AdminLayout><AdminJobs /></AdminLayout>} />
            <Route path="/admin/trainings" element={<AdminLayout><AdminTrainings /></AdminLayout>} />
            <Route path="/admin/service-providers" element={<AdminLayout><AdminServiceProviders /></AdminLayout>} />

            {/* ─── Public Routes ─────────────────────────────── */}
            <Route path="/" element={<><Hero /><NewsSlider /></>} />
            <Route path="/tourism" element={<TourismHome />} />
            <Route path="/community" element={<Community />} />
            <Route path="/destination/:destination" element={<DestinationGuide />} />
            <Route path="/actualites/:id" element={<NewsArticle />} />
            <Route path="/blog" element={<BlogList />} />
            <Route path="/blog/:slug" element={<BlogArticle />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/orientation" element={<OrientationResources />} />
            <Route path="/premium" element={<PackageBuilder />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/my-trips" element={<MyTripsSpace />} />
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
