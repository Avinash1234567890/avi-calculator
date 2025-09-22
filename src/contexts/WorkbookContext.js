import React, { createContext, useContext, useState } from 'react';

const WorkbookContext = createContext();

export const useWorkbook = () => {
  const context = useContext(WorkbookContext);
  if (!context) {
    throw new Error('useWorkbook must be used within a WorkbookProvider');
  }
  return context;
};

export const WorkbookProvider = ({ children }) => {
  const [currentWorkbook, setCurrentWorkbook] = useState(null);
  const [currentProblem, setCurrentProblem] = useState(null);
  const [workbooks, setWorkbooks] = useState([]);
  const [problems, setProblems] = useState([]);

  const selectWorkbook = (workbook) => {
    setCurrentWorkbook(workbook);
    setCurrentProblem(null); // Reset problem when switching workbooks
  };

  const selectProblem = (problem) => {
    setCurrentProblem(problem);
  };

  const value = {
    currentWorkbook,
    currentProblem,
    workbooks,
    problems,
    setWorkbooks,
    setProblems,
    selectWorkbook,
    selectProblem
  };

  return (
    <WorkbookContext.Provider value={value}>
      {children}
    </WorkbookContext.Provider>
  );
};
