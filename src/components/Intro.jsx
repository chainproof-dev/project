/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {useState} from 'react'
import shuffle from 'lodash.shuffle'
import modes from '../lib/modes'
import {
  addRound,
  setOutputMode,
  setBatchModel,
  setBatchMode
} from '../lib/actions'
import models from '../lib/models'
import useStore from '../lib/store'

export default function Intro() {
  const batchModel = useStore.use.batchModel()
  const [presets] = useState(
    Object.fromEntries(
      Object.entries(modes).map(([key, mode]) => [
        key,
        shuffle(mode.presets.slice(0, 50))
      ])
    )
  )

  return (
    <section className="intro" role="banner">
      <h2>👋 Welcome to VibeCheck 🌡️</h2>
      <p>
        A powerful playground for testing AI prompts with instant visual outputs. 
        Choose from different output modes and compare results across multiple models. 
        ✨ Try a preset below to get started:
      </p>

      {Object.entries(modes).map(([key, mode]) =>
        mode.imageOutput ? null : (
          <div key={key} className="preset-category">
            <h3 role="heading" aria-level="3">
              {mode.emoji} {mode.name}
            </h3>

            <div className="selector presetList">
              <ul className="presets wrapped" role="list" aria-label={`${mode.name} presets`}>
                {presets[key].map(({label, prompt}) => (
                  <li key={label} role="listitem">
                    <button
                      onClick={() => {
                        setOutputMode(key)

                        if (key === 'image') {
                          setBatchMode(true)
                          setBatchModel(
                            Object.keys(models).find(k => models[k].imageOutput)
                          )
                        } else if (models[batchModel].imageOutput) {
                          setBatchModel(Object.keys(models)[1])
                        }

                        addRound(prompt)
                      }}
                      className="chip"
                      aria-label={`Try ${label} prompt for ${mode.name}`}
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )
      )}
    </section>
  )
}
