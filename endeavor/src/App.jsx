import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom"

import Contact from "./Home/Contact";
import Homepage from "./Home/Homepage";
import About from "./Home/About";
import Confrencespage from "./Home/Confrencespage";
import Webinar from "./Home/Webinar";
import WebinarDetails from "./Home/WebinarDetails";
import Proceedings from "./Home/Proceedings";
import Journals from "./Home/Journals";
import Register from "./Home/Register";
import AbstractSubmission from "./Home/AbstractSubmission";
import AdminLogin from "./admin/AdminLogin";

// Admin Re-architecture
import { AdminProvider } from "./admin/AdminContext";
import AdminLayout from "./admin/AdminLayout";
import Dashboard from "./admin/pages/Dashboard";
import ConferenceManager from "./admin/pages/ConferenceManager";
import SpeakerManager from "./admin/pages/SpeakerManager";
import SessionManager from "./admin/pages/SessionManager";
import CommitteeManager from "./admin/pages/CommitteeManager";
import VenueManager from "./admin/pages/VenueManager";
import NavbarManager from "./admin/pages/NavbarManager";
import GalleryManager from "./admin/pages/GalleryManager";
import RegistrationManager from "./admin/pages/RegistrationManager";
import AbstractManager from "./admin/pages/AbstractManager";
import ContactManager from "./admin/pages/ContactManager";
import TrackManager from './admin/pages/TrackManager';
import BrochureManager from "./admin/pages/BrochureManager";
import SponsorManager from "./admin/pages/SponsorManager";
import HeroManager from "./admin/pages/HeroManager";
import StatisticsManager from "./admin/pages/StatisticsManager";
import TrustBadgeManager from "./admin/pages/TrustBadgeManager";
import SettingsManager from "./admin/pages/SettingsManager";
import LogsManager from "./admin/pages/LogsManager";
import WebinarManager from "./admin/pages/WebinarManager";

import ConferenceLayout from "./conferences/ConferenceLayout";
import ConferenceHome from "./conferences/ConferenceHome";
import ConferenceBrochure from "./conferences/ConferenceBrochure";
import ConferenceSpeakers from "./conferences/ConferenceSpeakers";
import ConferenceProgram from "./conferences/ConferenceProgram";
import ConferenceAbstract from "./conferences/ConferenceAbstract";
import ConferenceRegister from "./conferences/ConferenceRegister";
import ConferenceVenue from "./conferences/ConferenceVenue";
import ConferenceContact from "./conferences/ConferenceContact";
import ConferenceSuggestSpeaker from "./conferences/ConferenceSuggestSpeaker";

import NotFoundPage from "./components/NotFoundPage";
import Sponsors from "./Home/Sponsors.jsx";
import { getSubdomain } from "./utils/subdomain.jsx";

function App() {
  const subdomain = getSubdomain();
  const isSubdomainActive = !!subdomain;

  return (
    <BrowserRouter>
      {isSubdomainActive ? (
        /* Conference Subdomain Routing Tree (Rooted at /) */
        <Routes>
          <Route path="/" element={<ConferenceLayout />}>
            <Route index element={<ConferenceHome />} />
            <Route path="brochure" element={<ConferenceBrochure />} />
            <Route path="speakers" element={<ConferenceSpeakers />} />
            <Route path="program" element={<ConferenceProgram />} />
            <Route path="submit-abstract" element={<ConferenceAbstract />} />
            <Route path="register" element={<ConferenceRegister />} />
            <Route path="venue" element={<ConferenceVenue />} />
            <Route path="contact" element={<ConferenceContact />} />
            <Route path="suggest-speaker" element={<ConferenceSuggestSpeaker />} />
          </Route>
          {/* Subdomain 404 route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      ) : (
        /* Main Website Routing Tree */
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/conferences" element={<Confrencespage />} />
          <Route path="/sponsors" element={<Sponsors />} />
          
          {/* Fallback path-based routing for previewing conferences on main domain */}
          <Route path="/conferences/:id" element={<ConferenceLayout />}>
            <Route index element={<ConferenceHome />} />
            <Route path="brochure" element={<ConferenceBrochure />} />
            <Route path="speakers" element={<ConferenceSpeakers />} />
            <Route path="program" element={<ConferenceProgram />} />
            <Route path="submit-abstract" element={<ConferenceAbstract />} />
            <Route path="register" element={<ConferenceRegister />} />
            <Route path="venue" element={<ConferenceVenue />} />
            <Route path="contact" element={<ConferenceContact />} />
            <Route path="suggest-speaker" element={<ConferenceSuggestSpeaker />} />
          </Route>

          <Route path="/webinars" element={<Webinar />} />
          <Route path="/webinars/:slug" element={<WebinarDetails />} />
          <Route path="/proceedings" element={<Proceedings />} />
          <Route path="/journals" element={<Journals />} />
          <Route path="/register" element={<Register />} />
          <Route path="/submit-abstract" element={<AbstractSubmission />} />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          
          {/* Modular Admin Layout */}
          <Route path="/admin" element={<AdminProvider><AdminLayout /></AdminProvider>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="conferences" element={<ConferenceManager />} />
            <Route path="speakers" element={<SpeakerManager />} />
            <Route path="tracks" element={<TrackManager />} />
            <Route path="sessions" element={<SessionManager />} />
            <Route path="committee" element={<CommitteeManager />} />
            <Route path="venue" element={<VenueManager />} />
            <Route path="navbar" element={<NavbarManager />} />
            <Route path="gallery" element={<GalleryManager />} />
            <Route path="registrations" element={<RegistrationManager />} />
            <Route path="abstracts" element={<AbstractManager />} />
            <Route path="contacts" element={<ContactManager />} />
            <Route path="brochures" element={<BrochureManager />} />
            <Route path="sponsors" element={<SponsorManager />} />
            <Route path="hero" element={<HeroManager />} />
            <Route path="statistics" element={<StatisticsManager />} />
            <Route path="trust-badges" element={<TrustBadgeManager />} />
            <Route path="settings" element={<SettingsManager />} />
            <Route path="logs" element={<LogsManager />} />
            <Route path="webinars" element={<WebinarManager />} />
          </Route>

          {/* Main Website 404 route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      )}
    </BrowserRouter>
  );
}

export default App
