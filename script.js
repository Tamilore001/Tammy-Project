const result = document.getElementById("result");
const buttons = document.querySelectorAll(".btn");
const historyPanel = document.getElementById("history-panel");
const historyIcon = document.getElementById("history-icon");

// Identify the sin, cos, tan, log, ln buttons by their initial text content
const sinButton = Array.from(buttons).find(btn => btn.textContent === "sin");
const cosButton = Array.from(buttons).find(btn => btn.textContent === "cos");
const tanButton = Array.from(buttons).find(btn => btn.textContent === "tan");
const logButton = Array.from(buttons).find(btn => btn.textContent === "log");
const lnButton = Array.from(buttons).find(btn => btn.textContent === "ln");

let expression = "";
let history = [];
let isInverseMode = false;
let isDegreeMode = true; // Default to degree mode

function updateDisplay() {
  result.value = expression || "0";
}

function factorial(n) {
  if (n < 0) return NaN;
  if (n === 0 || n === 1) return 1;
  let f = 1;
  for (let i = 2; i <= n; i++) {
    f *= i;
  }
  return f;
}

function degToRad(deg) {
  return deg * Math.PI / 180;
}

function radToDeg(rad) {
  return rad * 180 / Math.PI;
}

// Toggle history panel
historyIcon.addEventListener("click", function () {
  if (historyPanel.style.display === "none") {
    updateHistory();
    historyPanel.style.display = "block";
  } else {
    historyPanel.style.display = "none";
  }
});

function updateHistory() {
  historyPanel.innerHTML = "";
  history.slice().reverse().forEach(function (item) {
    const p = document.createElement("p");
    p.textContent = item;
    historyPanel.appendChild(p);
  });
}

function updateTrigButtonLabels() {
  if (isInverseMode) {
    sinButton.textContent = "arcsin";
    cosButton.textContent = "arccos";
    tanButton.textContent = "arctan";
    logButton.textContent = "10^x";
    lnButton.textContent = "e^x";
  } else {
    sinButton.textContent = "sin";
    cosButton.textContent = "cos";
    tanButton.textContent = "tan";
    logButton.textContent = "log";
    lnButton.textContent = "ln";
  }
}

function setMode(mode) {
  isDegreeMode = (mode === 'Deg');
  document.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.classList.remove('active');
    if (btn.textContent === mode) {
      btn.classList.add('active');
    }
  });
  console.log(`Mode set to: ${mode}, isDegreeMode: ${isDegreeMode}`);
}

buttons.forEach(function (button) {
  button.addEventListener("click", function () {
    const value = button.textContent;

    if (expression === "Error" || expression.startsWith("arcsin/arccos") || expression.startsWith("log/ln")) {
      expression = "";
    }

    if (value === "AC") {
      expression = "";
      isInverseMode = false;
      isDegreeMode = true;
      setMode('Deg'); // Reset to Deg mode
      updateTrigButtonLabels();
    } else if (value === "=") {
      try {
        let evalExpr = expression
          .replace(/×/g, '*')
          .replace(/÷/g, '/')
          .replace(/−/g, '-')
          .replace(/π/g, 'Math.PI')
          .replace(/\be\b/g, 'Math.E')
          .replace(/√\(/g, 'Math.sqrt(')
          .replace(/x²/g, '**2')
          .replace(/%/g, '/100');

        // Check for log and ln input range (must be > 0)
        if (!isInverseMode) {
          const logMatch = evalExpr.match(/log\(([^)]+)\)/);
          const lnMatch = evalExpr.match(/ln\(([^)]+)\)/);

          if (logMatch) {
            const arg = parseFloat(logMatch[1]);
            if (isNaN(arg) || arg <= 0) {
              expression = "log/ln input must be > 0";
              updateDisplay();
              return;
            }
          }
          if (lnMatch) {
            const arg = parseFloat(lnMatch[1]);
            if (isNaN(arg) || arg <= 0) {
              expression = "log/ln input must be > 0";
              updateDisplay();
              return;
            }
          }
        }

        // Check for arcsin and arccos input range
        if (isInverseMode) {
          const arcsinMatch = evalExpr.match(/arcsin\(([^)]+)\)/);
          const arccosMatch = evalExpr.match(/arccos\(([^)]+)\)/);

          if (arcsinMatch) {
            const arg = parseFloat(arcsinMatch[1]);
            if (isNaN(arg) || arg < -1 || arg > 1) {
              expression = "arcsin/arccos input must be [-1, 1]";
              updateDisplay();
              return;
            }
          }
          if (arccosMatch) {
            const arg = parseFloat(arccosMatch[1]);
            if (isNaN(arg) || arg < -1 || arg > 1) {
              expression = "arcsin/arccos input must be [-1, 1]";
              updateDisplay();
              return;
            }
          }

          evalExpr = evalExpr
            .replace(/arcsin\(/g, 'radToDeg(Math.asin(')
            .replace(/arccos\(/g, 'radToDeg(Math.acos(')
            .replace(/arctan\(/g, 'radToDeg(Math.atan(')
            .replace(/10\^x\(/g, 'Math.pow(10,')
            .replace(/e\^x\(/g, 'Math.exp(');
        } else {
          if (isDegreeMode) {
            evalExpr = evalExpr
              .replace(/sin\(([^)]+)\)/g, 'Math.sin(degToRad($1))')
              .replace(/cos\(([^)]+)\)/g, 'Math.cos(degToRad($1))')
              .replace(/tan\(([^)]+)\)/g, 'Math.tan(degToRad($1))');
          } else {
            evalExpr = evalExpr
              .replace(/sin\(([^)]+)\)/g, 'Math.sin($1)')
              .replace(/cos\(([^)]+)\)/g, 'Math.cos($1)')
              .replace(/tan\(([^)]+)\)/g, 'Math.tan($1)');
          }
          evalExpr = evalExpr
            .replace(/log\(/g, 'Math.log10(')
            .replace(/ln\(/g, 'Math.log(');
        }

        evalExpr = evalExpr
          .replace(/(\d+)\^/g, 'Math.pow($1,');

        // Factorials
        evalExpr = evalExpr.replace(/(\d+)!/g, function (match, n) {
          return factorial(parseInt(n));
        });

        console.log(`Evaluating: ${evalExpr}`);
        const resultValue = Function("degToRad", "radToDeg", "return " + evalExpr)(degToRad, radToDeg);

        history.push(expression + " = " + resultValue);
        expression = resultValue.toString();
        isInverseMode = false;
        updateTrigButtonLabels();
      } catch (e) {
        console.error(`Error evaluating expression: ${e}`);
        expression = "Error";
      }
    } else if (value === "Inv") {
      isInverseMode = !isInverseMode;
      updateTrigButtonLabels();
    } else if (["Rad", "Deg"].includes(value)) {
      setMode(value);
    } else if (value === "%") {
      expression += "%";
    } else if (value === "x!") {
      expression += "!";
    } else if (value === "√") {
      expression += "√()";
      expression = expression.slice(0, -1); // move cursor inside ()
    } else if (value === "x²") {
      expression += "x²";
    } else if (["sin", "cos", "tan", "arcsin", "arccos", "arctan", "log", "ln", "10^x", "e^x"].includes(value)) {
      expression += value + "()";
      expression = expression.slice(0, -1); // move cursor inside ()
    } else if (value === "EXP") {
      expression += "e";
    } else if (value === "Ans") {
      expression += result.value;
    } else {
      expression += value;
    }

    updateDisplay();
  });
});