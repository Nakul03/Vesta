import React, { useState, useEffect, useRef, useCallback } from 'react';
import './AsteroidLauncher.css';
import L from 'leaflet';

// Note: Ensure you have installed leaflet and leaflet's CSS is imported in your main app file
// e.g., in index.js: import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet icons in Webpack/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});


const INITIAL_ASTEROIDS = [
    { name: "Asteroid 1 (150m)", diameter: 150.5, size: 200 },
    { name: "Asteroid 2 (250m)", diameter: 250.0, size: 300 },
    { name: "Asteroid 3 (50m)", diameter: 50.0, size: 60 },
];

const nasaApiKey = "NHPtmmQW98f68U57yRk7WljMlugkWbdF9DplbbCa"; 

const AsteroidLauncher = () => {
    const [view, setView] = useState('hero'); // 'hero', 'selector', 'launch', 'impact'
    const [asteroids, setAsteroids] = useState(INITIAL_ASTEROIDS);
    const [selectedAsteroid, setSelectedAsteroid] = useState(INITIAL_ASTEROIDS[0]);
    const [launchAngle, setLaunchAngle] = useState(45);
    const [velocity, setVelocity] = useState(20000); // m/s, initialized from 20 km/s
    const [impactLocation, setImpactLocation] = useState({ lat: 40.7128, lng: -74.0060 }); // NYC
    const [impactResults, setImpactResults] = useState(null);
    const [storySteps, setStorySteps] = useState([]);
    const [storyIndex, setStoryIndex] = useState(0);

    const launchMapRef = useRef(null);
    const impactMapRef = useRef(null);
    const launchMarkerRef = useRef(null);


    // 1. Star Generator Effect (Runs once on mount)
    useEffect(() => {
        const starsContainer = document.getElementById('stars');
        if (starsContainer) {
            // ... (Star generation logic) ...
            for (let i = 0; i < 100; i++) {
                const star = document.createElement('div');
                star.className = 'star';
                const size = Math.random() * 3 + 'px';
                star.style.width = size;
                star.style.height = size;
                star.style.left = Math.random() * 100 + '%';
                star.style.top = Math.random() * 100 + '%';
                star.style.animationDelay = Math.random() * 3 + 's';
                starsContainer.appendChild(star);
            }
        }
    }, []);

    // 2. Load Asteroids Effect (using useCallback to memoize the function)
    const loadAsteroids = useCallback(async () => {
        try {
            const res = await fetch(`https://api.nasa.gov/neo/rest/v1/neo/browse?api_key=${nasaApiKey}`);
            const data = await res.json();
            const loadedAsteroids = data.near_earth_objects.map(a => ({
                name: a.name,
                diameter: (a.estimated_diameter.meters.estimated_diameter_max + a.estimated_diameter.meters.estimated_diameter_min) / 2,
                size: a.estimated_diameter.meters.estimated_diameter_max
            }));

            setAsteroids(loadedAsteroids.slice(0, 8)); // Limit to first 8 for cleaner display
            setSelectedAsteroid(loadedAsteroids[0] || INITIAL_ASTEROIDS[0]);
        } catch (e) {
            console.error("Failed to load asteroids (using mock data as fallback):", e);
            setAsteroids(INITIAL_ASTEROIDS);
            setSelectedAsteroid(INITIAL_ASTEROIDS[0]);
        }
    }, []);

    const startExperience = () => {
        setView('selector');
        loadAsteroids();
    };

    const handleAsteroidSelect = (asteroid) => {
        setSelectedAsteroid(asteroid);
    };

    const proceedToLaunch = () => {
        setView('launch');
    };
    
    // --- FINALIZED MAP FIX IMPLEMENTATION ---
    // 3. Launch Map Initialization/Update Effect
    useEffect(() => {
        const mapElementId = 'launchMap';
        
        if (view === 'launch') {
            const initializeMap = () => {
                const mapElement = document.getElementById(mapElementId);
                
                // CRUCIAL CHECK: Only initialize if the element exists AND the map hasn't been created yet
                if (mapElement && launchMapRef.current === null) {
                    // *** 1. INITIALIZE MAP ***
                    const map = L.map(mapElementId).setView([impactLocation.lat, impactLocation.lng], 3);
                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);

                    const marker = L.marker([impactLocation.lat, impactLocation.lng]).addTo(map);

                    map.on('click', function (e) {
                        setImpactLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
                        marker.setLatLng([e.latlng.lat, e.latlng.lng]);
                    });

                    launchMapRef.current = map;
                    launchMarkerRef.current = marker;
                    
                    // CRUCIAL: Invalidate size immediately after initialization
                    map.invalidateSize();

                } else if (launchMapRef.current) {
                    // *** 2. RESIZE EXISTING MAP (e.g., if coming back from impact) ***
                    launchMapRef.current.invalidateSize();
                    launchMapRef.current.setView([impactLocation.lat, impactLocation.lng], 3);
                    if (launchMarkerRef.current) {
                        launchMarkerRef.current.setLatLng([impactLocation.lat, impactLocation.lng]);
                    }
                }
            };

            // Delay initialization slightly to ensure the component is fully visible and sized
            const timer = setTimeout(initializeMap, 100); 

            return () => {
                clearTimeout(timer);
                // Aggressive cleanup: If the view changes away from 'launch', destroy the map object
                // to prevent potential reference conflicts on re-entry.
                if (launchMapRef.current) {
                    // We don't remove the map here, as we rely on the logic above (step 2) 
                    // to resize it if we return from 'impact'. 
                    // However, if the map is still blank, uncommenting this might be the fix:
                    /* launchMapRef.current.remove();
                    launchMapRef.current = null;
                    launchMarkerRef.current = null;
                    */
                }
            };
        }
        // If the map is blank even with the setTimout, the issue is that it's being
        // retained/resized incorrectly. Let's make the destroy logic explicit when
        // leaving the map views entirely.
        if (view !== 'launch' && view !== 'impact' && launchMapRef.current) {
            launchMapRef.current.remove();
            launchMapRef.current = null;
            launchMarkerRef.current = null;
        }

    }, [view, impactLocation]);
    // -----------------------------

    const calculateImpact = useCallback(() => {
        if (!selectedAsteroid) return null;

        const radius = selectedAsteroid.diameter / 2;
        const volume = (4 / 3) * Math.PI * Math.pow(radius, 3);
        const density = 3000; 
        const mass = volume * density; 
        const kineticEnergy = 0.5 * mass * Math.pow(velocity, 2);

        return {
            mass: mass,
            energy: kineticEnergy,
            diameter: selectedAsteroid.diameter,
            velocity: velocity,
            angle: launchAngle
        };
    }, [selectedAsteroid, velocity, launchAngle]);

    const initializeStory = useCallback((stats) => {
        const steps = [
            `Do you know the asteroid that wiped out the dinosaurs was only about 10 km in diameter? The asteroid you selected is ${stats.diameter.toFixed(1)} meters across.`,
            `The asteroid will strike at latitude ${impactLocation.lat.toFixed(2)} and longitude ${impactLocation.lng.toFixed(2)}. A massive fireball will form immediately, incinerating everything nearby.`,
            `Thermal radiation and shockwaves will extend far beyond the impact. Winds will uproot forests and flatten cities. Dust and debris will block sunlight globally.`,
            `Crater diameter: approx ${(stats.diameter * 0.5).toFixed(1)} km. Earthquakes and tsunamis may occur. Air quality will drop severely.`,
            `Preventive measures include early detection, asteroid deflection technologies, and underground shelters. Evacuation plans could save some lives, but global destruction is likely with this object.`
        ];
        setStorySteps(steps);
        setStoryIndex(0);
    }, [impactLocation]);


    const showImpact = useCallback((stats) => {
        // Remove old map instance if it exists
        if (impactMapRef.current) impactMapRef.current.remove();

        // Initialize new impact map (ID is 'map')
        const map = L.map('map').setView([impactLocation.lat, impactLocation.lng], 4);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map);

        L.circle([impactLocation.lat, impactLocation.lng], { color: 'red', fillColor: 'rgba(255,0,0,0.3)', fillOpacity: 0.5, radius: 100000 }).addTo(map);

        const zones = [
            { label: 'Fireball', radius: stats.diameter * 1000 * 2, color: 'rgba(255,100,0,0.3)', className: 'zone-fireball' },
            { label: 'Thermal Radiation', radius: stats.diameter * 1000 * 4, color: 'rgba(255,150,0,0.3)', className: 'zone-radiation' },
            { label: 'Shockwave', radius: stats.diameter * 1000 * 6, color: 'rgba(255,200,0,0.3)', className: 'zone-shockwave' },
            { label: 'Wind', radius: stats.diameter * 1000 * 8, color: 'rgba(255,255,0,0.3)', className: 'zone-wind' }
        ];

        zones.forEach(function (z) {
            L.circle([impactLocation.lat, impactLocation.lng], { color: z.color, fillColor: z.color, fillOpacity: 0.2, radius: z.radius }).addTo(map);
        });

        const statsArr = [
            { label: 'Asteroid Diameter', value: stats.diameter.toFixed(1) + ' m' },
            { label: 'Impact Energy', value: (stats.energy / 1e15).toFixed(2) + ' PJ' },
            { label: 'Asteroid Mass', value: (stats.mass / 1e9).toFixed(2) + ' Gg' }
        ];

        setImpactResults({ zones, statsArr });
        impactMapRef.current = map;
        initializeStory(stats);
        
        // Ensure map is correctly sized
        map.invalidateSize();
    }, [impactLocation, initializeStory]);

    const launchAsteroid = () => {
        if (!selectedAsteroid) return alert('Select an asteroid first');
        const stats = calculateImpact();
        if (stats) {
            setView('impact');
            setTimeout(() => showImpact(stats), 100);
        }
    };

    const reset = () => {
        setImpactResults(null);
        setStorySteps([]);
        setStoryIndex(0);
        setView('launch'); 
    };

    // Story navigation handlers
    const nextStory = () => setStoryIndex(prev => (prev < storySteps.length - 1 ? prev + 1 : prev));
    const prevStory = () => setStoryIndex(prev => (prev > 0 ? prev - 1 : prev));

    // Render Sub-components
    const renderAsteroidSelector = () => (
        <div id="asteroid-selector">
            <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Choose Your Asteroid</h2>
            <p style={{ color: '#888', marginBottom: '2rem' }}>Select the size of asteroid you want to launch</p>
            <div className="asteroid-grid" id="asteroidGrid">
                {asteroids.map((a) => (
                    <div
                        key={a.name}
                        className={`asteroid-card ${selectedAsteroid && a.name === selectedAsteroid.name ? 'selected' : ''}`}
                        onClick={() => handleAsteroidSelect(a)}
                    >
                        <div className="asteroid-name">{a.name}</div>
                        <div className="asteroid-diameter">{a.diameter.toFixed(1)} m</div>
                    </div>
                ))}
            </div>
            {selectedAsteroid && (
                <button className="start-btn" onClick={proceedToLaunch} style={{marginTop: '2rem'}}>
                    Configure Launch ({selectedAsteroid.name})
                </button>
            )}
        </div>
    );

    const renderLaunchSection = () => (
        <div id="launch-section">
            <div className="launch-controls">
                <h2 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Launch Settings</h2>
                
                <div style={{marginBottom:'2rem', padding:'1rem', border:'1px solid #ff4444', borderRadius:'10px'}}>
                    Selected Asteroid: <strong>{selectedAsteroid?.name}</strong> (Diameter: {selectedAsteroid?.diameter.toFixed(1)} m)
                </div>

                <div className="control-group">
                    <h3>Launch Angle</h3>
                    <div className="slider-container">
                        <input
                            type="range"
                            id="angleSlider"
                            min="0"
                            max="90"
                            value={launchAngle}
                            onChange={(e) => setLaunchAngle(Number(e.target.value))}
                        />
                        <div className="value-display"><span id="angleValue">{launchAngle}</span>&deg;</div>
                    </div>
                </div>
                <div className="control-group">
                    <h3>Impact Velocity</h3>
                    <div className="slider-container">
                        <input
                            type="range"
                            id="velocitySlider"
                            min="11"
                            max="72"
                            value={velocity / 1000}
                            onChange={(e) => setVelocity(Number(e.target.value) * 1000)}
                        />
                        <div className="value-display"><span id="velocityValue">{velocity / 1000}</span> km/s</div>
                    </div>
                </div>
                <div className="control-group">
                    <h3>Click on map to set impact location</h3>
                    {/* The launchMap container is here */}
                    <div id="launchMap" style={{ height: '400px', borderRadius: '15px', marginTop: '1rem' }}></div>
                </div>
                <button className="launch-btn" onClick={launchAsteroid} disabled={!selectedAsteroid}>
                    LAUNCH
                </button>
            </div>
        </div>
    );

    const renderImpactSection = () => (
        <div id="impact-section">
            <h2 style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: '2rem' }}>Impact Results</h2>
            <div id="map"></div> {/* Impact Map container */}

            <div className="impact-stats" id="impactStats">
                {impactResults?.statsArr.map((s, index) => (
                    <div key={index} className="stat-card">
                        <div className="stat-label">{s.label}</div>
                        <div className="stat-value">{s.value}</div>
                    </div>
                ))}
            </div>

            <div className="damage-zones">
                <h3 style={{ marginBottom: '1rem', fontSize: '1.8rem' }}>Damage Zones</h3>
                <div id="damageZones">
                    {impactResults?.zones.map((z, index) => (
                        <div key={index} className={`zone ${z.className}`}>
                            <strong>{z.label}</strong> : {(z.radius / 1000).toFixed(1)} km
                        </div>
                    ))}
                </div>
            </div>

            <div className="comparison" id="comparison">
                <p>Impact Location: Lat {impactLocation.lat.toFixed(2)}, Lng {impactLocation.lng.toFixed(2)}</p>
                <p>Comparison: The Tunguska event (1908) was caused by a much smaller object, yet flattened 2,000 km² of forest. Your asteroid is significantly larger and faster.</p>
            </div>

            <div id="storyBox" style={{ display: storySteps.length > 0 ? 'block' : 'none' }}>
                <div id="storyText">{storySteps[storyIndex]}</div>
                <div className="story-nav">
                    <button id="prevStory" onClick={prevStory} disabled={storyIndex === 0}>Previous</button>
                    <button id="nextStory" onClick={nextStory} disabled={storyIndex === storySteps.length - 1}>Next</button>
                </div>
            </div>

            <button className="reset-btn" onClick={reset}>Launch Another Asteroid</button>
        </div>
    );


    // Main Render
    return (
        <>
            {view === 'hero' && (
                <div id="hero">
                    <div id="stars"></div>
                    <h1>Asteroid Launcher</h1>
                    <p className="subtitle">Choose your asteroid and launch it at Earth</p>
                    <button className="start-btn" onClick={startExperience}>Launch an Asteroid</button>
                </div>
            )}

            <div id="main-content" style={{ display: view !== 'hero' ? 'block' : 'none' }}>
                {view === 'selector' && renderAsteroidSelector()}
                {view === 'launch' && renderLaunchSection()}
                {view === 'impact' && renderImpactSection()}
            </div>
        </>
    );
};

export default AsteroidLauncher;