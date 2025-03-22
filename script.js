document.addEventListener('DOMContentLoaded', () => {
    // Cache DOM elements
    const calculatorTabs = document.querySelector('.calculator-tabs');
    const calculatorSections = document.querySelectorAll('.calculator-section');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const calculateButtons = document.querySelectorAll('.calculate-btn');
    const copyButtons = document.querySelectorAll('.copy-btn');
    const inputFields = document.querySelectorAll('input[type="number"]');

    // Calculator functions
    const calculators = {
        'what-is-x-of-y': (percentage, value) => (percentage / 100) * value,
        'x-is-what-percent-of-y': (value, total) => (value / total) * 100,
        'percentage-increase': (oldValue, newValue) => ((newValue - oldValue) / oldValue) * 100,
        'percentage-change': (value, percentage) => value + (value * percentage / 100),
        'percentage-to-fraction': (percentage) => {
            const fraction = percentage / 100;
            return simplifyFraction(fraction);
        },
        'fraction-to-percentage': (numerator, denominator) => (numerator / denominator) * 100
    };

    // Helper function to simplify fractions
    function simplifyFraction(decimal) {
        const tolerance = 1.0E-6;
        let h1 = 1;
        let h2 = 0;
        let k1 = 0;
        let k2 = 1;
        let b = decimal;
        
        do {
            let a = Math.floor(b);
            let aux = h1;
            h1 = a * h1 + h2;
            h2 = aux;
            aux = k1;
            k1 = a * k1 + k2;
            k2 = aux;
            b = 1 / (b - a);
        } while (Math.abs(decimal - h1 / k1) > decimal * tolerance);
        
        return `${h1}/${k1}`;
    }

    // Tab switching functionality
    function switchTab(tabId) {
        // Update ARIA attributes and active class on tab buttons
        tabButtons.forEach(btn => {
            const isActive = btn.dataset.calculator === tabId;
            btn.setAttribute('aria-selected', isActive);
            btn.setAttribute('aria-expanded', isActive);
            btn.classList.toggle('active', isActive);
        });

        // Show/hide calculator sections
        calculatorSections.forEach(section => {
            section.classList.toggle('active', section.id === tabId);
        });

        // Update focus management
        const activeSection = document.getElementById(tabId);
        const firstInput = activeSection.querySelector('input');
        if (firstInput) {
            firstInput.focus();
        }
    }

    // Calculate results
    function calculateResult(calculatorId, inputs) {
        const result = calculators[calculatorId](...inputs);
        return typeof result === 'number' ? result.toFixed(2) : result;
    }

    // Copy result to clipboard
    async function copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            showToast('Result copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy text: ', err);
            showToast('Failed to copy result');
        }
    }

    // Show toast notification
    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        // Trigger reflow
        toast.offsetHeight;

        // Add show class
        toast.classList.add('show');

        // Remove toast after animation
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Event Listeners
    calculatorTabs.addEventListener('click', (e) => {
        const tabButton = e.target.closest('.tab-btn');
        if (tabButton) {
            const calculatorId = tabButton.dataset.calculator;
            switchTab(calculatorId);
        }
    });

    calculateButtons.forEach(button => {
        button.addEventListener('click', () => {
            const section = button.closest('.calculator-section');
            const calculatorId = section.id;
            const inputs = Array.from(section.querySelectorAll('input'))
                .map(input => parseFloat(input.value) || 0);
            
            const result = calculateResult(calculatorId, inputs);
            const resultSpan = section.querySelector('.result span');
            if (resultSpan) {
                resultSpan.textContent = result;
            }
        });
    });

    copyButtons.forEach(button => {
        button.addEventListener('click', () => {
            const result = button.closest('.result').querySelector('span').textContent;
            copyToClipboard(result);
        });
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            document.body.classList.add('user-is-tabbing');
        }
    });

    document.addEventListener('mousedown', () => {
        document.body.classList.remove('user-is-tabbing');
    });

    // Add Enter key functionality to input fields
    inputFields.forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const section = input.closest('.calculator-section');
                const calculateButton = section.querySelector('.calculate-btn');
                calculateButton.click();
            }
        });
    });

    // Initialize first tab
    switchTab('what-is-x-of-y');

    // Add CSS for toast notifications
    const style = document.createElement('style');
    style.textContent = `
        .toast {
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%) translateY(100px);
            background: #2d3748;
            color: white;
            padding: 12px 24px;
            border-radius: 4px;
            opacity: 0;
            transition: all 0.3s ease;
        }
        
        .toast.show {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
        }
        
        .user-is-tabbing *:focus {
            outline: 2px solid #4299e1;
            outline-offset: 2px;
        }
    `;
    document.head.appendChild(style);
}); 