import React, { createContext, useState, useContext, useEffect } from 'react';

const PodcastContext = createContext();

export const PodcastProvider = ({ children }) => {
  const [savedPodcasts, setSavedPodcasts] = useState(() => {
    const storedPodcasts = localStorage.getItem('savedPodcasts');
    return storedPodcasts ? JSON.parse(storedPodcasts) : [];
  });

  const savePodcast = (podcast) => {
    const podcastName = prompt("Enter a name for your podcast:");
    if (!podcastName) {
      return; // User cancelled the prompt
    }

    const newPodcast = { ...podcast, name: podcastName };
    const updatedPodcasts = [...savedPodcasts, newPodcast];
    setSavedPodcasts(updatedPodcasts);
    localStorage.setItem('savedPodcasts', JSON.stringify(updatedPodcasts));
    alert("Podcast saved!");
  };

  const deletePodcast = (podcastId) => {
    const updatedPodcasts = savedPodcasts.filter(p => p.id !== podcastId);
    setSavedPodcasts(updatedPodcasts);
    localStorage.setItem('savedPodcasts', JSON.stringify(updatedPodcasts));
  };


  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'savedPodcasts') {
        setSavedPodcasts(e.newValue ? JSON.parse(e.newValue) : []);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <PodcastContext.Provider value={{ savedPodcasts, savePodcast, deletePodcast }}>
      {children}
    </PodcastContext.Provider>
  );
};

export const usePodcasts = () => {
  return useContext(PodcastContext);
};
