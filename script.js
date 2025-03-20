document.addEventListener('DOMContentLoaded', function() {
    // Initialize tabs
    initTabs();
    
    // Initialize calculators
    initCalculator1(); // What is X% of Y
    initCalculator2(); // X is what percent of Y
    initCalculator3(); // Percentage Increase/Decrease
    initCalculator4(); // Percentage Change
    initCalculator5(); // Percentage to Fraction
    initCalculator6(); // Fraction to Percentage
    
    // Initialize history functionality
    initHistory();
});

// Tab functionality
function initTabs() {
    const tabs = document.querySelectorAll('.tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            tab.classList.add('active');
            
            // Hide all calculators
            const calculators = document.querySelectorAll('.calculator');
            calculators.forEach(calc => calc.classList.remove('active'));
            
            // Show the selected calculator
            const calculatorId = tab.getAttribute('data-tab');
            document.getElementById(calculatorId).classList.add('active');
        });
    });
}

// Helper functions
function validateInput(inputId) {
    const input = document.getElementById(inputId);
    const errorElement = document.getElementById(`${inputId}-error`);
    const value = input.value.trim();
    
    if (value === '' || isNaN(parseFloat(value))) {
        errorElement.style.display = 'block';
        return false;
    } else {
        errorElement.style.display = 'none';
        return true;
    }
}

function resetCalculator(calcNumber) {
    const calculator = document.getElementById(`calculator${calcNumber}`);
    const inputs = calculator.querySelectorAll('input');
    const resultContainer = document.getElementById(`result${calcNumber}`);
    
    inputs.forEach(input => {
        input.value = '';
    });
    
    // If using inline results, hide/reset them
    const inlineResult = calculator.querySelector('.inline-result');
    if (inlineResult) {
        inlineResult.style.display = 'none';
        inlineResult.querySelector('.result-value').textContent = '';
    }
    
    resultContainer.classList.remove('show');
    
    // Reset error messages
    const errorMessages = calculator.querySelectorAll('.error-message');
    errorMessages.forEach(error => {
        error.style.display = 'none';
    });
}

function showCopyTooltip(tooltipId) {
    const tooltip = document.getElementById(tooltipId);
    tooltip.classList.add('show');
    
    setTimeout(() => {
        tooltip.classList.remove('show');
    }, 1500);
}

function addToHistory(category, calculation, result) {
    // Get existing history or initialize empty array
    let history = JSON.parse(localStorage.getItem('calculationHistory')) || [];
    
    // Add new calculation to history
    history.unshift({
        category,
        calculation,
        result,
        timestamp: new Date().toISOString()
    });
    
    // Keep only last 20 calculations
    if (history.length > 20) {
        history = history.slice(0, 20);
    }
    
    // Save history to localStorage
    localStorage.setItem('calculationHistory', JSON.stringify(history));
    
    // Update history UI
    updateHistoryUI();
}

function updateHistoryUI() {
    const historyList = document.getElementById('history-list');
    const history = JSON.parse(localStorage.getItem('calculationHistory')) || [];
    
    if (history.length === 0) {
        historyList.innerHTML = '<div class="no-history">No calculations yet</div>';
        return;
    }
    
    let historyHTML = '';
    
    history.forEach(item => {
        historyHTML += `
            <div class="history-item">
                <div class="history-category">${item.category}</div>
                <div class="history-calculation">${item.calculation}</div>
                <div class="history-result">${item.result}</div>
            </div>
        `;
    });
    
    historyList.innerHTML = historyHTML;
}

// Add inline result element to each calculator
function addInlineResultElements() {
    // For all 6 calculators
    for (let i = 1; i <= 6; i++) {
        const calculator = document.getElementById(`calculator${i}`);
        const sentenceInput = calculator.querySelector('.sentence-input');
        
        // Create inline result element if it doesn't exist
        if (!sentenceInput.querySelector('.inline-result')) {
            const inlineResult = document.createElement('span');
            inlineResult.className = 'inline-result';
            inlineResult.innerHTML = '<span class="equals-sign"> = </span><span class="result-value"></span>';
            inlineResult.style.display = 'none';
            
            // Insert before buttons
            const buttons = sentenceInput.querySelectorAll('button');
            if (buttons.length > 0) {
                sentenceInput.insertBefore(inlineResult, buttons[0]);
            } else {
                sentenceInput.appendChild(inlineResult);
            }
        }
    }
}

