import React from 'react';
import Calculator from './Calculator';
import Notes from './Notes';
import '../styles/main-content.css';

function MainContent({ showNotes }) {
  return (
    <main className="app-container">
      <Calculator />
      {showNotes && <Notes />}
    </main>
  );
}

export default MainContent;
