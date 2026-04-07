import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage.tsx";
import Marketplace from "./pages/Marketplace.tsx";
import CollectionsPage from "./pages/CollectionsPage.tsx";
import CardDetail from "./pages/CardDetail.tsx";
import Profile from "./pages/Profile.tsx";
import Navbar from "./components/Navbar.tsx";
import { AdminPage } from "./pages/AdminPage.tsx";

function App() {
  return (
    <BrowserRouter>
      <div className="bg-gray-950 min-h-screen text-white w-full overflow-x-hidden">
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/card/:id" element={<CardDetail />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/mint" element={<AdminPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
