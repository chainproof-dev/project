/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {useState} from 'react'
import c from 'clsx'
import {addRound, removeRound} from '../lib/actions'
import modes from '../lib/modes'
import ModelOutput from './ModelOutput'

export default function FeedItem({round, onModifyPrompt}) {
  const [showSystemInstruction, setShowSystemInstruction] = useState(false)

  return (
    <li key={round.id} role="listitem">
      <div className={c('header', {anchorTop: showSystemInstruction})}>
        <h3 className={c({anchorTop: showSystemInstruction})}>
          <div className="chip">
            {modes[round.outputMode].emoji} {modes[round.outputMode].name}
          </div>
          <div className="prompt">
            {showSystemInstruction && (
              <div className="systemInstruction" role="note" aria-label="System instruction">
                {round.systemInstruction}
              </div>
            )}
            <div className="prompt-text">{round.prompt}</div>
          </div>
        </h3>
        <div className="actions">
          <button
            className="iconButton"
            onClick={() => setShowSystemInstruction(!showSystemInstruction)}
            aria-label={`${showSystemInstruction ? 'Hide' : 'Show'} system instruction`}
            aria-expanded={showSystemInstruction}
          >
            <span className="icon">assignment</span>
            <span className="tooltip">
              {showSystemInstruction ? 'Hide' : 'Show'} system instruction
            </span>
          </button>

          <button 
            className="iconButton" 
            onClick={() => removeRound(round.id)}
            aria-label="Remove this round"
          >
            <span className="icon">delete</span>
            <span className="tooltip">Remove</span>
          </button>

          <button
            className="iconButton"
            onClick={() => onModifyPrompt(round.prompt)}
            aria-label="Edit this prompt"
          >
            <span className="icon">edit</span>
            <span className="tooltip">Modify prompt</span>
          </button>

          <button className="iconButton" onClick={() => addRound(round.prompt)}>
            <span className="icon">refresh</span>
            aria-label="Re-run this prompt"
            <span className="tooltip">Re-run prompt</span>
          </button>
        </div>
      </div>

      <ul className="outputs">
        {round.outputs.map(output => (
          <li key={output.id} role="listitem">
            <ModelOutput {...output} />
          </li>
        ))}
      </ul>
    </li>
  )
}