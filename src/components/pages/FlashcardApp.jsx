import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, BookOpen } from 'lucide-react';
import './FlashcardApp.css';

const FlashcardApp = () => {
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // API parameters state
  const [apiParams, setApiParams] = useState({
    document_id: 1,
    num_cards: 20
  });
  const [apiKey, setApiKey] = useState("");
  const [tempApiKey, setTempApiKey] = useState("");

  const handleApiKeyChange = (e) => {
    setTempApiKey(e.target.value);
  };

  const handleSetApiKey = () => {
    setApiKey(tempApiKey);
  };

  // Function to fetch flashcards from your FastAPI endpoint
  const fetchFlashcards = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Prepare request body
      const requestBody = {
        document_id: apiParams.document_id,
        num_cards: apiParams.num_cards
      };
      
      console.log('Sending request to /generate-flashcards with body:', requestBody);
      
      const response = await fetch('http://localhost:8000/generate-flashcards', {
        method: 'POST', // Changed from GET to POST
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestBody) // Send as JSON body instead of query params
      });
      
      // Check if response is HTML (indicates wrong endpoint)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        console.log('❌ Endpoint returned HTML instead of JSON');
        throw new Error('API endpoint returned HTML - check if FastAPI server is running');
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }
      const responseText = await response.text();
      console.log('✅ Raw API Response:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('JSON Parse Error:', parseError);
        console.error('Response was not valid JSON:', responseText.substring(0, 200));
        throw new Error('Server returned invalid JSON response');
      }
      
      // Your API returns the structure with flashcards array
      if (data.flashcards && Array.isArray(data.flashcards)) {
        const flashcardsWithIds = data.flashcards.map((card, index) => ({ ...card, id: `${Date.now()}-${index}` }));
        setFlashcards(flashcardsWithIds);
        setCurrentIndex(0); // Reset to first card
        setIsFlipped(false); // Reset flip state
        console.log(`✅ Successfully loaded ${data.flashcards.length} flashcards`);
      } else if (Array.isArray(data)) {
        // If the response is directly an array of flashcards
        const flashcardsWithIds = data.map((card, index) => ({ ...card, id: `${Date.now()}-${index}` }));
        setFlashcards(flashcardsWithIds);
        setCurrentIndex(0);
        setIsFlipped(false);
        console.log(`✅ Successfully loaded ${data.length} flashcards`);
      } else {
        console.error('Unexpected response format:', data);
        throw new Error('Invalid response format - expected flashcards array or object with flashcards property');
      }
      
    } catch (err) {
      setError(`Failed to load flashcards. This is likely due to a rate limit on the AI service. Please wait a few minutes and try again.`);
      console.error('Error fetching flashcards:', err);
      
      // Don't set fallback data - let the error state handle it
      // This ensures we only show actual data from your API
      setFlashcards([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlashcards();
  }, []); // Removed apiParams dependency to prevent infinite loop

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const nextCard = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const prevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const resetCard = () => {
    setIsFlipped(false);
  };

  const saveCard = () => {
    const currentCard = flashcards[currentIndex];
    if (!currentCard) return;

    const savedFlashcards = JSON.parse(localStorage.getItem('savedFlashcards')) || [];
    
    // Check if the card is already saved
    if (savedFlashcards.some(card => card.id === currentCard.id)) {
        // Maybe show a notification that it's already saved
        console.log("Flashcard already saved!");
        return;
    }

    const newSavedFlashcards = [...savedFlashcards, currentCard];
    localStorage.setItem('savedFlashcards', JSON.stringify(newSavedFlashcards));

    // Dispatch a storage event to notify other components
    window.dispatchEvent(new Event('storage'));
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 0: return 'difficulty-new';
      case 1: return 'difficulty-easy';
      case 2: return 'difficulty-medium';
      case 3: return 'difficulty-hard';
      default: return 'difficulty-unknown';
    }
  };

  const getDifficultyLabel = (difficulty) => {
    switch (difficulty) {
      case 0: return 'New';
      case 1: return 'Easy';
      case 2: return 'Medium';
      case 3: return 'Hard';
      default: return 'Unknown';
    }
  };

  if (loading) {
    return (
      <div className="flashcard-app loading-screen">
        <div className="loading-content">
          <div className="spinner"></div>
          <p className="loading-text">Loading flashcards...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flashcard-app error-screen">
        <div className="error-content">
          <p className="error-message-custom">{error}</p>
          <button 
            onClick={fetchFlashcards}
            className="retry-button"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="flashcard-app empty-screen">
        <div className="empty-content">
          <BookOpen className="empty-icon" />
          <p className="empty-message">No flashcards available</p>
        </div>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];

  return (
    <div className="flashcard-app">
      <div className="app-container">
        {/* Header */}
        <div className="header">
          <h1 className="app-title">Flashcard Study</h1>
          <p className="card-counter">
            Card {currentIndex + 1} of {flashcards.length}
          </p>
          
          {/* API Parameter Controls */}
          <div className="api-controls">
            <div className="control-group">
              <label className="control-label">Document ID:</label>
              <input
                type="number"
                value={apiParams.document_id}
                onChange={(e) => setApiParams({...apiParams, document_id: parseInt(e.target.value) || 1})}
                className="control-input"
                min="1"
              />
            </div>
            
            <div className="control-group">
              <label className="control-label">Cards:</label>
              <input
                type="number"
                value={apiParams.num_cards}
                onChange={(e) => setApiParams({...apiParams, num_cards: parseInt(e.target.value) || 20})}
                className="control-input"
                min="1"
                max="50"
              />
            </div>
            
            <button
              onClick={() => fetchFlashcards()}
              disabled={loading}
              className="generate-button"
            >
              {loading ? 'Loading...' : 'Generate Cards'}
            </button>
          </div>

          {/* API Key Input */}
          
        </div>

        {/* Progress Bar */}
        

        {/* Flashcard */}
        <div className="flashcard-container">
          <div 
            className="flashcard"
            onClick={handleFlip}
          >
            {/* Front of card (Question) */}
            <div className={`card-face card-front ${isFlipped ? 'flipped' : ''}`}>
              <div className="card-content">
                <div className="difficulty-container">
                  <span className={`difficulty-badge ${getDifficultyColor(currentCard.difficulty)}`}>
                    {getDifficultyLabel(currentCard.difficulty)}
                  </span>
                </div>
                <h2 className="card-title">Question</h2>
                <p className="card-text">{currentCard.question}</p>
                <p className="card-hint">Click to reveal answer</p>
              </div>
            </div>

            {/* Back of card (Answer) */}
            <div className={`card-face card-back ${isFlipped ? 'flipped' : ''}`}>
              <div className="card-content">
                <h2 className="card-title-back">Answer</h2>
                <p className="card-text-back">{currentCard.answer}</p>
                <p className="card-hint-back">Click to view question</p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="controls">
          <button
            onClick={prevCard}
            disabled={currentIndex === 0}
            className={`control-button prev-button ${currentIndex === 0 ? 'disabled' : ''}`}
          >
            <ChevronLeft className="button-icon" />
            Previous
          </button>

          <button
            onClick={resetCard}
            className="control-button reset-button"
          >
            <RotateCcw className="button-icon" />
            Reset
          </button>

          <button
            onClick={saveCard}
            className="control-button reset-button"
          >
            Save
          </button>

          <button
            onClick={nextCard}
            disabled={currentIndex === flashcards.length - 1}
            className={`control-button next-button ${currentIndex === flashcards.length - 1 ? 'disabled' : ''}`}
          >
            Next
            <ChevronRight className="button-icon" />
          </button>
        </div>

        {/* Card Info */}
        
      </div>
    </div>
  );
};

export default FlashcardApp;
