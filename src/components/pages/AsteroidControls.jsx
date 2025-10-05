import React from 'react';
import './AsteroidControls.css';

const AsteroidControls = () => {
  return (
    <div className="asteroid-controls">
      <h2 className="controls-title">Asteroid Controls</h2>
      <div className="controls-container">
        <div>
          <label htmlFor="density" className="control-label">Density (kg/m³)</label>
          <select id="density" defaultValue="3000" className="control-select">
            <option value="1500">Ice (1500)</option>
            <option value="3000">Rock (3000)</option>
            <option value="8000">Iron (8000)</option>
          </select>
        </div>
        <div>
          <label htmlFor="velocity" className="control-label">Velocity (km/s)</label>
          <input type="range" id="velocity" defaultValue="20" min="11" max="72" step="1" className="control-slider" />
        </div>
        <div>
          <label htmlFor="angle" className="control-label">Impact Angle (°)</label>
          <input type="range" id="angle" defaultValue="45" min="0" max="90" step="1" className="control-slider" />
        </div>
        <button className="launch-button">Launch Asteroid</button>
      </div>
    </div>
  );
};

export default AsteroidControls;
