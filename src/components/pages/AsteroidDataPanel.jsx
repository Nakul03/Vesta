import React from 'react';
import './AsteroidDataPanel.css';

const AsteroidDataPanel = ({ asteroid }) => {
  return (
    <div className="asteroid-data-panel">
      <h2 className="asteroid-data-title">Asteroid Data</h2>
      <details className="accordion" open>
        <summary className="accordion-trigger">Selected Asteroid</summary>
        <div className="accordion-content">
          {asteroid ? (
            <div>
              <div className="asteroid-header">
                <h3 className="asteroid-name">{asteroid.name}</h3>
                {asteroid.is_potentially_hazardous_asteroid && (
                  <span className="hazardous-badge">Hazardous</span>
                )}
              </div>
              <p className="asteroid-info">
                ID: {asteroid.id} | JPL URL:{" "}
                <a
                  href={asteroid.nasa_jpl_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="jpl-link"
                >
                  Link
                </a>
              </p>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Property</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Absolute Magnitude</td>
                    <td>
                      {asteroid.absolute_magnitude_h.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td>Min Diameter (km)</td>
                    <td>
                      {asteroid.estimated_diameter.kilometers.estimated_diameter_min.toFixed(3)}
                    </td>
                  </tr>
                  <tr>
                    <td>Max Diameter (km)</td>
                    <td>
                      {asteroid.estimated_diameter.kilometers.estimated_diameter_max.toFixed(3)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <p>No asteroid selected.</p>
          )}
        </div>
      </details>
    </div>
  );
};

export default AsteroidDataPanel;
