import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useWorkbook } from '../contexts/WorkbookContext';
import '../styles/workbook-manager.css';

function WorkbookManager() {
  const { 
    currentWorkbook, 
    currentProblem, 
    workbooks, 
    problems,
    setWorkbooks,
    setProblems,
    selectWorkbook,
    selectProblem 
  } = useWorkbook();

  const [loading, setLoading] = useState(false);
  const [showNewWorkbook, setShowNewWorkbook] = useState(false);
  const [showNewProblem, setShowNewProblem] = useState(false);
  const [newWorkbookName, setNewWorkbookName] = useState('');
  const [newProblemName, setNewProblemName] = useState('');

  useEffect(() => {
    loadWorkbooks();
  }, []);

  useEffect(() => {
    if (currentWorkbook) {
      loadProblems();
    }
  }, [currentWorkbook]);

  const loadWorkbooks = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('workbooks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWorkbooks(data || []);
    } catch (error) {
      console.error('Error loading workbooks:', error);
    }
  };

  const loadProblems = async () => {
    if (!currentWorkbook) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('problems')
        .select('*')
        .eq('user_id', user.id)
        .eq('workbook_id', currentWorkbook.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProblems(data || []);
    } catch (error) {
      console.error('Error loading problems:', error);
    }
  };

  const createWorkbook = async () => {
    if (!newWorkbookName.trim()) return;

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('workbooks')
        .insert([{
          name: newWorkbookName.trim(),
          user_id: user.id,
          color: getRandomColor()
        }])
        .select()
        .single();

      if (error) throw error;

      setWorkbooks(prev => [data, ...prev]);
      setNewWorkbookName('');
      setShowNewWorkbook(false);
      selectWorkbook(data);
    } catch (error) {
      console.error('Error creating workbook:', error);
    } finally {
      setLoading(false);
    }
  };

  const createProblem = async () => {
    if (!newProblemName.trim() || !currentWorkbook) return;

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('problems')
        .insert([{
          name: newProblemName.trim(),
          workbook_id: currentWorkbook.id,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      setProblems(prev => [data, ...prev]);
      setNewProblemName('');
      setShowNewProblem(false);
      selectProblem(data);
    } catch (error) {
      console.error('Error creating problem:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRandomColor = () => {
    const colors = [
      '#667eea', '#764ba2', '#f093fb', '#f5576c', 
      '#4facfe', '#00f2fe', '#43e97b', '#38f9d7',
      '#ffecd2', '#fcb69f', '#a8edea', '#fed6e3'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <div className="workbook-manager">
      {/* Navigation Breadcrumb */}
      <div className="workbook-breadcrumb">
        <span className="breadcrumb-item">Workbooks</span>
        {currentWorkbook && (
          <>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-item active">{currentWorkbook.name}</span>
          </>
        )}
        {currentProblem && (
          <>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-item active">{currentProblem.name}</span>
          </>
        )}
      </div>

      {/* Workbook Level */}
      {!currentWorkbook && (
        <div className="workbook-level">
          <div className="level-header">
            <h3>Your Workbooks</h3>
            <button 
              className="add-btn"
              onClick={() => setShowNewWorkbook(true)}
            >
              + New Workbook
            </button>
          </div>

          {showNewWorkbook && (
            <div className="new-item-form">
              <input
                type="text"
                value={newWorkbookName}
                onChange={(e) => setNewWorkbookName(e.target.value)}
                placeholder="Enter workbook name..."
                onKeyPress={(e) => e.key === 'Enter' && createWorkbook()}
                autoFocus
              />
              <div className="form-actions">
                <button onClick={createWorkbook} disabled={loading}>
                  Create
                </button>
                <button onClick={() => setShowNewWorkbook(false)}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="items-grid">
            {workbooks.map(workbook => (
              <div 
                key={workbook.id} 
                className="workbook-card"
                style={{ background: `linear-gradient(135deg, ${workbook.color}, ${workbook.color}aa)` }}
                onClick={() => selectWorkbook(workbook)}
              >
                <h4>{workbook.name}</h4>
                <p>{new Date(workbook.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Problem Level */}
      {currentWorkbook && !currentProblem && (
        <div className="problem-level">
          <div className="level-header">
            <div className="header-left">
              <button 
                className="back-btn"
                onClick={() => selectWorkbook(null)}
              >
                ← Back to Workbooks
              </button>
              <h3>Problems in {currentWorkbook.name}</h3>
            </div>
            <button 
              className="add-btn"
              onClick={() => setShowNewProblem(true)}
            >
              + New Problem
            </button>
          </div>

          {showNewProblem && (
            <div className="new-item-form">
              <input
                type="text"
                value={newProblemName}
                onChange={(e) => setNewProblemName(e.target.value)}
                placeholder="Enter problem name..."
                onKeyPress={(e) => e.key === 'Enter' && createProblem()}
                autoFocus
              />
              <div className="form-actions">
                <button onClick={createProblem} disabled={loading}>
                  Create
                </button>
                <button onClick={() => setShowNewProblem(false)}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="items-grid">
            {problems.map(problem => (
              <div 
                key={problem.id} 
                className="problem-card"
                onClick={() => selectProblem(problem)}
              >
                <h4>{problem.name}</h4>
                <p>{new Date(problem.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Working Level */}
      {currentWorkbook && currentProblem && (
        <div className="working-level">
          <div className="level-header">
            <button 
              className="back-btn"
              onClick={() => selectProblem(null)}
            >
              ← Back to Problems
            </button>
            <h3>Working on: {currentProblem.name}</h3>
          </div>
          <p className="working-hint">
            Calculator and notes below are saved to this problem. 
            Use the header buttons to access sticky notes and instructions.
          </p>
        </div>
      )}
    </div>
  );
}

export default WorkbookManager;
