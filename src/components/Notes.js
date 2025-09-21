import React, { useState } from 'react';
import '../styles/notes.css';

function Notes() {
  // State management
  const [currentNote, setCurrentNote] = useState('');
  const [savedNotes, setSavedNotes] = useState([]);
  const [activeTabId, setActiveTabId] = useState(null);

  // Constants
  const MATH_INPUT_REGEX = /^[0-9+\-*/.() ]*$/;

  // Input validation and handling
  const isValidInput = (value) => {
    return MATH_INPUT_REGEX.test(value) || value === '';
  };

  const handleInputChange = (event) => {
    const { value } = event.target;
    
    if (isValidInput(value)) {
      setCurrentNote(value);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && currentNote.trim()) {
      saveCurrentNote();
    }
  };

  // Note management functions
  const saveCurrentNote = () => {
    const newNote = createNote(currentNote.trim());
    
    setSavedNotes(previousNotes => [...previousNotes, newNote]);
    setCurrentNote('');
    setActiveTabId(newNote.id);
  };

  const createNote = (content) => ({
    id: Date.now(),
    content,
    timestamp: new Date().toLocaleTimeString()
  });

  const deleteNote = (noteId) => {
    setSavedNotes(previousNotes => 
      previousNotes.filter(note => note.id !== noteId)
    );
    
    if (activeTabId === noteId) {
      setActiveTabId(null);
    }
  };

  const selectTab = (noteId) => {
    setActiveTabId(noteId);
  };

  // Helper functions
  const getActiveNote = () => {
    return savedNotes.find(note => note.id === activeTabId);
  };

  const getActiveNoteContent = () => {
    const activeNote = getActiveNote();
    return activeNote ? activeNote.content : '';
  };

  const hasNotes = () => savedNotes.length > 0;

  // Event handlers
  const handleTabClick = (noteId) => {
    selectTab(noteId);
  };

  const handleDeleteClick = (event, noteId) => {
    event.stopPropagation();
    deleteNote(noteId);
  };

  // Render components
  const renderInputSection = () => (
    <div className="notes-input-section">
      <h3>Calculator Notes</h3>
      <input
        type="text"
        value={currentNote}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        placeholder="Type numbers or calculations and press Enter to save..."
        className="notes-input"
        aria-label="Note input field"
      />
      <p className="notes-hint">Press Enter to save as a new tab</p>
    </div>
  );

  const renderNoteTab = (note, index) => (
    <div
      key={note.id}
      className={`note-tab ${activeTabId === note.id ? 'active' : ''}`}
      onClick={() => handleTabClick(note.id)}
      role="button"
      tabIndex={0}
      aria-label={`Note ${index + 1} - ${note.content}`}
    >
      <span className="tab-label">Note {index + 1}</span>
      <span className="tab-time">{note.timestamp}</span>
      <button
        className="delete-tab"
        onClick={(event) => handleDeleteClick(event, note.id)}
        aria-label={`Delete note ${index + 1}`}
        title="Delete note"
      >
        ×
      </button>
    </div>
  );

  const renderNoteTabs = () => (
    <div className="notes-tabs">
      {savedNotes.map(renderNoteTab)}
    </div>
  );

  const renderNoteContent = () => {
    if (!activeTabId) return null;

    return (
      <div className="note-content">
        <h4>Note Content:</h4>
        <div className="note-display" role="region" aria-label="Note content">
          {getActiveNoteContent()}
        </div>
      </div>
    );
  };

  const renderTabsSection = () => (
    <div className="notes-tabs-section">
      {renderNoteTabs()}
      {renderNoteContent()}
    </div>
  );

  const renderEmptyState = () => (
    <div className="empty-state">
      <p>No notes saved yet. Type some numbers and press Enter to create your first note!</p>
    </div>
  );

  // Main render
  return (
    <div className="notes-container">
      {renderInputSection()}
      {hasNotes() ? renderTabsSection() : renderEmptyState()}
    </div>
  );
}

export default Notes;