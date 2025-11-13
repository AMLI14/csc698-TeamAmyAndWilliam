import React, { useState } from 'react'
import PromptAIStyles from '../stylesheets/PromptAIStyles.module.css'

// Prompt component for user input at the bottom of the page.
// It keeps its own simple internal state and, by default, shows an alert
// with the entered text when the button is clicked.
function PromptAI({ onGenerate }) {
  const [val, setVal] = useState('Generating Weekly Schedule!')
  const click = () => {
    if (typeof onGenerate === 'function') onGenerate(val)
    else alert(val)
  }
  return (
    <div className="AI-prompt">
      {/* controlled input so typing updates the component state */}
      <input className={PromptAIStyles.inputField} value={val} onChange={(e) => setVal(e.target.value)} />
      <button className={PromptAIStyles.button} onClick={click}> Generate Schedule </button>
    </div>
  )
}

export default PromptAI