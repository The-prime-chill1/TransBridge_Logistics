import { useRef, useState, useEffect } from 'react'
import styles from './OTPInput.module.css'

export default function OTPInput({ length = 4, value = '', onChange, error }) {
  const [digits, setDigits] = useState(Array(length).fill(''))
  const inputRefs = useRef([])

  useEffect(() => {
    if (value) {
      const arr = value.split('').slice(0, length)
      setDigits([...arr, ...Array(length - arr.length).fill('')])
    }
  }, [value, length])

  const handleChange = (index, val) => {
    if (!/^\d*$/.test(val)) return
    const newDigits = [...digits]
    newDigits[index] = val.slice(-1)
    setDigits(newDigits)
    onChange(newDigits.join(''))

    if (val && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    const newDigits = [...pasted, ...Array(length - pasted.length).fill('')]
    setDigits(newDigits)
    onChange(pasted)
    const lastIndex = Math.min(pasted.length, length - 1)
    inputRefs.current[lastIndex]?.focus()
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.inputs}>
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={el => inputRefs.current[i] = el}
            type='text'
            inputMode='numeric'
            maxLength={1}
            value={digit}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            onPaste={handlePaste}
            className={`${styles.digit} ${error ? styles.error : ''} ${digit ? styles.filled : ''}`}
            autoFocus={i === 0}
          />
        ))}
      </div>
      {error && <span className='form-error'>{error}</span>}
    </div>
  )
}
