/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import {GoogleGenAI, Modality} from '@google/genai'
import {limitFunction} from 'p-limit'

const timeoutMs = 193_333
const maxRetries = 5
const baseDelay = 1_233
const ai = new GoogleGenAI({apiKey: process.env.API_KEY})

export default limitFunction(
  async ({
    model,
    systemInstruction,
    prompt,
    promptImage,
    imageOutput,
    thinking,
    thinkingCapable
  }) => {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), timeoutMs)
        )

        const modelPromise = ai.models.generateContent({
          model,
          config: {
            systemInstruction,
            safetySettings,
            ...(thinkingCapable && !thinking
              ? {thinkingConfig: {thinkingBudget: 0}}
              : {}),
            ...(imageOutput
              ? {responseModalities: [Modality.TEXT, Modality.IMAGE]}
              : {})
          },

          contents: [
            {
              parts: [
                ...(promptImage
                  ? [
                      {
                        inlineData: {
                          data: promptImage.split(',')[1],
                          mimeType: promptImage.substring(5, promptImage.indexOf(';'))
                        }
                      }
                    ]
                  : []),
                {text: prompt}
              ]
            }
          ]
        })

        return Promise.race([modelPromise, timeoutPromise]).then(res => {
            if (imageOutput) {
              const imagePart = res.candidates?.[0]?.content?.parts?.find(
                part => part.inlineData
              )
              if (!imagePart) {
                throw new Error('No image data in response')
              }
              const {mimeType, data} = imagePart.inlineData
              return `data:${mimeType};base64,${data}`
            }
            return res.text
          }
        )
      } catch (error) {
        if (error.name === 'AbortError') {
          return
        }

        if (attempt === maxRetries - 1) {
          throw error
        }

        const delay = baseDelay * 2 ** attempt
        await new Promise(res => setTimeout(res, delay))
        console.warn(
          `Attempt ${attempt + 1} failed, retrying after ${delay}ms...`
        )
      }
    }
  },
  {concurrency: 9}
)

const safetySettings = [
  'HARM_CATEGORY_HATE_SPEECH',
  'HARM_CATEGORY_SEXUALLY_EXPLICIT',
  'HARM_CATEGORY_DANGEROUS_CONTENT',
  'HARM_CATEGORY_HARASSMENT'
].map(category => ({category, threshold: 'BLOCK_NONE'}))