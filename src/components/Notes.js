import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useCalculator } from '../contexts/CalculatorContext';
import { useWorkbook } from '../contexts/WorkbookContext';
import '../styles/notes.css';

function Notes() {
  // State management
  const [currentNote, setCurrentNote] = useState('');
  const [savedNotes, setSavedNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('history'); // 'history' or 'compact'

  // Get calculator state from context
  const { calculatorState } = useCalculator();
  
  // Get workbook context
  const { currentWorkbook, currentProblem } = useWorkbook();

  // Constants
  const MATH_INPUT_REGEX = /^[0-9+\-*/.() ]*$/;

  // Load notes from Supabase on component mount and when workbook/problem changes
  useEffect(() => {
    loadNotes();
  }, [currentWorkbook, currentProblem]);

  // Add Tab key listener for creating notes from calculator
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Check if user is typing in an input field
      const activeElement = document.activeElement;
      const isTypingInInput = activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.contentEditable === 'true' ||
        activeElement.isContentEditable
      );
      
      // Only handle Tab if not typing in an input and calculator has a value
      if (!isTypingInInput && event.key === 'Tab' && calculatorState.currentOperand) {
        event.preventDefault();
        createNoteFromCalculator();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [calculatorState.currentOperand]);

  const createNoteFromCalculator = async () => {
    const calculatorValue = calculatorState.currentOperand;
    if (!calculatorValue) return;

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      const newNote = {
        content: calculatorValue,
        timestamp: new Date().toISOString(),
        user_id: user.id
      };

      // Add workbook and problem IDs if selected
      if (currentWorkbook && currentProblem) {
        newNote.workbook_id = currentWorkbook.id;
        newNote.problem_id = currentProblem.id;
      } else if (currentWorkbook) {
        newNote.workbook_id = currentWorkbook.id;
      }

      const { data, error } = await supabase
        .from('notes')
        .insert([newNote])
        .select()
        .single();

      if (error) throw error;

      const formattedNote = {
        id: data.id,
        content: data.content,
        timestamp: data.timestamp,
        created_at: data.created_at,
        formattedTime: new Date(data.created_at).toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }),
        relativeTime: getRelativeTime(new Date(data.created_at))
      };

      setSavedNotes(prev => [formattedNote, ...prev]);
      setError(null);

      // Show visual feedback
      const calculatorOutput = document.querySelector('.current-operand');
      if (calculatorOutput) {
        calculatorOutput.style.background = 'rgba(102, 126, 234, 0.3)';
        calculatorOutput.style.transition = 'background 0.3s ease';
        setTimeout(() => {
          calculatorOutput.style.background = '';
        }, 300);
      }

    } catch (error) {
      setError('Failed to save calculator value: ' + error.message);
      console.error('Error saving calculator note:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNotes = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      let query = supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id);

      // Filter by current workbook and problem if selected
      if (currentWorkbook && currentProblem) {
        query = query
          .eq('workbook_id', currentWorkbook.id)
          .eq('problem_id', currentProblem.id);
      } else if (currentWorkbook) {
        query = query.eq('workbook_id', currentWorkbook.id);
      } else {
        // If no workbook selected, show notes without workbook association
        query = query.is('workbook_id', null);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      const formattedNotes = data.map(note => ({
        id: note.id,
        content: note.content,
        timestamp: note.timestamp,
        created_at: note.created_at,
        formattedTime: new Date(note.created_at).toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }),
        relativeTime: getRelativeTime(new Date(note.created_at))
      }));

      setSavedNotes(formattedNotes);
    } catch (error) {
      setError('Failed to load notes');
      console.error('Error loading notes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get relative time
  const getRelativeTime = (date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

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
  const saveCurrentNote = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: { user } } = await supabase.auth.getUser();

      const noteData = { 
        content: currentNote.trim(),
        timestamp: new Date().toISOString(),
        user_id: user.id
      };

      // Add workbook and problem IDs if selected
      if (currentWorkbook && currentProblem) {
        noteData.workbook_id = currentWorkbook.id;
        noteData.problem_id = currentProblem.id;
      } else if (currentWorkbook) {
        noteData.workbook_id = currentWorkbook.id;
      }

      const { data, error } = await supabase
        .from('notes')
        .insert([noteData])
        .select()
        .single();

      if (error) throw error;

      const newNote = {
        id: data.id,
        content: data.content,
        timestamp: data.timestamp,
        created_at: data.created_at,
        formattedTime: new Date(data.created_at).toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }),
        relativeTime: 'Just now'
      };

      setSavedNotes(previousNotes => [newNote, ...previousNotes]);
      setCurrentNote('');
    } catch (error) {
      setError('Failed to save note');
      console.error('Error saving note:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async (noteId) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId)
        .eq('user_id', user.id);

      if (error) throw error;

      setSavedNotes(previousNotes => 
        previousNotes.filter(note => note.id !== noteId)
      );
    } catch (error) {
      setError('Failed to delete note');
      console.error('Error deleting note:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearAllNotes = async () => {
    if (!window.confirm('Are you sure you want to delete all notes? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setSavedNotes([]);
    } catch (error) {
      setError('Failed to clear notes');
      console.error('Error clearing notes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const hasNotes = () => savedNotes.length > 0;

  const groupNotesByDate = () => {
    const groups = {};
    savedNotes.forEach(note => {
      const date = new Date(note.created_at).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(note);
    });
    return groups;
  };

  // Event handlers
  const handleDeleteClick = (noteId) => {
    deleteNote(noteId);
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === 'history' ? 'compact' : 'history');
  };

  // Render components
  const renderInputSection = () => (
    <div className="notes-input-section">
      <div className="notes-header">
        <h3>Calculator Notes</h3>
        <div className="notes-controls">
          <button 
            className="view-toggle-btn"
            onClick={toggleViewMode}
            disabled={loading}
          >
            {viewMode === 'history' ? 'Compact' : 'History'}
          </button>
          {hasNotes() && (
            <button 
              className="clear-all-btn"
              onClick={clearAllNotes}
              disabled={loading}
              title="Clear all notes"
            >
              Clear All
            </button>
          )}
        </div>
      </div>
      <input
        type="text"
        value={currentNote}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        placeholder="Type numbers or calculations and press Enter to save... (Or press Tab to save calculator result)"
        className="notes-input"
        aria-label="Note input field"
        disabled={loading}
      />
      <p className="notes-hint">
        Press Enter to save to history • Press Tab to save calculator result
        {loading && " (Saving...)"}
      </p>
      {error && <p className="error-message">{error}</p>}
      {hasNotes() && (
        <div className="notes-stats">
          Total notes: {savedNotes.length}
        </div>
      )}
    </div>
  );

  const renderHistoryNote = (note, index) => (
    <div key={note.id} className="history-note-item">
      <div className="note-header">
        <span className="note-index">#{savedNotes.length - index}</span>
        <div className="note-timestamps">
          <span className="note-time-relative">{note.relativeTime}</span>
          <span className="note-time-full">{note.formattedTime}</span>
        </div>
        <button
          className="delete-note-btn"
          onClick={() => handleDeleteClick(note.id)}
          disabled={loading}
          title="Delete note"
          aria-label={`Delete note ${note.content}`}
        >
          ×
        </button>
      </div>
      <div className="note-content-history">
        {note.content}
      </div>
    </div>
  );

  const renderCompactNote = (note, index) => (
    <div key={note.id} className="compact-note-item">
      <span className="compact-note-index">#{savedNotes.length - index}</span>
      <span className="compact-note-content">{note.content}</span>
      <span className="compact-note-time">{note.relativeTime}</span>
      <button
        className="compact-delete-btn"
        onClick={() => handleDeleteClick(note.id)}
        disabled={loading}
        title="Delete note"
      >
        ×
      </button>
    </div>
  );

  const renderHistoryView = () => {
    const groupedNotes = groupNotesByDate();
    
    return (
      <div className="notes-history-view">
        {Object.entries(groupedNotes).map(([date, notes]) => (
          <div key={date} className="notes-date-group">
            <h4 className="date-header">{new Date(date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</h4>
            <div className="date-notes">
              {notes.map((note) => {
                const index = savedNotes.findIndex(n => n.id === note.id);
                return renderHistoryNote(note, index);
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderCompactView = () => (
    <div className="notes-compact-view">
      {savedNotes.map(renderCompactNote)}
    </div>
  );

  const renderNotesSection = () => (
    <div className="notes-display-section">
      {viewMode === 'history' ? renderHistoryView() : renderCompactView()}
    </div>
  );

  const renderEmptyState = () => (
    <div className="empty-state">
      <p>
        {loading 
          ? "Loading notes..." 
          : "No notes in your history yet. Type some calculations and press Enter to start building your history!"
        }
      </p>
    </div>
  );

  // Main render
  return (
    <div className="notes-container">
      {renderInputSection()}
      {hasNotes() ? renderNotesSection() : renderEmptyState()}
    </div>
  );
}

export default Notes;