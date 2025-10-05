import "./sidebar.css";
import { assets } from "../../assets/assets";
import { useContext, useState, useEffect } from "react";
import { Context } from "../../context/Context";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const [extended, setExtended] = useState(true);
  const { setRecentPrompt } = useContext(Context);
  const navigate = useNavigate();

  const [documents, setDocuments] = useState([]);

  const fetchDocuments = async () => {
    try {
      const API_BASE_URL = "http://localhost:8000";
      const response = await fetch(`${API_BASE_URL}/documents`);
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      } else {
        console.error("Failed to fetch documents");
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const handleCardClick = (topic) => {
    switch (topic) {
      case "ASTRO GAME":
        navigate("/summary");
        break;
      case "ASTRO PLANNER":
        window.location.href = "https://asteroid-launcher.vercel.app/";
        break;
      case "Generate Flashcards":
        navigate("/flashcards");
        break;
      case "mine":
        window.location.href = "/Minecraft Changes PR.html";
        break;
      case "Create a Study Plan":
        window.location.href = "trajectory.html";
        break;
      case "Audio Summary":
        window.location.href = "/miti.html";
        break;
      case "User Progress":
        navigate("/progress-report");
        break;
      default:
        console.warn("Unknown topic clicked:", topic);
        break;
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  return (
    <div className="sidebar">
      <div className="top">
        {/* Brand */}
        <div
          className="brand"
          onClick={() => navigate("/")}
          style={{ cursor: "pointer" }}
        >
          <img src={assets.logo} alt="logo" className="logo" />
          {extended && <h2>VESTA</h2>}
        </div>

        {/* Study Options */}
        {extended && (
          <div className="study-options">
            <div
              className="recent-entry"
              onClick={() => handleCardClick("ASTRO GAME")}
            >
              <p>Quiz Section</p>
            </div>
            <div
              className="recent-entry"
              onClick={() => handleCardClick("ASTRO PLANNER")}
            >
              <p>Impact Simulator</p>
            </div>
            <div
              className="recent-entry"
              onClick={() => handleCardClick("User Progress")}
            >
              <p>Chat Bot</p>
            </div>
            <div
              className="recent-entry"
              onClick={() => handleCardClick("mine")}
            >
              <p>VR Simulation</p>
            </div>
            <div
              className="recent-entry"
              onClick={() => handleCardClick("Create a Study Plan")}
            >
              <p>RealTime Trajectory</p>
            </div>
            <div
              className="recent-entry"
              onClick={() => handleCardClick("Audio Summary")}
            >
              <p>Mitigation Strategy</p>
            </div>
          </div>
        )}

        {/* Documents */}
        {extended && <p className="recent-title"></p>}
        {extended &&
          documents.map((doc) => (
            <div
              key={doc.id}
              className="recent-entry"
              onClick={() => navigate(`/documents/${doc.id}`)}
            >
              <img src={assets.gallery_icon} alt="document" />
              <p>{doc.filename}</p>
            </div>
          ))}
      </div>

      {/* Bottom Section */}
      <div className="bottom">
        <div
          className="bottom-item recent-entry"
          style={{ cursor: "pointer" }}
        >
          <img src={assets.setting_icon} alt="settings" />
          {extended && <p>Settings</p>}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
