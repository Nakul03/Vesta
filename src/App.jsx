import { Routes, Route } from "react-router-dom";
import Main from "./components/main/Main";
import MeteorTrajectory from "./components/pages/MeteorTrajectory";
import AudioSummaryPage from "./components/pages/AudioSummaryPage";
import FlashcardApp from "./components/pages/FlashcardApp";
import MinecraftExtinction from "./components/pages/MinecraftExtinction";
import Sidebar from "./components/sidebar/Sidebar";
import AsteroidExplosionQuiz from "./components/pages/AsteroidExplosionQuiz";
import AsteroidLauncher from "./components/pages/AsteroidLauncher";
import SolarSystem from "./components/pages/solarsystem.jsx";
import DocumentDetailsPage from "./components/pages/DocumentDetailsPage";
import { PodcastProvider } from "./context/PodcastContext";
import Notification from "./components/Notification";
import './App.css';

function App() {
  return (
    <PodcastProvider>
      <div className="app-container">
        <Sidebar />
        <Notification />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<SolarSystem/>} />
            <Route path="/quiz" element={<MeteorTrajectory/>} />
            <Route path="/progress-report" element={<Main />} />
            <Route path="/audio-summary" element={<AudioSummaryPage />} />
            <Route path="/flashcards" element={<FlashcardApp />} />
            <Route path="/mindmap" element={<MinecraftExtinction />} />
            <Route path="/summary" element={<AsteroidExplosionQuiz />} />
            <Route path="/documents/:id" element={<DocumentDetailsPage />} />
          </Routes>
        </div>
      </div>
    </PodcastProvider>
  );
}

export default App;
