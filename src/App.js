import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { CalculatorProvider } from './contexts/CalculatorContext';
import { WorkbookProvider } from './contexts/WorkbookContext';
import Auth from './components/Auth';
import Header from './components/Header';
import LoadingScreen from './components/LoadingScreen';
import MainContent from './components/MainContent';
import StickyNotes from './components/StickyNotes';
import Instructions from './components/Instructions';
import WorkbookManager from './components/WorkbookManager';
import './styles.css';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showStickyNotes, setShowStickyNotes] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showWorkbooks, setShowWorkbooks] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <WorkbookProvider>
      <CalculatorProvider>
        <div className="App">
          <Header 
            session={session} 
            showStickyNotes={showStickyNotes} 
            setShowStickyNotes={setShowStickyNotes}
            showInstructions={showInstructions}
            setShowInstructions={setShowInstructions}
            showNotes={showNotes}
            setShowNotes={setShowNotes}
            showWorkbooks={showWorkbooks}
            setShowWorkbooks={setShowWorkbooks}
          />
          <div className="app-content">
            {showWorkbooks && (
              <div className="sidebar-left">
                <WorkbookManager />
              </div>
            )}
            <div className="main-area">
              <MainContent showNotes={showNotes} />
            </div>
          </div>
          {showStickyNotes && <StickyNotes />}
          {showInstructions && <Instructions />}
        </div>
      </CalculatorProvider>
    </WorkbookProvider>
  );
}

export default App;