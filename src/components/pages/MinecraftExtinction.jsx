import React, { useEffect } from "react";
import "./MinecraftExtinction";

const MinecraftChanges = () => {
  useEffect(() => {
    const scriptSources = [
      "https://aframe.io/releases/1.4.2/aframe.min.js",
      "https://cdn.jsdelivr.net/gh/c-frame/aframe-extras@7.0.0/dist/aframe-extras.min.js",
      "https://cdn.jsdelivr.net/gh/c-frame/aframe-particle-system-component@1.0.x/dist/aframe-particle-system-component.min.js"
    ];
    
    let scriptsLoaded = 0;

    const phase1_AsteroidApproach = () => {
        console.log("phase1_AsteroidApproach has been called");
    }

    const onAllScriptsLoaded = () => {
        window.beginExtinction = () => {
            document.getElementById("start-btn").style.display = "none";
            document.getElementById("restart-btn").style.display = "inline-block";
            phase1_AsteroidApproach();
        };
    }

    scriptSources.forEach((src) => {
        const script = document.createElement("script");
        script.src = src;
        script.async = false;
        script.onload = () => {
            scriptsLoaded++;
            if (scriptsLoaded === scriptSources.length) {
                onAllScriptsLoaded();
            }
        };
        document.body.appendChild(script);
    });

  }, []);

  return (
    <div>
      <a-scene
        background="color: #87CEEB"
        fog="type: linear; color: #87CEEB; far: 600"
      >
        {/* === Your A-Frame scene elements go here === */}
        {/* Example placeholder below; paste the full <a-scene> content from HTML */}
        <a-sky color="#87CEEB"></a-sky>
        <a-entity id="rig" position="0 1.6 40">
          <a-camera wasd-controls="acceleration: 45" look-controls>
            <a-cursor color="#00FF00"></a-cursor>
          </a-camera>
        </a-entity>
      </a-scene>

      <div id="stats">
        <h3>⚠ IMPACT METRICS</h3>
        <div className="stat">
          <span className="label">Temperature:</span>
          <span className="value" id="temp">
            +22°C
          </span>
        </div>
      </div>

      <div id="ui">
        <h2 id="phase-title">🦕 MINECRAFT CRETACEOUS - 66 MILLION YEARS AGO</h2>
        <p id="phase-desc">
          A peaceful blocky Minecraft world thrives in the late Cretaceous
          period.
        </p>
        <button onClick={() => window.beginExtinction()} id="start-btn">
          ⚠️ INITIATE ASTEROID IMPACT
        </button>
        <button
          onClick={() => window.location.reload()}
          id="restart-btn"
          style={{ display: "none" }}
        >
          ↻ RESET WORLD
        </button>
      </div>
    </div>
  );
};

export default MinecraftChanges;
