import React, { useReducer, useEffect } from 'react'
import { useCalculator } from '../contexts/CalculatorContext'
import '../styles/calculator.css'

export const ACTIONS = {
  ADD_DIGIT: 'add-digit',
  CHOOSE_OPERATION: 'choose-operation',
  CLEAR: 'clear',
  DELETE_DIGIT: 'delete-digit',
  EVALUATE: 'evaluate'
}

function reducer(state, { type, payload }) {
  switch (type) {
    case ACTIONS.ADD_DIGIT:
      if (state.overwrite) {
        return {
          ...state,
          currentOperand: payload.digit,
          overwrite: false,
        }
      }
      if (payload.digit === "0" && state.currentOperand === "0") {
        return state
      }
      if (payload.digit === "." && state.currentOperand.includes(".")) {
        return state
      }

      return {
        ...state,
        currentOperand: `${state.currentOperand || ""}${payload.digit}`,
      }
    case ACTIONS.CHOOSE_OPERATION:
      if (state.currentOperand == null && state.previousOperand == null) {
        return state
      }

      if (state.currentOperand == null) {
        return {
          ...state,
          operation: payload.operation,
        }
      }

      if (state.previousOperand == null) {
        return {
          ...state,
          operation: payload.operation,
          previousOperand: state.currentOperand,
          currentOperand: null,
        }
      }

      return {
        ...state,
        previousOperand: evaluate(state),
        operation: payload.operation,
        currentOperand: null,
      }
    case ACTIONS.CLEAR:
      return {}
    case ACTIONS.DELETE_DIGIT:
      if (state.overwrite) {
        return {
          ...state,
          overwrite: false,
          currentOperand: null,
        }
      }
      if (state.currentOperand == null) return state
      if (state.currentOperand.length === 1) {
        return { ...state, currentOperand: null }
      }

      return {
        ...state,
        currentOperand: state.currentOperand.slice(0, -1),
      }
    case ACTIONS.EVALUATE:
      if (
        state.operation == null ||
        state.currentOperand == null ||
        state.previousOperand == null
      ) {
        return state
      }

      return {
        ...state,
        overwrite: true,
        previousOperand: null,
        operation: null,
        currentOperand: evaluate(state),
      }
  }
}

function evaluate({ currentOperand, previousOperand, operation }) {
  const prev = parseFloat(previousOperand)
  const current = parseFloat(currentOperand)
  if (isNaN(prev) || isNaN(current)) return ""
  let computation = ""
  switch (operation) {
    case "+":
      computation = prev + current
      break
    case "-":
      computation = prev - current
      break
    case "*":
      computation = prev * current
      break
    case "/":
      computation = prev / current
      break
  }

  return computation.toString()
}

const INTEGER_FORMATTER = new Intl.NumberFormat("en-us", {
  maximumFractionDigits: 0,
})
function formatOperand(operand) {
  if (operand == null) return
  const [integer, decimal] = operand.split(".")
  if (decimal == null) return INTEGER_FORMATTER.format(integer)
  return `${INTEGER_FORMATTER.format(integer)}.${decimal}`
}

