import React, { useCallback, useEffect, useMemo, useState } from 'react'
import './stylesheets/App.css'
import Calendar from './components/Calendar.jsx'



function App() {
 

  
  // Render the app: form at the top, then a table with TIMES rows and DAYS columns.
  return (
    <div className="App">
      <Calendar />
    </div>
  )
}

export default App
