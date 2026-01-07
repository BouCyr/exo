const QuestionType = {
    ADDITION: 'addition',
    MULTIPLICATION: 'multiplication',
    SUBTRACTION: 'subtraction',
    COMPARISON: 'comparison'
};

const MathAnswerExpected = {
    RESULT: 'result',
    FIRST_OPERAND: 'firstOperand',
    SECOND_OPERAND: 'secondOperand'
};

function generateQuestion() {
    // Keep only last 3 lines if we are about to add a 4th
    const lines = historyContainer.querySelectorAll('.line');
    if (lines.length >= 4) {
        lines[0].remove();
    }

    // Randomly choose question category based on weights
    const roll = Math.random();
    const mathFreq = CONFIG.FREQUENCIES.MATH_VS_COMPARISON;
    
    if (roll < mathFreq) {
        // Within math, choose between addition, multiplication and subtraction
        const mathRoll = Math.random();
        const [addWeight, multWeight, subWeight] = CONFIG.FREQUENCIES.ADDITION_VS_MULTIPLICATION_VS_SUBTRACTION;
        const totalWeight = addWeight + multWeight + subWeight;
        
        if (mathRoll < addWeight / totalWeight) {
            generateAdditionQuestion();
        } else if (mathRoll < (addWeight + multWeight) / totalWeight) {
            generateMultiplicationQuestion();
        } else {
            generateSubtractionQuestion();
        }
    } else {
        generateComparisonQuestion();
    }
}

function generateAdditionQuestion() {
    const a = Math.floor(Math.random() * CONFIG.ADDITION_LIMIT) + 1;
    const b = Math.floor(Math.random() * CONFIG.ADDITION_LIMIT) + 1;
    const result = a + b;
    const operator = '+';

    renderMathQuestion(a, b, result, operator);
}

function generateMultiplicationQuestion() {
    const a = Math.floor(Math.random() * CONFIG.MULTIPLICATION_LIMIT) + 1;
    const b = Math.floor(Math.random() * 10) + 1;
    const result = a * b;
    const operator = 'x';

    renderMathQuestion(a, b, result, operator);
}

function generateSubtractionQuestion() {
    let a, b;
    let attempts = 0;
    const maxAttempts = 100;

    do {
        // b must be between 1 and 10
        b = Math.floor(Math.random() * 10) + 1;
        // result must be > 0, so a > b. 
        // a should be up to SUBTRACTION_LIMIT, but at least b + 1
        const minA = b + 1;
        const rangeA = Math.max(0, CONFIG.SUBTRACTION_LIMIT - minA);
        a = Math.floor(Math.random() * (rangeA + 1)) + minA;
        attempts++;
    } while (hasBorrowing(a, b) && attempts < maxAttempts);
    
    const result = a - b;
    const operator = '-';

    renderMathQuestion(a, b, result, operator);
}

function hasBorrowing(a, b) {
    const aStr = a.toString();
    const bStr = b.toString();
    const lenA = aStr.length;
    const lenB = bStr.length;
    
    const maxLen = Math.max(lenA, lenB);
    const paddedA = aStr.padStart(maxLen, '0');
    const paddedB = bStr.padStart(maxLen, '0');
    
    for (let i = maxLen - 1; i >= 0; i--) {
        if (parseInt(paddedA[i]) < parseInt(paddedB[i])) {
            return true;
        }
    }
    return false;
}