function Calculator() {
  const { updateCalculatorState } = useCalculator();
  const [{ currentOperand, previousOperand, operation }, dispatch] = useReducer(
    reducer,
    {}
  )

  // Update context whenever calculator state changes
  useEffect(() => {
    updateCalculatorState({
      currentOperand,
      previousOperand,
      operation
    });
  }, [currentOperand, previousOperand, operation, updateCalculatorState]);

  // Keyboard input handler
  useEffect(() => {
    const handleKeyPress = (event) => {
      // Check if user is typing in an input field, textarea, or contenteditable element
      const activeElement = document.activeElement;
      const isTypingInInput = activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.contentEditable === 'true' ||
        activeElement.isContentEditable
      );
      
      // If user is typing in an input field, don't handle calculator keys
      if (isTypingInInput) {
        return;
      }
      
      const key = event.key;
      
      // Prevent default behavior for calculator keys
      if (/[0-9+\-*/=.]/.test(key) || key === 'Enter' || key === 'Backspace' || key === 'Escape') {
        event.preventDefault();
      }

      // Numbers and decimal point
      if (/[0-9.]/.test(key)) {
        dispatch({ type: ACTIONS.ADD_DIGIT, payload: { digit: key } });
      }
      
      // Operations
      if (key === '+') {
        dispatch({ type: ACTIONS.CHOOSE_OPERATION, payload: { operation: '+' } });
      }
      if (key === '-') {
        dispatch({ type: ACTIONS.CHOOSE_OPERATION, payload: { operation: '-' } });
      }
      if (key === '*') {
        dispatch({ type: ACTIONS.CHOOSE_OPERATION, payload: { operation: '*' } });
      }
      if (key === '/') {
        dispatch({ type: ACTIONS.CHOOSE_OPERATION, payload: { operation: '/' } });
      }
      
      // Equals/Enter
      if (key === '=' || key === 'Enter') {
        dispatch({ type: ACTIONS.EVALUATE });
      }
      
      // Clear (Escape)
      if (key === 'Escape') {
        dispatch({ type: ACTIONS.CLEAR });
      }
      
      // Delete (Backspace)
      if (key === 'Backspace') {
        dispatch({ type: ACTIONS.DELETE_DIGIT });
      }
    };

    // Add event listener
    document.addEventListener('keydown', handleKeyPress);
    
    // Cleanup event listener
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, []);

  return (
    <div className="calculator-grid">
      <div className="output">
        <div className="previous-operand">
          {formatOperand(previousOperand)} {operation}
        </div>
        <div className="current-operand">{formatOperand(currentOperand)}</div>
      </div>
      <button
        className="span-two"
        onClick={() => dispatch({ type: ACTIONS.CLEAR })}
      >
        AC
      </button>
      <button onClick={() => dispatch({ type: ACTIONS.DELETE_DIGIT })}>
        DEL
      </button>
      <button
        onClick={() =>
          dispatch({ type: ACTIONS.CHOOSE_OPERATION, payload: { operation: "/" } })
        }
      >
        ÷
      </button>
      <button
        onClick={() =>
          dispatch({ type: ACTIONS.ADD_DIGIT, payload: { digit: "1" } })
        }
      >
        1
      </button>
      <button
        onClick={() =>
          dispatch({ type: ACTIONS.ADD_DIGIT, payload: { digit: "2" } })
        }
      >
        2
      </button>
      <button
        onClick={() =>
          dispatch({ type: ACTIONS.ADD_DIGIT, payload: { digit: "3" } })
        }
      >
        3
      </button>
      <button
        onClick={() =>
          dispatch({ type: ACTIONS.CHOOSE_OPERATION, payload: { operation: "*" } })
        }
      >
        ×
      </button>
      <button
        onClick={() =>
          dispatch({ type: ACTIONS.ADD_DIGIT, payload: { digit: "4" } })
        }
      >
        4
      </button>
      <button
        onClick={() =>
          dispatch({ type: ACTIONS.ADD_DIGIT, payload: { digit: "5" } })
        }
      >
        5
      </button>
      <button
        onClick={() =>
          dispatch({ type: ACTIONS.ADD_DIGIT, payload: { digit: "6" } })
        }
      >
        6
      </button>
      <button
        onClick={() =>
          dispatch({ type: ACTIONS.CHOOSE_OPERATION, payload: { operation: "+" } })
        }
      >
        +
      </button>
      <button
        onClick={() =>
          dispatch({ type: ACTIONS.ADD_DIGIT, payload: { digit: "7" } })
        }
      >
        7
      </button>
      <button
        onClick={() =>
          dispatch({ type: ACTIONS.ADD_DIGIT, payload: { digit: "8" } })
        }
      >
        8
      </button>
      <button
        onClick={() =>
          dispatch({ type: ACTIONS.ADD_DIGIT, payload: { digit: "9" } })
        }
      >
        9
      </button>
      <button
        onClick={() =>
          dispatch({ type: ACTIONS.CHOOSE_OPERATION, payload: { operation: "-" } })
        }
      >
        -
      </button>
      <button
        onClick={() =>
          dispatch({ type: ACTIONS.ADD_DIGIT, payload: { digit: "." } })
        }
      >
        .
      </button>
      <button
        onClick={() =>
          dispatch({ type: ACTIONS.ADD_DIGIT, payload: { digit: "0" } })
        }
      >
        0
      </button>
      <button
        className="span-two"
        onClick={() => dispatch({ type: ACTIONS.EVALUATE })}
      >
        =
      </button>
    </div>
  )
}

export default Calculator
