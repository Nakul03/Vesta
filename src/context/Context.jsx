import { createContext, useState } from "react";
import runChat from "../config/Gemini.js";

export const Context = createContext();

export const ContextProvider = ({ children }) => {
  const [input, setInput] = useState("");
  const [recentPrompt, setRecentPrompt] = useState("");
  const [resultData, setResultData] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // ✅ Updated onSent to accept language
  const onSent = async (language = "en") => {
    if (!input.trim()) return;
    setLoading(true);
    setShowResults(true);
    setRecentPrompt(input);

    try {
      const response = await runChat(input, language); // pass language here
      setResultData(response);
    } catch (error) {
      console.error("Error in onSent:", error);
      setResultData("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Context.Provider
      value={{
        input,
        setInput,
        recentPrompt,
        resultData,
        loading,
        showResults,
        setShowResults,
        onSent,
      }}
    >
      {children}
    </Context.Provider>
  );
};
