import React from "react";
import { Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import Home from "./components/pages/Home";
import ServerListe from "./components/pages/ServerListe";
import Dashboard from "./components/pages/Dashboard";
import Configure from "./components/pages/Configure";
import GuthabenAufladen from "./components/pages/GuthabenAufladen";
import LoginRegisterPage from "./components/pages/LoginRegisterPage";
import Profile from "./components/pages/Profile";
import AccountSettings from "./components/pages/AccountSettings";
import Payment from "./components/pages/Payment";
import EditServer from "./EditServer";
import NotFound from "./components/pages/NotFound";
import AuthenticatedRoute from "./components/AuthenticatedRoute";
import Impressum from "./components/pages/Impressum"; // Neue Seite für Impressum
import FAQ from "./components/pages/FAQ"; // Neue Seite für FAQ
import EmailVerification from "./components/pages/EmailVerification"; // Importiere die Komponente für die E-Mail-Verifizierung
import { useAuth } from "./context/AuthContext";
import { ToastContainer } from 'react-toastify'; // Importiere ToastContainer für Benachrichtigungen
import 'react-toastify/dist/ReactToastify.css'; // Importiere das Stylesheet

const App = () => {
  const { user } = useAuth();

  return (
    <>
      <NavBar user={user} />
      <ToastContainer /> {/* Anzeige von Toast-Benachrichtigungen */}
      <Routes>
        {/* Öffentliche Routen */}
        <Route path="/" element={<Home />} />
        <Route path="/serverliste" element={<ServerListe />} />
        <Route path="/auth" element={<LoginRegisterPage />} />
        <Route path="/impressum" element={<Impressum />} /> {/* Neue Route für Impressum */}
        <Route path="/faq" element={<FAQ />} /> {/* Neue Route für FAQ */}
        <Route path="/verify-email/:token" element={<EmailVerification />} /> {/* Route für E-Mail-Verifizierung */}
        <Route path="/edit-server/:id" element={<EditServer />} />
        <Route path="*" element={<NotFound />} />

        {/* Geschützte Routen */}
        <Route
          path="/dashboard"
          element={<AuthenticatedRoute component={Dashboard} />}
        />
        <Route
          path="/dashboard/guthaben"
          element={<AuthenticatedRoute component={GuthabenAufladen} />}
        />
        <Route
          path="/configure/:id"
          element={<AuthenticatedRoute component={Configure} />}
        />
        <Route
          path="/payment"
          element={<AuthenticatedRoute component={Payment} />}
        />
        <Route
          path="/profile"
          element={<AuthenticatedRoute component={Profile} />}
        />
        <Route
          path="/account-settings"
          element={<AuthenticatedRoute component={AccountSettings} />}
        />
      </Routes>
    </>
  );
};

export default App;
