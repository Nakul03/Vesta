import React, { useState, useEffect, useRef } from 'react';
import './Notification.css';

const Notification = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [asteroidData, setAsteroidData] = useState(null);
    const [loading, setLoading] = useState(true);
    const panelRef = useRef(null);
    const circleRef = useRef(null);

    const togglePanel = () => {
        setIsOpen(!isOpen);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isOpen && panelRef.current && !panelRef.current.contains(event.target) && circleRef.current && !circleRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [isOpen]);

    const fetchAsteroidData = async () => {
        const API_KEY = 'MwfPBwoFvtIiQXrn41tXzIW5AtxBxGl5PXH6lVCZ';
        const today = new Date().toISOString().split('T')[0];
        const apiUrl = `https://api.nasa.gov/neo/rest/v1/feed?start_date=${today}&end_date=${today}&api_key=${API_KEY}`;

        try {
            const response = await fetch(apiUrl);
            const data = await response.json();

            const asteroids = data.near_earth_objects[today] || [];
            const totalCount = asteroids.length;
            const hazardousCount = asteroids.filter(a => a.is_potentially_hazardous_asteroid).length;

            let closestDistance = Infinity;
            let largestSize = 0;

            asteroids.forEach(asteroid => {
                const distance = parseFloat(asteroid.close_approach_data[0].miss_distance.kilometers);
                const size = asteroid.estimated_diameter.meters.estimated_diameter_max;

                if (distance < closestDistance) {
                    closestDistance = distance;
                }

                if (size > largestSize) {
                    largestSize = size;
                }
            });

            setAsteroidData({
                totalCount,
                hazardousCount,
                closestDistance,
                largestSize,
                asteroids
            });
            setLoading(false);
        } catch (error) {
            console.error('Error fetching asteroid data:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAsteroidData();
        const interval = setInterval(fetchAsteroidData, 300000); // Auto-refresh every 5 minutes
        return () => clearInterval(interval);
    }, []);

    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 30000); // Update time every 30 seconds
        return () => clearInterval(timer);
    }, []);

    return (
        <>
            <div className="notification-circle" onClick={togglePanel} ref={circleRef}>
                <div className="live-dot"></div>
                <div className="icon">🌍</div>
                <div className="notification-badge">{asteroidData ? asteroidData.totalCount : 0}</div>
            </div>

            <div className={`notification-panel ${isOpen ? 'active' : ''}`} ref={panelRef}>
                <div className="panel-header">
                    <div>
                        <div className="panel-title">NASA Asteroid Tracking</div>
                        <div className="update-time">{`Updated at ${time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`}</div>
                    </div>
                    <button className="close-btn" onClick={togglePanel}>×</button>
                </div>
                <div className="panel-content">
                    {loading ? (
                        <div className="loading">
                            <div className="spinner"></div>
                            <div>Loading asteroid data...</div>
                        </div>
                    ) : asteroidData ? (
                        <>
                            <div className="info-banner">
                                <strong>What does this mean?</strong> These asteroids are passing near Earth today. "Near" in space terms means millions of kilometers away - all at safe distances. NASA continuously tracks these objects to ensure public safety.
                            </div>

                            <div className="stat-grid">
                                <div className="stat-item">
                                    <div className="stat-label">Asteroids Passing Today</div>
                                    <div className="stat-value">{asteroidData.totalCount}</div>
                                    <div className="stat-description">Objects making close approaches</div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-label">Potentially Hazardous</div>
                                    <div className="stat-value">{asteroidData.hazardousCount}</div>
                                    <div className="stat-description">
                                        {asteroidData.hazardousCount > 0
                                            ? `${asteroidData.hazardousCount} object${asteroidData.hazardousCount > 1 ? 's' : ''} classified as potentially hazardous but all are being safely monitored.`
                                            : 'All objects are classified as safe. No threats detected.'}
                                    </div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-label">Closest Distance</div>
                                    <div className="stat-value">{(asteroidData.closestDistance / 384400).toFixed(2)} LD</div>
                                    <div className="stat-description">{(asteroidData.closestDistance / 1000000).toFixed(2)} million km away</div>
                                </div>
                                <div className="stat-item">
                                    <div className="stat-label">Largest Object</div>
                                    <div className="stat-value">{Math.round(asteroidData.largestSize)}m</div>
                                    <div className="stat-description">Estimated maximum diameter</div>
                                </div>
                            </div>

                            <div className="asteroid-list">
                                <div className="list-title">Today's Close Approaches</div>
                                {asteroidData.asteroids.slice(0, 5).map(asteroid => {
                                    const dist = parseFloat(asteroid.close_approach_data[0].miss_distance.kilometers);
                                    const distLD = (dist / 384400).toFixed(2);
                                    const distMillion = (dist / 1000000).toFixed(2);
                                    const size = Math.round(asteroid.estimated_diameter.meters.estimated_diameter_max);
                                    const velocity = Math.round(parseFloat(asteroid.close_approach_data[0].relative_velocity.kilometers_per_hour));

                                    return (
                                        <div className="asteroid-item" key={asteroid.id}>
                                            <div className="asteroid-name">
                                                {asteroid.name}
                                                {asteroid.is_potentially_hazardous_asteroid
                                                    ? <span className="hazard-badge">POTENTIALLY HAZARDOUS</span>
                                                    : <span className="safe-badge">SAFE</span>}
                                            </div>
                                            <div className="asteroid-details">
                                                <span><strong>Distance:</strong> {distLD} LD ({distMillion}M km)</span>
                                                <span><strong>Size:</strong> ~{size} meters</span>
                                                <span><strong>Speed:</strong> {velocity.toLocaleString()} km/h</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="refresh-info">
                                <strong>Note:</strong> LD = Lunar Distance (distance from Earth to Moon = 384,400 km).
                                Data updates every 5 minutes from NASA's Near Earth Object Web Service.
                            </div>
                        </>
                    ) : (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>
                            <p style={{ marginBottom: '10px' }}><strong>Connection Error</strong></p>
                            <p style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>Unable to retrieve data from NASA servers. This could be due to network connectivity or API limitations.</p>
                            <button onClick={fetchAsteroidData} style={{ marginTop: '15px', padding: '10px 20px', background: '#667eea', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>Try Again</button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default Notification;