// Helper function to show inline result
function showInlineResult(calculatorNumber, result) {
    const calculator = document.getElementById(`calculator${calculatorNumber}`);
    const inlineResult = calculator.querySelector('.inline-result');
    const resultValue = inlineResult.querySelector('.result-value');
    
    resultValue.textContent = result;
    inlineResult.style.display = 'inline-flex';
}

// Calculator 1: What is X% of Y?
function initCalculator1() {
    const calculateBtn = document.getElementById('calculate1');
    const resetBtn = document.getElementById('reset1');
    const copyBtn = document.getElementById('copy1');
    
    calculateBtn.addEventListener('click', () => {
        const percentValid = validateInput('percent1');
        const valueValid = validateInput('value1');
        
        if (percentValid && valueValid) {
            const percent = parseFloat(document.getElementById('percent1').value);
            const value = parseFloat(document.getElementById('value1').value);
            
            const result = (percent / 100) * value;
            const formattedResult = result.toFixed(2).replace(/\.00$/, '');
            
            // Show inline result
            showInlineResult(1, formattedResult);
            
            // Also update the detailed result section
            document.getElementById('steps1').innerHTML = `${percent}% of ${value} = ${percent} × ${value} ÷ 100 = ${formattedResult}`;
            document.getElementById('result1-value').textContent = formattedResult;
            document.getElementById('result1').classList.add('show');
            
            // Add to history
            addToHistory(
                'What is X% of Y?',
                `${percent}% of ${value}`,
                formattedResult
            );
        }
    });
    
    resetBtn.addEventListener('click', () => resetCalculator(1));
    
    copyBtn.addEventListener('click', () => {
        const resultText = document.getElementById('result1-value').textContent;
        navigator.clipboard.writeText(resultText);
        showCopyTooltip('tooltip1');
    });
}

// Calculator 2: X is what percent of Y?
function initCalculator2() {
    const calculateBtn = document.getElementById('calculate2');
    const resetBtn = document.getElementById('reset2');
    const copyBtn = document.getElementById('copy2');
    
    calculateBtn.addEventListener('click', () => {
        const value2aValid = validateInput('value2a');
        const value2bValid = validateInput('value2b');
        
        if (value2aValid && value2bValid) {
            const value2a = parseFloat(document.getElementById('value2a').value);
            const value2b = parseFloat(document.getElementById('value2b').value);
            
            if (value2b === 0) {
                document.getElementById('value2b-error').textContent = "Cannot divide by zero";
                document.getElementById('value2b-error').style.display = 'block';
                return;
            }
            
            const result = (value2a / value2b) * 100;
            const formattedResult = result.toFixed(2).replace(/\.00$/, '') + '%';
            
            // Show inline result
            showInlineResult(2, formattedResult);
            
            // Also update the detailed result section
            document.getElementById('steps2').innerHTML = `${value2a} is what percent of ${value2b}? ${value2a} ÷ ${value2b} × 100 = ${formattedResult}`;
            document.getElementById('result2-value').textContent = formattedResult;
            document.getElementById('result2').classList.add('show');
            
            // Add to history
            addToHistory(
                'X is what percent of Y?',
                `${value2a} is what percent of ${value2b}?`,
                formattedResult
            );
        }
    });
    
    resetBtn.addEventListener('click', () => resetCalculator(2));
    
    copyBtn.addEventListener('click', () => {
        const resultText = document.getElementById('result2-value').textContent;
        navigator.clipboard.writeText(resultText);
        showCopyTooltip('tooltip2');
    });
}

