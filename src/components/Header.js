import React from 'react';
import { supabase } from '../lib/supabase';
import { useWorkbook } from '../contexts/WorkbookContext';
import '../styles/header.css';

function Header({ session, showStickyNotes, setShowStickyNotes, showInstructions, setShowInstructions, showNotes, setShowNotes, showWorkbooks, setShowWorkbooks }) {
  const { currentWorkbook, currentProblem } = useWorkbook();

  const getWorkbookButtonText = () => {
    if (showWorkbooks) {
      return 'Hide Workbooks';
    }
    
    if (currentWorkbook && currentProblem) {
      return `${currentWorkbook.name} › ${currentProblem.name}`;
    } else if (currentWorkbook) {
      return `${currentWorkbook.name} › Select Problem`;
    } else {
      return 'Select Workbook';
    }
  };

  return (
    <header className="App-header">
      <h1 className="header-title">Avi's Calculator</h1>
      <div className="header-controls">
        <button 
          onClick={() => setShowWorkbooks(!showWorkbooks)}
          className="header-btn workbook-btn"
          title={currentWorkbook && currentProblem ? `Working on: ${currentWorkbook.name} → ${currentProblem.name}` : 'Select a workbook and problem to organize your work'}
        >
          {getWorkbookButtonText()}
        </button>
        <button 
          onClick={() => setShowInstructions(!showInstructions)}
          className="header-btn"
        >
          {showInstructions ? 'Hide Guide' : 'Instructions'}
        </button>
        <button 
          onClick={() => setShowNotes(!showNotes)}
          className="header-btn"
        >
          {showNotes ? 'Hide Notes' : 'Calculator Notes'}
        </button>
        <button 
          onClick={() => setShowStickyNotes(!showStickyNotes)}
          className="header-btn"
        >
          {showStickyNotes ? 'Hide Notes' : 'Sticky Notes'}
        </button>
        <span className="user-email">
          {session.user.email}
        </span>
        <button 
          onClick={() => supabase.auth.signOut()}
          className="header-btn"
        >
          Sign Out
        </button>
      </div>
    </header>
  );
}

export default Header;
