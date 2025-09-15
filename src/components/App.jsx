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
  const [showPresets, setShowPresets] = useState(false)
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

  useEffect(() => {
    shufflePresets()
  }, [shufflePresets])

  useEffect(() => {
    if (isTouch) {
      addEventListener('touchstart', () => {
        setShowModes(false)
        setShowModels(false)
        setShowPresets(false)
      })
    }
  }, [])

  useEffect(() => {
    if (!isIframe) {
      document.documentElement.style.colorScheme = isDark ? 'dark' : 'light'
    }
  }, [isDark])

  return (
    <div className={isIframe ? '' : isDark ? 'dark' : 'light'}>
      <header>
        <div>
          <h1>
            <p>
              Vibe<span>🌡️</span>
            </p>
            <p>Check</p>
          </h1>
        </div>

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

        <div
          className="selectorWrapper"
          onMouseEnter={!isTouch && (() => setShowModes(true))}
          onMouseLeave={!isTouch && (() => setShowModes(false))}
          onTouchStart={
            isTouch
              ? e => {
                  e.stopPropagation()
                  setShowModes(true)
                  setShowModels(false)
                  setShowPresets(false)
                }
              : null
          }
        >
          <p>
            {modes[outputMode].emoji} {modes[outputMode].name}
          </p>
          <div className={c('selector', {active: showModes})}>
            <ul>
              {Object.keys(modes)
                .filter(key => key !== 'image')
                .map(key => (
                  <li key={key}>
                    <button
                      className={c('chip', {primary: key === outputMode})}
                      onClick={() => {
                        setOutputMode(key)
                        setShowModes(false)

                        if (key === 'image') {
                          setBatchModel(
                            Object.keys(models).find(k => models[k].imageOutput)
                          )
                        } else if (outputMode === 'image') {
                          setBatchModel(Object.keys(models)[1])
                        }
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

        <div
          className="selectorWrapper"
          onMouseEnter={!isTouch && (() => setShowModels(true))}
          onMouseLeave={!isTouch && (() => setShowModels(false))}
          onTouchStart={
            isTouch
              ? e => {
                  e.stopPropagation()
                  setShowModels(true)
                  setShowModes(false)
                  setShowPresets(false)
                }
              : null
          }
        >
          <p>
            {batchMode
              ? models[batchModel].name
              : Object.keys(versusModels).filter(key => versusModels[key])
                  .length + ' selected'}
          </p>
          <div className={c('selector', {active: showModels})}>
            <ul>
              {Object.keys(models)
                .filter(key => !models[key].imageOutput)
                .map(key => (
                  <li key={key}>
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
              ref={imageInputRef}
              onChange={e => handleImageSet(e.target.files[0])}
            />
            <div className="dropZone">
              {inputImage && <img src={inputImage} />}
              Drop here
            </div>
            <div className="label">Input image</div>
          </div>
        )}

        <div
          className="selectorWrapper prompt"
          onMouseEnter={!isTouch && (() => setShowPresets(true))}
          onMouseLeave={!isTouch && (() => setShowPresets(false))}
          onTouchStart={
            isTouch
              ? e => {
                  e.stopPropagation()
                  setShowPresets(true)
                  setShowModes(false)
                  setShowModels(false)
                }
              : null
          }
        >
          <input
            className="promptInput"
            placeholder="Enter a prompt"
            onFocus={!isTouch && (() => setShowPresets(false))}
            ref={inputRef}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addRound(e.target.value, inputImage)
                e.target.blur()
              }
            }}
          />
          <div className={c('selector', {active: showPresets})}>
            <ul className="presets wrapped">
              <li>
                <button
                  onClick={() => {
                    addRound(
                      presets[Math.floor(Math.random() * presets.length)].prompt
                    )
                    setShowPresets(false)
                  }}
                  className="chip primary"
                >
                  <span className="icon">Ifl</span>
                  Random prompt
                </button>
              </li>

              {/* <li>
                <button onClick={shufflePresets} className="chip primary">
                  <span className="icon">shuffle</span>
                  Shuffle prompts
                </button>
              </li> */}

              {presets.map(({label, prompt}) => (
                <li key={label}>
                  <button
                    onClick={() => {
                      addRound(prompt)
                      setShowPresets(false)
                    }}
                    className="chip"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="label">Prompt</div>
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

        <div>
          <button
            className="circleButton resetButton"
            onClick={() => {
              reset()
              setInputImage(null)
              inputRef.current.value = ''
            }}
          >
            <span className="icon">replay</span>
          </button>
          <div className="label">Reset</div>
        </div>

        {!isIframe && (
          <div>
            <button className="circleButton resetButton" onClick={toggleTheme}>
              <span className="icon">
                {isDark ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
            <div className="label">Theme</div>
          </div>
        )}
      </header>

      <main>
        {feed.length ? (
          <ul className="feed">
            {feed.map(round => (
              <FeedItem
                key={round.id}
                round={round}
                onModifyPrompt={onModifyPrompt}
              />
            ))}
          </ul>
        ) : (
          <Intro />
        )}
      </main>
    </div>
  )
}
