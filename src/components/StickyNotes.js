import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useWorkbook } from '../contexts/WorkbookContext';
import '../styles/stickynotes.css';

function StickyNotes() {
  // State management
  const [stickyNotes, setStickyNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get workbook context
  const { currentWorkbook, currentProblem } = useWorkbook();

  // Load sticky notes from Supabase on component mount and when workbook/problem changes
  useEffect(() => {
    loadStickyNotes();
  }, [currentWorkbook, currentProblem]);

  const loadStickyNotes = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      let query = supabase
        .from('sticky_notes')
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

      if (error && error.code !== 'PGRST116' && error.code !== '42P01') throw error; // Ignore table not found errors

      if (data) {
        setStickyNotes(data.map(note => ({
          id: note.id,
          title: note.title,
          content: note.content,
          color: note.color || '#FFE066',
          created_at: note.created_at,
          isExpanded: false,
          isEditingTitle: false,
          isEditingContent: false
        })));
      }
    } catch (error) {
      if (error.code === '42P01') {
        // Table doesn't exist yet, we'll create it when first note is saved
        console.log('Sticky notes table will be created when first note is saved');
      } else {
        setError('Failed to load sticky notes');
        console.error('Error loading sticky notes:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const createStickyNote = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const newNote = {
        title: '',
        content: '',
        color: getRandomColor(),
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
        .from('sticky_notes')
        .insert([newNote])
        .select()
        .single();

      if (error) throw error;

      setStickyNotes(prev => [{
        id: data.id,
        title: data.title,
        content: data.content,
        color: data.color,
        created_at: data.created_at,
        isExpanded: true,
        isEditingTitle: false,
        isEditingContent: false
      }, ...prev]);
    } catch (error) {
      setError('Failed to create sticky note: ' + error.message);
      console.error('Error creating sticky note:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStickyNote = async (noteId, updates) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { error } = await supabase
        .from('sticky_notes')
        .update(updates)
        .eq('id', noteId)
        .eq('user_id', user.id);

      if (error) throw error;

      setStickyNotes(prev => prev.map(note => 
        note.id === noteId ? { ...note, ...updates } : note
      ));
    } catch (error) {
      setError('Failed to update sticky note');
      console.error('Error updating sticky note:', error);
    }
  };

  const deleteStickyNote = async (noteId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { error } = await supabase
        .from('sticky_notes')
        .delete()
        .eq('id', noteId)
        .eq('user_id', user.id);

      if (error) throw error;

      setStickyNotes(prev => prev.filter(note => note.id !== noteId));
    } catch (error) {
      setError('Failed to delete sticky note');
      console.error('Error deleting sticky note:', error);
    }
  };

  const toggleNoteExpansion = (noteId) => {
    setStickyNotes(prev => prev.map(note => 
      note.id === noteId 
        ? { 
            ...note, 
            isExpanded: !note.isExpanded,
            isEditingTitle: false,
            isEditingContent: false
          } 
        : note
    ));
  };

  const startEditingTitle = (noteId) => {
    setStickyNotes(prev => prev.map(note => 
      note.id === noteId 
        ? { ...note, isEditingTitle: true, isEditingContent: false } 
        : note
    ));
  };

  const startEditingContent = (noteId) => {
    setStickyNotes(prev => prev.map(note => 
      note.id === noteId 
        ? { ...note, isEditingContent: true, isEditingTitle: false } 
        : note
    ));
  };

  const saveNoteTitle = (noteId, newTitle) => {
    updateStickyNote(noteId, { title: newTitle });
    setStickyNotes(prev => prev.map(note => 
      note.id === noteId 
        ? { ...note, title: newTitle, isEditingTitle: false } 
        : note
    ));
  };

  const saveNoteContent = (noteId, newContent) => {
    updateStickyNote(noteId, { content: newContent });
    setStickyNotes(prev => prev.map(note => 
      note.id === noteId 
        ? { ...note, content: newContent, isEditingContent: false } 
        : note
    ));
  };

  const getRandomColor = () => {
    const colors = [
      '#FFE066', '#FF6B6B', '#4ECDC4', '#45B7D1', 
      '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8',
      '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8C471'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const NoteCard = ({ note }) => {
    const [tempTitle, setTempTitle] = useState(note.title);
    const [tempContent, setTempContent] = useState(note.content);

    const handleTitleKeyPress = (e) => {
      if (e.key === 'Enter') {
        saveNoteTitle(note.id, tempTitle);
      }
    };

    const handleContentKeyPress = (e) => {
      if (e.key === 'Enter' && e.ctrlKey) {
        saveNoteContent(note.id, tempContent);
      }
    };

    return (
      <div 
        className={`note-card ${note.isExpanded ? 'expanded' : 'collapsed'}`}
        style={{ backgroundColor: note.color }}
      >
        {/* Note Header */}
        <div 
          className="note-header"
          onClick={() => {
            if (!note.isExpanded) {
              toggleNoteExpansion(note.id);
            } else if (!note.isEditingTitle) {
              startEditingTitle(note.id);
            }
          }}
        >
          {note.isEditingTitle ? (
            <input
              type="text"
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              onKeyPress={handleTitleKeyPress}
              onBlur={() => saveNoteTitle(note.id, tempTitle)}
              className="note-title-input"
              placeholder="Enter note title..."
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <h4 className={`note-title ${!note.title ? 'placeholder' : ''}`}>
              {note.title || 'New Note'}
            </h4>
          )}
          
          <div className="note-actions">
            <button
              className="expand-btn"
              onClick={(e) => {
                e.stopPropagation();
                toggleNoteExpansion(note.id);
              }}
              title={note.isExpanded ? "Collapse" : "Expand"}
            >
              {note.isExpanded ? '−' : '+'}
            </button>
            <button
              className="note-delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                deleteStickyNote(note.id);
              }}
              title="Delete note"
            >
              ×
            </button>
          </div>
        </div>

        {/* Note Body (only shown when expanded) */}
        {note.isExpanded && (
          <div 
            className="note-body"
            onClick={() => {
              if (!note.isEditingContent) {
                startEditingContent(note.id);
              }
            }}
          >
            {note.isEditingContent ? (
              <textarea
                value={tempContent}
                onChange={(e) => setTempContent(e.target.value)}
                onKeyDown={handleContentKeyPress}
                onBlur={() => saveNoteContent(note.id, tempContent)}
                className="note-content-textarea"
                rows={4}
                placeholder="Type your note here... (Ctrl+Enter to save)"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <p className={`note-content ${!note.content ? 'placeholder' : ''}`}>
                {note.content || 'Click to edit content...'}
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="sticky-notes-panel">
      <div className="panel-header">
        <h3>Sticky Notes</h3>
      </div>
      
      <div className="panel-content">
        <button 
          className="add-note-btn" 
          onClick={createStickyNote}
          disabled={loading}
        >
          + Add Note
        </button>
        
        {error && (
          <div className="error-message">{error}</div>
        )}
        
        <div className="notes-count">
          {stickyNotes.length} {stickyNotes.length === 1 ? 'note' : 'notes'}
        </div>

        <div className="notes-grid">
          {stickyNotes.map(note => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
        
        <div className="panel-footer">
          <p className="help-text">
            Click notes to expand/collapse<br/>
            Click header to edit title (Enter to save)<br/>
            Click body to edit content (Ctrl+Enter to save)
          </p>
        </div>
      </div>
    </div>
  );
}

export default StickyNotes;
