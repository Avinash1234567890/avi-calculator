import React from 'react';
import '../styles/instructions.css';

function Instructions() {
  return (
    <div className="instructions-panel">
      <div className="instructions-header">
        <h3>Instructions</h3>
      </div>
      
      <div className="instructions-content">
        <div className="instruction-section">
          <h4>Workbooks & Organization</h4>
          <ul className="instruction-list">
            <li><strong>Workbooks:</strong> Click "Workbooks" in the header to open the sidebar</li>
            <li><strong>Create Workbooks:</strong> Organize your work by subject or project</li>
            <li><strong>Problems:</strong> Within each workbook, create specific problems</li>
            <li><strong>Context-Aware:</strong> All notes and calculations save to the selected problem</li>
            <li><strong>Navigation:</strong> Use breadcrumbs or back buttons to switch between workbooks</li>
          </ul>
        </div>

        <div className="instruction-section">
          <h4>Calculator</h4>
          <div className="instruction-grid">
            <div className="instruction-item">
              <span className="key">0-9</span>
              <span className="description">Input numbers</span>
            </div>
            <div className="instruction-item">
              <span className="key">+ - × ÷</span>
              <span className="description">Mathematical operations</span>
            </div>
            <div className="instruction-item">
              <span className="key">Enter or =</span>
              <span className="description">Calculate result</span>
            </div>
            <div className="instruction-item">
              <span className="key">Escape</span>
              <span className="description">Clear all (AC)</span>
            </div>
            <div className="instruction-item">
              <span className="key">Backspace</span>
              <span className="description">Delete last digit</span>
            </div>
            <div className="instruction-item">
              <span className="key">Tab</span>
              <span className="description">Save calculator result as note</span>
            </div>
            <div className="instruction-item">
              <span className="key">.</span>
              <span className="description">Decimal point</span>
            </div>
          </div>
        </div>

        <div className="instruction-section">
          <h4>Calculator Notes</h4>
          <ul className="instruction-list">
            <li><strong>Quick Save:</strong> Press Tab to instantly save calculator result as a note</li>
            <li><strong>Manual Entry:</strong> Type mathematical expressions to save calculations</li>
            <li><strong>Auto-Save:</strong> Notes are automatically saved to your current problem</li>
            <li><strong>View Modes:</strong> Switch between History and Compact views</li>
            <li><strong>Management:</strong> Delete individual notes or clear all at once</li>
            <li><strong>Context:</strong> Notes are organized by workbook and problem</li>
          </ul>
        </div>

        <div className="instruction-section">
          <h4>Sticky Notes</h4>
          <ul className="instruction-list">
            <li><strong>Collapsible Cards:</strong> Click + to expand, - to collapse note content</li>
            <li><strong>Easy Editing:</strong> Click on titles or content to edit directly</li>
            <li><strong>Color Coded:</strong> Each note gets a random color automatically</li>
            <li><strong>Context-Aware:</strong> Sticky notes are saved to your current problem</li>
            <li><strong>Persistent:</strong> Notes are saved to your account and persist between sessions</li>
            <li><strong>Quick Delete:</strong> Use the × button to remove notes</li>
          </ul>
        </div>

        <div className="instruction-section">
          <h4>Header Controls</h4>
          <ul className="instruction-list">
            <li><strong>Workbooks:</strong> Toggle the sidebar to manage your workbooks and problems</li>
            <li><strong>Instructions:</strong> Show/hide this help panel</li>
            <li><strong>Calculator Notes:</strong> Toggle the calculator notes panel</li>
            <li><strong>Sticky Notes:</strong> Show/hide sticky notes overlay</li>
            <li><strong>Account:</strong> View your email and sign out</li>
          </ul>
        </div>

        <div className="instruction-section">
          <h4>Data & Security</h4>
          <ul className="instruction-list">
            <li><strong>Cloud Storage:</strong> All data is securely stored in Supabase</li>
            <li><strong>User Authentication:</strong> Your data is private and secure</li>
            <li><strong>Cross-Device Sync:</strong> Access your work from any device</li>
            <li><strong>Organized Storage:</strong> Data is structured by workbooks and problems</li>
          </ul>
        </div>

        <div className="instruction-footer">
          <p className="tip">
            <strong>Pro Tips:</strong> Use Tab to quickly save calculator results, and organize your work with workbooks for better productivity!
          </p>
        </div>
      </div>
    </div>
  );
}

export default Instructions;
