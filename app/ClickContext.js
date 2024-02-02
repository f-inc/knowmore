"use client";

// ClickContext.js
import { createContext, useContext, useState } from 'react';

const ClickContext = createContext();

export const ClickProvider = ({ children }) => {
  const [clickOccurred, setClickOccurred] = useState(false);

  const handleClick = () => {
    setClickOccurred(true);
  };

  const resetClick = () => {
    setClickOccurred(false);
  };

  return (
    <ClickContext.Provider value={{ clickOccurred, handleClick, resetClick }}>
      {children}
    </ClickContext.Provider>
  );
};

export const useClick = () => {
  return useContext(ClickContext);
};