// Calculator 3: Percentage Increase/Decrease
function initCalculator3() {
    const calculateBtn = document.getElementById('calculate3');
    const resetBtn = document.getElementById('reset3');
    const copyBtn = document.getElementById('copy3');
    
    calculateBtn.addEventListener('click', () => {
        const initialValid = validateInput('initial');
        const finalValid = validateInput('final');
        
        if (initialValid && finalValid) {
            const initialValue = parseFloat(document.getElementById('initial').value);
            const finalValue = parseFloat(document.getElementById('final').value);
            
            if (initialValue === 0) {
                document.getElementById('initial-error').textContent = "Initial value cannot be zero for percentage change";
                document.getElementById('initial-error').style.display = 'block';
                return;
            }
            
            const change = finalValue - initialValue;
            const percentChange = (change / Math.abs(initialValue)) * 100;
            const formattedResult = percentChange.toFixed(2).replace(/\.00$/, '') + '%';
            const changeType = percentChange >= 0 ? 'increase' : 'decrease';
            
            // Show inline result
            showInlineResult(3, formattedResult);
            
            // Also update the detailed result section
            document.getElementById('steps3').innerHTML = `Change from ${initialValue} to ${finalValue}:<br>
                Change amount: ${finalValue} - ${initialValue} = ${change}<br>
                Percentage ${changeType}: (${change} ÷ ${Math.abs(initialValue)}) × 100 = ${formattedResult}`;
            document.getElementById('result3-value').textContent = formattedResult;
            document.getElementById('result3').classList.add('show');
            
            // Add to history
            addToHistory(
                'Percentage Increase/Decrease',
                `Change from ${initialValue} to ${finalValue}`,
                formattedResult
            );
        }
    });
    
    resetBtn.addEventListener('click', () => resetCalculator(3));
    
    copyBtn.addEventListener('click', () => {
        const resultText = document.getElementById('result3-value').textContent;
        navigator.clipboard.writeText(resultText);
        showCopyTooltip('tooltip3');
    });
}

// Calculator 4: Percentage Change
function initCalculator4() {
    const calculateBtn = document.getElementById('calculate4');
    const resetBtn = document.getElementById('reset4');
    const copyBtn = document.getElementById('copy4');
    
    calculateBtn.addEventListener('click', () => {
        const originalValid = validateInput('original');
        const percentChangeValid = validateInput('percent-change');
        
        if (originalValid && percentChangeValid) {
            const originalValue = parseFloat(document.getElementById('original').value);
            const percentChange = parseFloat(document.getElementById('percent-change').value);
            
            const newValue = originalValue * (1 + percentChange / 100);
            const formattedResult = newValue.toFixed(2).replace(/\.00$/, '');
            const changeType = percentChange >= 0 ? 'increase' : 'decrease';
            
            // Show inline result
            showInlineResult(4, formattedResult);
            
            // Also update the detailed result section
            document.getElementById('steps4').innerHTML = `${originalValue} ${changeType}d by ${Math.abs(percentChange)}%:<br>
                ${originalValue} × (1 + ${percentChange}/100) = ${originalValue} × ${(1 + percentChange/100).toFixed(4)} = ${formattedResult}`;
            document.getElementById('result4-value').textContent = formattedResult;
            document.getElementById('result4').classList.add('show');
            
            // Add to history
            addToHistory(
                'Percentage Change',
                `${originalValue} changed by ${percentChange}%`,
                formattedResult
            );
        }
    });
    
    resetBtn.addEventListener('click', () => resetCalculator(4));
    
    copyBtn.addEventListener('click', () => {
        const resultText = document.getElementById('result4-value').textContent;
        navigator.clipboard.writeText(resultText);
        showCopyTooltip('tooltip4');
    });
}

