/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {useEffect, useState, memo} from 'react'
import SyntaxHighlighter from 'react-syntax-highlighter'
import * as styles from 'react-syntax-highlighter/dist/esm/styles/hljs'
import c from 'clsx'
import modes from '../lib/modes'
import models from '../lib/models'
import Renderer from './Renderer'

function ModelOutput({
  model,
  outputData,
  outputMode,
  isBusy,
  startTime,
  totalTime,
  gotError
}) {
  const [time, setTime] = useState(0)
  const [showSource, setShowSource] = useState(false)
  const [copied, setCopied] = useState(false)

  const copySource = () => {
    if (outputMode === 'image') {
      const byteString = atob(outputData.split(',')[1])
      const mimeString = outputData.split(',')[0].split(':')[1].split(';')[0]
      const ab = new ArrayBuffer(byteString.length)
      const ia = new Uint8Array(ab)

      byteString.split('').forEach((char, i) => (ia[i] = char.charCodeAt(0)))

      const item = new ClipboardItem({
        [mimeString]: new Blob([ab], {type: mimeString})
      })
      navigator.clipboard.write([item]).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 1000)
      })
    } else {
      navigator.clipboard.writeText(outputData.trim())
      setCopied(true)
      setTimeout(() => setCopied(false), 1000)
    }
  }

  useEffect(() => {
    let interval

    if (isBusy) {
      interval = setInterval(() => setTime(Date.now() - startTime), 10)
    } else {
      clearInterval(interval)
    }

    return () => clearInterval(interval)
  }, [startTime, isBusy])

  return (
    <article className="modelOutput" role="article" aria-label={`Output from ${models[model].name}`}>
      <div className={c('outputRendering', {flipped: showSource})}>
        {outputMode !== 'image' && (
          <div className="back" role="tabpanel" aria-label="Source code">
            <SyntaxHighlighter
              language={modes[outputMode].syntax}
              style={styles.atomOneDark}
              showLineNumbers={true}
              wrapLines={true}
            >
              {outputData}
            </SyntaxHighlighter>
          </div>
        )}

        <div className="front" role="tabpanel" aria-label="Rendered output">
          {gotError && (
            <div className="error" role="alert" aria-live="polite">
              <p>
                <span className="icon">error</span>
                Response error
              </p>
              <p>Please try again or check your prompt.</p>
            </div>
          )}

          {isBusy && (
            <div className="loader" role="status" aria-label="Loading output">
              <span className="icon">hourglass</span>
              <span className="sr-only">Generating output...</span>
            </div>
          )}

          {outputData && (
            <Renderer 
              mode={outputMode} 
              code={outputData} 
              aria-label={`${outputMode} output`}
            />
          )}
        </div>
      </div>

      <footer className="modelInfo">
        <div className="modelName">
          <div role="heading" aria-level="4">
            {models[model].version} {models[model].name}
          </div>
          {(time || totalTime) && (
            <div className="timer" aria-label={`Generation time: ${((isBusy ? time : totalTime) / 1000).toFixed(2)} seconds`}>
              {((isBusy ? time : totalTime) / 1000).toFixed(2)}s
            </div>
          )}
        </div>

        <div className={c('outputActions', {active: outputData})} role="toolbar" aria-label="Output actions">
          {outputMode !== 'image' && (
            <button
              className="iconButton"
              onClick={() => setShowSource(!showSource)}
              aria-label={`View ${showSource ? 'rendering' : 'source code'}`}
              aria-pressed={showSource}
            >
              <span className="icon">{showSource ? 'visibility' : 'code'}</span>
              <span className="tooltip">
                View {showSource ? 'rendering' : 'source'}
              </span>
            </button>
          )}

          <button 
            className="iconButton" 
            onClick={copySource}
            aria-label={`Copy ${outputMode === 'image' ? 'image' : 'source code'}`}
          >
            <span className="icon">content_copy</span>
            <span className="tooltip">
              {copied
                ? 'Copied!'
                : outputMode === 'image'
                  ? 'Copy image'
                  : 'Copy source'}
            </span>
          </button>
        </div>
      </footer>
    </article>
  )
}

export default memo(ModelOutput)
