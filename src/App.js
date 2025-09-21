import React from 'react'
import Notes from './components/Notes'
import Calculator from './components/Calculator'

function App() {
  return (
    <div className="app-container">
      <Calculator />
      <Notes />
    </div>
  )
}

export default App