function renderMathQuestion(a, b, result, operator) {
    const aStr = a.toString();
    const bStr = b.toString();
    const resStr = result.toString();

    // Weights from config
    const typePool = [];
    for (let i = 0; i < CONFIG.FREQUENCIES.MATH_TYPE_STANDARD; i++) typePool.push(MathAnswerExpected.RESULT);
    for (let i = 0; i < CONFIG.FREQUENCIES.MATH_TYPE_LEFT; i++) typePool.push(MathAnswerExpected.FIRST_OPERAND);
    for (let i = 0; i < CONFIG.FREQUENCIES.MATH_TYPE_RIGHT; i++) typePool.push(MathAnswerExpected.SECOND_OPERAND);
    
    const type = typePool[Math.floor(Math.random() * typePool.length)];

    const lineDiv = document.createElement('div');
    lineDiv.className = 'line';

    const part1 = document.createElement('div');
    part1.className = 'question';
    const part2 = document.createElement('div');
    part2.className = 'question';
    part2.textContent = operator;
    const part3 = document.createElement('div');
    part3.className = 'question';
    const part4 = document.createElement('div');
    part4.className = 'question';
    part4.textContent = '=';
    const part5 = document.createElement('div');
    part5.className = 'question';

    const wrapper = document.createElement('div');
    wrapper.className = 'input-wrapper';
    const input = document.createElement('input');
    input.type = 'number';
    input.inputMode = 'numeric';
    input.placeholder = '?';
    input.autofocus = true;
    wrapper.appendChild(input);

    if (type === MathAnswerExpected.RESULT) {
        part1.textContent = aStr;
        part3.textContent = bStr;
        part5.appendChild(wrapper);
        expectedValue = result;
    } else if (type === MathAnswerExpected.FIRST_OPERAND) {
        part1.appendChild(wrapper);
        part3.textContent = bStr;
        part5.textContent = resStr;
        expectedValue = a;
    } else {
        part1.textContent = aStr;
        part3.appendChild(wrapper);
        part5.textContent = resStr;
        expectedValue = b;
    }

    lineDiv.appendChild(part1);
    lineDiv.appendChild(part2);
    lineDiv.appendChild(part3);
    lineDiv.appendChild(part4);
    lineDiv.appendChild(part5);
    
    historyContainer.appendChild(lineDiv);

    input.focus();
    activeInput = input;

    input.addEventListener('input', () => {
        const val = parseInt(input.value);
        if (val === expectedValue) {
            onCorrectAnswer(input);
        }
    });
}

function generateComparisonQuestion() {
    let a, b;
    // 50/50: either numbers look alike or are close
    if (Math.random() < 0.5) {
        // Numbers look alike (permutation of digits or similar digits)
        a = Math.floor(Math.random() * CONFIG.COMPARISON_LIMIT);
        const digits = a.toString().split('');
        if (digits.length > 1) {
            // Swap two digits
            const i = Math.floor(Math.random() * digits.length);
            let j = Math.floor(Math.random() * digits.length);
            while (i === j) j = Math.floor(Math.random() * digits.length);
            [digits[i], digits[j]] = [digits[j], digits[i]];
        } else {
            // Single digit, just make b different
            b = (a + 1) % 10;
        }
        if (b === undefined) {
            b = parseInt(digits.join(''));
        }
    } else {
        // Numbers are close
        a = Math.floor(Math.random() * CONFIG.COMPARISON_LIMIT);
        const diff = Math.floor(Math.random() * 10) + 1;
        b = Math.random() < 0.5 ? a + diff : a - diff;
        if (b < 0) b = a + diff;
    }

    if (a === b) b = a + 1; // Ensure they are different for < and >

    const lineDiv = document.createElement('div');
    lineDiv.className = 'line comparison';

    const part1 = document.createElement('div');
    part1.className = 'question';
    part1.textContent = a;

    const part2 = document.createElement('div');
    part2.className = 'question';
    part2.textContent = '?';

    const part3 = document.createElement('div');
    part3.className = 'question';
    part3.textContent = b;

    const choicesContainer = document.createElement('div');
    choicesContainer.className = 'choices-container';

    const btnLess = document.createElement('button');
    btnLess.className = 'choice-button';
    btnLess.textContent = '<';

    const btnGreater = document.createElement('button');
    btnGreater.className = 'choice-button';
    btnGreater.textContent = '>';

    const correctAnswer = a < b ? '<' : '>';

    const handleChoice = (btn, choice) => {
        if (choice === correctAnswer) {
            // Remove the choices container entirely
            choicesContainer.remove();
            
            // Show correct sign in neon green
            part2.textContent = correctAnswer;
            part2.style.color = '#39ff14';
            part2.style.textShadow = '0 0 5px #39ff14';
            part2.style.fontWeight = 'bold';
            
            onCorrectAnswer(btn);
        }
    };

    btnLess.onclick = () => handleChoice(btnLess, '<');
    btnGreater.onclick = () => handleChoice(btnGreater, '>');

    choicesContainer.appendChild(btnLess);
    choicesContainer.appendChild(btnGreater);

    lineDiv.appendChild(part1);
    lineDiv.appendChild(part2);
    lineDiv.appendChild(part3);
    lineDiv.appendChild(choicesContainer);

    historyContainer.appendChild(lineDiv);
    btnLess.focus();
}
