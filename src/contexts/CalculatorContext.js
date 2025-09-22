import React, { createContext, useContext, useState } from 'react';

const CalculatorContext = createContext();

export const useCalculator = () => {
  const context = useContext(CalculatorContext);
  if (!context) {
    throw new Error('useCalculator must be used within a CalculatorProvider');
  }
  return context;
};

export const CalculatorProvider = ({ children }) => {
  const [calculatorState, setCalculatorState] = useState({
    currentOperand: null,
    previousOperand: null,
    operation: null
  });

  const updateCalculatorState = (newState) => {
    setCalculatorState(newState);
  };

  return (
    <CalculatorContext.Provider value={{ calculatorState, updateCalculatorState }}>
      {children}
    </CalculatorContext.Provider>
  );
};