// Calculator 5: Percentage to Fraction
function initCalculator5() {
    const calculateBtn = document.getElementById('calculate5');
    const resetBtn = document.getElementById('reset5');
    const copyBtn = document.getElementById('copy5');
    
    calculateBtn.addEventListener('click', () => {
        const percentInputValid = validateInput('percent-input');
        
        if (percentInputValid) {
            const percentValue = parseFloat(document.getElementById('percent-input').value);
            
            // Convert percentage to decimal
            const decimal = percentValue / 100;
            
            // Convert to fraction (simplified)
            const fraction = decimalToFraction(decimal);
            const formattedResult = `${fraction.numerator}/${fraction.denominator}`;
            
            // Show inline result
            showInlineResult(5, formattedResult);
            
            // Also update the detailed result section
            document.getElementById('steps5').innerHTML = `${percentValue}% = ${percentValue}/100 = ${decimal}<br>
                Simplified as a fraction: ${formattedResult}`;
            document.getElementById('result5-value').textContent = formattedResult;
            document.getElementById('result5').classList.add('show');
            
            // Add to history
            addToHistory(
                'Percentage to Fraction',
                `${percentValue}% to fraction`,
                formattedResult
            );
        }
    });
    
    resetBtn.addEventListener('click', () => resetCalculator(5));
    
    copyBtn.addEventListener('click', () => {
        const resultText = document.getElementById('result5-value').textContent;
        navigator.clipboard.writeText(resultText);
        showCopyTooltip('tooltip5');
    });
}

// Calculator 6: Fraction to Percentage
function initCalculator6() {
    const calculateBtn = document.getElementById('calculate6');
    const resetBtn = document.getElementById('reset6');
    const copyBtn = document.getElementById('copy6');
    
    calculateBtn.addEventListener('click', () => {
        const numeratorValid = validateInput('numerator');
        const denominatorValid = validateInput('denominator');
        
        if (numeratorValid && denominatorValid) {
            const numerator = parseFloat(document.getElementById('numerator').value);
            const denominator = parseFloat(document.getElementById('denominator').value);
            
            if (denominator === 0) {
                document.getElementById('denominator-error').textContent = "Cannot divide by zero";
                document.getElementById('denominator-error').style.display = 'block';
                return;
            }
            
            const percentage = (numerator / denominator) * 100;
            const formattedResult = percentage.toFixed(2).replace(/\.00$/, '') + '%';
            
            // Show inline result
            showInlineResult(6, formattedResult);
            
            // Also update the detailed result section
            document.getElementById('steps6').innerHTML = `${numerator}/${denominator} = ${numerator} ÷ ${denominator} × 100 = ${formattedResult}`;
            document.getElementById('result6-value').textContent = formattedResult;
            document.getElementById('result6').classList.add('show');
            
            // Add to history
            addToHistory(
                'Fraction to Percentage',
                `${numerator}/${denominator} to percentage`,
                formattedResult
            );
        }
    });
    
    resetBtn.addEventListener('click', () => resetCalculator(6));
    
    copyBtn.addEventListener('click', () => {
        const resultText = document.getElementById('result6-value').textContent;
        navigator.clipboard.writeText(resultText);
        showCopyTooltip('tooltip6');
    });
}

// History functionality
function initHistory() {
    const clearHistoryBtn = document.getElementById('clear-history');
    
    clearHistoryBtn.addEventListener('click', () => {
        localStorage.removeItem('calculationHistory');
        updateHistoryUI();
    });
    
    // Initialize history display
    updateHistoryUI();
}

// Helper function: Convert decimal to simplified fraction
function decimalToFraction(decimal) {
    if (decimal === 0) return { numerator: 0, denominator: 1 };
    
    // Handle negative numbers
    const sign = decimal < 0 ? -1 : 1;
    decimal = Math.abs(decimal);
    
    // Handle whole numbers
    if (Number.isInteger(decimal)) {
        return { numerator: sign * decimal, denominator: 1 };
    }
    
    // Convert to fraction with tolerance
    const tolerance = 1.0E-6;
    
    // Simple continued fraction algorithm
    let h1 = 1, h2 = 0, k1 = 0, k2 = 1;
    let b = decimal;
    
    do {
        const a = Math.floor(b);
        let aux = h1;
        h1 = a * h1 + h2;
        h2 = aux;
        aux = k1;
        k1 = a * k1 + k2;
        k2 = aux;
        b = 1 / (b - a);
    } while (Math.abs(decimal - h1 / k1) > decimal * tolerance);
    
    return { 
        numerator: sign * h1, 
        denominator: k1 
    };
}

// GCD function for fraction simplification
function gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    
    if (b > a) {
        [a, b] = [b, a];
    }
    
    while (b) {
        [a, b] = [b, a % b];
    }
    
    return a;
}

// Initialize inline result elements when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    addInlineResultElements();
});
