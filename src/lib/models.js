/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
export default {
  lite: {
    name: 'Flash-Lite',
    version: '2.5',
    modelString: 'gemini-2.5-flash',
    shortName: 'Lite',
    thinkingCapable: true,
    thinking: false
  },
  flash: {
    name: 'Flash (thinking off)',
    version: '2.5',
    modelString: 'gemini-2.5-flash',
    shortName: 'Flash',
    thinkingCapable: true,
    thinking: false
  },
  flashThinking: {
    name: 'Flash',
    version: '2.5',
    modelString: 'gemini-2.5-flash',
    shortName: 'Flash',
    thinkingCapable: true,
    thinking: true
  },
  pro: {
    name: 'Pro',
    version: '2.5',
    modelString: 'gemini-2.5-flash',
    shortName: 'Pro',
    thinkingCapable: true,
    thinking: true
  },
  flashImage: {
    name: 'Flash Image',
    version: '2.5',
    modelString: 'gemini-2.5-flash-image-preview',
    shortName: 'Flash Image',
    thinkingCapable: false,
    thinking: false,
    imageOutput: true
  }
}