import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { assets } from "../../assets/assets";
import "./main.css";
import { Context } from "../../context/Context";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const Main = () => {
  const { onSent, recentPrompt, showResults, loading, resultData, setInput, input } =
    useContext(Context);

  const navigate = useNavigate();

  const asteroidCards = [
    {
      type: "C-type Asteroid",
      description: "Carbonaceous asteroids, dark, and rich in carbon and organic compounds.",
      image: assets.c,
    },
    {
      type: "S-type Asteroid",
      description: "Silicaceous asteroids, bright, made mostly of silicate minerals.",
      image: assets.s,
    },
    {
      type: "M-type Asteroid",
      description: "Metallic asteroids, mainly nickel-iron, often reflective.",
      image: assets.m,
    },
    {
      type: "V-type Asteroid",
      description: "Vestoids, basaltic, associated with asteroid 4 Vesta.",
      image: assets.v,
    },
  ];

  return (
    <div className="main">
      <div className="nav"></div>

      <div className="main-container">
        {!showResults ? (
          <>
            <div className="greet">
              <p><span>Hey, Buddy</span></p>
              <p>Let's Discover Asteroids</p>
            </div>

            <div className="cards">
              {asteroidCards.map((card, index) => (
                <div
                  key={index}
                  className="asteroid-card"
                  
                >
                  <h3 className="asteroid-title">{card.type}</h3>
                  <img src={card.image} alt={card.type} className="asteroid-img" />
                  <p className="asteroid-desc">{card.description}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="result">
            <div className="result-title">
              <img src={assets.user} alt="user" />
              <p>{recentPrompt}</p>
            </div>
            <div className="result-data">
              <img src={assets.logo} alt="logo" />
              {loading ? (
                <div className="loader">
                  <hr />
                  <hr />
                  <hr />
                </div>
              ) : (
                <div className="prose max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {resultData}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Search / Prompt Input */}
        <div className="main-bottom">
          <div className="search-box">
            <input
              type="text"
              value={input}
              placeholder="Enter the Prompt Here"
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  onSent(); // removed language parameter
                }
              }}
            />
            <div>
              <img
                src={assets.send_icon}
                alt="send"
                onClick={() => onSent()} // removed language parameter
              />
            </div>
          </div>
          <div className="bottom-info">
            <p></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main;
