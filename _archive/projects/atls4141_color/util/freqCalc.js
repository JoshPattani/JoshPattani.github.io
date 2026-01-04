// freqCalc.js

export function midiToFreq(midiCode) {
  return 440 * Math.pow(Math.pow(2, 1 / 12), midiCode - 69);
}

export function getFrequency(midiCode, temperament) {
  // tuning logic
}
