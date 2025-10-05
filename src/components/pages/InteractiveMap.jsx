// You need to install react-globe.gl: npm install react-globe.gl
import React, { useEffect, useRef } from 'react';
import Globe from 'react-globe.gl';
import './InteractiveMap.css';

const InteractiveMap = () => {
  const globeEl = useRef();

  useEffect(() => {
    if (globeEl.current) {
      globeEl.current.pointOfView({ lat: 0, lng: 0, altitude: 2.5 });
    }
  }, []);

  return (
    <div className="map-wrapper">
      <Globe
        ref={globeEl}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        backgroundColor="rgba(0,0,0,0)"
      />
    </div>
  );
};

export default InteractiveMap;
