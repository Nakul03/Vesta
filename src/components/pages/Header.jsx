import React from 'react';
import './Header.css';

const Header = () => {
  return (
    <div className="header-container">
      <div className="header-title-container">
        <h1 className="header-title">ASTEROID LAUNCHER</h1>
      </div>
      <div className="header-buttons-container">
        <button className="github-button">
          {/* Placeholder for Github icon */}
          GH
        </button>
      </div>
    </div>
  );
};

export default Header;
