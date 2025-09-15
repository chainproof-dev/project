/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {useEffect, useState, useCallback, useRef} from 'react'
import shuffle from 'lodash.shuffle'
import c from 'clsx'
import modes from '../lib/modes'
import models from '../lib/models'
import useStore from '../lib/store'
import {
  addRound,
  setOutputMode,
  setBatchMode,
  setBatchModel,
  setBatchSize,
  setVersusModel,
  reset
} from '../lib/actions'
import {isTouch, isIframe} from '../lib/consts'
import FeedItem from './FeedItem'
import Intro from './Intro'

export default function App() {
  const feed = useStore.use.feed()
  const outputMode = useStore.use.outputMode()
  const batchModel = useStore.use.batchModel()
  const versusModels = useStore.use.versusModels()
  const batchMode = useStore.use.batchMode()
  const batchSize = useStore.use.batchSize()

  const [presets, setPresets] = useState([])
  const [showModes, setShowModes] = useState(false)
  const [showModels, setShowModels] = useState(false)
  const [inputImage, setInputImage] = useState(null)
  const [isDark, setIsDark] = useState(true)

  const inputRef = useRef(null)
  const imageInputRef = useRef(null)

  const handleImageSet = async file => {
    if (file) {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
      setInputImage(base64)
    }
  }

  const shufflePresets = useCallback(
    () => setPresets(shuffle(modes[outputMode].presets)),
    [outputMode]
  )

  const onModifyPrompt = useCallback(prompt => {
    inputRef.current.value = prompt
    inputRef.current.focus()
  }, [])

  const toggleTheme = useCallback(() => {
    setIsDark(!isDark)
  }, [isDark])
  
  const handleGenerate = () => {
    if (inputRef.current.value) {
      addRound(inputRef.current.value, inputImage)
      inputRef.current.blur()
    }
  }

  useEffect(() => {
    shufflePresets()
  }, [shufflePresets])

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        !event.target.closest('.selectorWrapper')
      ) {
        setShowModes(false)
        setShowModels(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isIframe) {
      document.documentElement.style.colorScheme = isDark ? 'dark' : 'light'
    }
  }, [isDark])

  return (
    <div className={isIframe ? '' : isDark ? 'dark' : 'light'}>
      <header>
        <div className="header-main">
           <h1>
              <span className="icon">🌡️</span> VibeCheck
            </h1>
          <div className="header-actions">
             <button
                className="iconButton"
                onClick={() => {
                  reset()
                  setInputImage(null)
                  inputRef.current.value = ''
                }}
                aria-label="Reset session"
              >
                <span className="icon">replay</span>
                <span className="tooltip">Reset</span>
              </button>

            {!isIframe && (
               <button className="iconButton" onClick={toggleTheme} aria-label="Toggle theme">
                  <span className="icon">
                    {isDark ? 'light_mode' : 'dark_mode'}
                  </span>
                  <span className="tooltip">Theme</span>
                </button>
            )}
          </div>
        </div>
        <div className="header-controls">
           <div>
            <div className="toggle">
              <button
                className={c('button', {primary: batchMode})}
                onClick={() => setBatchMode(true)}
              >
                <span className="icon">stacks</span> Batch
              </button>
              <button
                className={c('button', {primary: !batchMode})}
                onClick={() => setBatchMode(false)}
              >
                <span className="icon">swords</span> Versus
              </button>
            </div>
            <div className="label">Mode</div>
          </div>

          <div className="selectorWrapper">
            <button
              aria-haspopup="listbox"
              aria-expanded={showModes}
              onClick={() => {
                setShowModes(s => !s);
                setShowModels(false);
              }}
            >
              {modes[outputMode].emoji} {modes[outputMode].name}
            </button>
            <div className={c('selector', {active: showModes})} role="listbox">
              <ul>
                {Object.keys(modes)
                  .map(key => (
                    <li key={key} role="option" aria-selected={key === outputMode}>
                      <button
                        className={c('chip', {primary: key === outputMode})}
                        onClick={() => {
                          setOutputMode(key)
                          setShowModes(false)
                        }}
                      >
                        {modes[key].emoji} {modes[key].name}
                      </button>
                    </li>
                  ))}
              </ul>
            </div>
            <div className="label">Output</div>
          </div>

          <div className="selectorWrapper">
             <button
              aria-haspopup="listbox"
              aria-expanded={showModels}
              onClick={() => {
                setShowModels(s => !s);
                setShowModes(false);
              }}
            >
              {batchMode
                ? models[batchModel].name
                : Object.keys(versusModels).filter(key => versusModels[key])
                    .length + ' selected'}
            </button>
            <div className={c('selector', {active: showModels})} role="listbox">
              <ul>
                {Object.keys(models)
                  .filter(key => outputMode === 'image' ? models[key].imageOutput : !models[key].imageOutput)
                  .map(key => (
                    <li key={key} role="option" aria-selected={batchMode ? key === batchModel : versusModels[key]}>
                      <button
                        className={c('chip', {
                          primary: batchMode
                            ? key === batchModel
                            : versusModels[key]
                        })}
                        onClick={() => {
                          if (batchMode) {
                            setBatchModel(key)
                            setShowModels(false)
                          } else {
                            setVersusModel(key, !versusModels[key])
                          }
                        }}
                      >
                        {models[key].name}
                      </button>
                    </li>
                  ))}
              </ul>
            </div>
            <div className="label">Model{batchMode ? '' : 's'}</div>
          </div>

          {batchMode && (
            <div>
              <div className="rangeWrap">
                <div className="batchSize">
                  <input
                    type="range"
                    min={1}
                    max={9}
                    value={batchSize}
                    onChange={e => setBatchSize(e.target.valueAsNumber)}
                  />{' '}
                  {batchSize}
                </div>
              </div>
              <div className="label">Batch size</div>
            </div>
          )}
        </div>
      </header>

      <main>
        {feed.length ? (
          <ul className="feed" aria-live="polite">
            {feed.map(round => (
              <FeedItem
                key={round.id}
                round={round}
                onModifyPrompt={onModifyPrompt}
              />
            ))}
          </ul>
        ) : (
          <Intro onSelectPreset={(prompt, outputMode) => {
            setOutputMode(outputMode);
            addRound(prompt, null);
          }}/>
        )}
      </main>

      <footer className="prompt-footer">
        {outputMode === 'image' && (
          <div
            className="imageInput"
            onClick={() => imageInputRef.current.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => {
              e.preventDefault()
              handleImageSet(e.dataTransfer.files[0])
            }}
          >
            <input
              type="file"
              accept="image/*"
              ref={imageInputRef}
              onChange={e => handleImageSet(e.target.files[0])}
            />
            <div className="dropZone">
              {inputImage ? <img src={inputImage} alt="Prompt input"/> : <span className="icon">add_photo_alternate</span>}
              <span className="tooltip right">{inputImage ? 'Change' : 'Add'} image</span>
            </div>
          </div>
        )}
        <div className="prompt-input-wrapper">
          <input
            className="promptInput"
            placeholder="Enter a prompt to generate..."
            ref={inputRef}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleGenerate();
              }
            }}
          />
        </div>
        <button className="button generate-button" onClick={handleGenerate}>
          <span className="icon">auto_awesome</span>
          Generate
        </button>
      </footer>
    </div>
  )
}