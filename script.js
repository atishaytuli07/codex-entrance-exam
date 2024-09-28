
document.addEventListener("DOMContentLoaded", function () {
    const continueButton = document.querySelector(".continue-application");
    const infoBox = document.querySelector(".infobox");
    const form = document.getElementById("sheetdb-form");
    const quizBox = document.querySelector(".quiz-box");
    const resultBox = document.querySelector(".result-box");
    const submissionModal = document.getElementById("submissionModal");
    const submissionMessage = document.getElementById("submissionMessage");
    const closeBtn = document.querySelector(".close-btn");
    const errorMessage = document.getElementById("errorMessage");

    let score = 0;
    let currentQuestionIndex = 0;
    let timer;
    let time = 30;

    // Add progress bar element
    const progressBar = document.createElement("div");
    progressBar.className = "progress-bar";
    quizBox.insertBefore(progressBar, quizBox.querySelector('section'));

    const progressBarInner = document.createElement("div");
    progressBarInner.className = "progress-bar-inner";
    progressBar.appendChild(progressBarInner);

    // Initial state
    infoBox.style.display = "none";
    form.style.display = "none";
    quizBox.style.display = "none";
    resultBox.style.display = "none";
    submissionModal.style.display = "none";

    // Disable screenshot functionality for desktop
    document.addEventListener('keyup', (e) => {
        if (e.key === 'PrintScreen') {
            navigator.clipboard.writeText('');
            e.preventDefault();
            alert("Screenshots are not allowed!");
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'p') {
            e.cancelBubble = true;
            e.preventDefault();
            e.stopImmediatePropagation();
            alert("Printing is not allowed!");
        }
    });

    // Attempt to disable screenshots on mobile devices
    // Note: This is not foolproof and may not work on all devices or browsers
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        alert("Don't try to Cheat Right-click and context menu are disabled!");
    });

    // Disable selection
    document.addEventListener('selectstart', (e) => {
        e.preventDefault();
    });

    // Attempt to detect when the page becomes hidden (potential screenshot attempt)
    let visibilityChangeCount = 0;
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            visibilityChangeCount++;
            if (visibilityChangeCount === 1) {
                alert("Warning: Don't try to cheat again, otherwise your exam will be automatically submitted.");
            } else {
                alert("You have attempted to cheat again. Your exam is being submitted.");
                // Call the function to submit the test
                submitTest();
            }
        }
    });

    function submitTest() {
        // Stop the timer
        clearInterval(timer);

        // Prepare the data to be submitted
        const submissionData = {
            ...formData, // Spread the previously stored form data
            SCORE: 0, // Set score to 0 due to cheating
            CHEATED: 'Yes', // Flag to indicate cheating attempt
            TIME_REMAINING: timeLeft // Assuming timeLeft is the remaining time when submitted
        };

        // Hide quiz box
        document.querySelector(".quiz-box").style.display = "none";

        // Show submitting page
        showSubmittingPage(submissionData);

        // Send data to Google Sheets
        sendFormAndScoreToGoogleSheets(submissionData, 0);
    }

    // Event listener for the Take Test button
    continueButton.addEventListener("click", function () {
        continueButton.style.display = "none";
        infoBox.style.display = "block";
    });

    // Event listener for the Continue button inside the info box
    document.querySelector(".infobox .continue").addEventListener("click", function () {
        infoBox.style.display = "none";
        form.style.display = "block";
    });

    // Event listener for form submission
    form.addEventListener("submit", function (e) {
        e.preventDefault();

        // Simple validation
        const name = document.getElementById("CName").value.trim();
        const email = document.getElementById("CEmail").value.trim();
        const rollNo = document.getElementById("CRollNo").value.trim();
        const phoneNumber = document.getElementById("CPhoneNumber").value.trim();

        if (!name || !email || !rollNo || !phoneNumber) {
            errorMessage.textContent = "Please fill all required details!";
            return;
        }

        if (!validateInput(rollNo, 'number') || !validateInput(phoneNumber, 'number')) {
            errorMessage.textContent = "Please enter valid numerical values for Roll No and Phone No.";
            return;
        }

        errorMessage.textContent = "";

        // Store form data for later use
        const formData = {
            NAME: name,
            'FATHERS-NAME': document.getElementById("CFathersName").value.trim(),
            BRANCH: document.getElementById("CBranch").value.trim(),
            SECTION: document.getElementById("CSection").value.trim(),
            'ROLL-NO': rollNo,
            EMAIL: email,
            'PHONE-NUMBER': phoneNumber
        };

        // Display a success message
        showSubmissionSuccess();

        // Hide the form and start the quiz countdown
        form.style.display = "none";
        startQuizCountdown(formData);
    });

    // Start the quiz countdown
    function startQuizCountdown(formData) {
        const countdownText = document.createElement("div");
        countdownText.className = "alert-content countdown";
        countdownText.textContent = "Exam Starting in 3";
        document.body.appendChild(countdownText);

        let countdown = 3;
        const countdownInterval = setInterval(() => {
            countdown--;
            if (countdown > 0) {
                countdownText.textContent = `Exam Starting in ${countdown}`;
            } else {
                countdownText.textContent = `${formData.NAME} Best Wishes !!`;
                clearInterval(countdownInterval);
                setTimeout(() => {
                    countdownText.remove();
                    showQuizBox(formData);
                }, 1000);
            }
        }, 1000);
    }
    

    // Show the quiz box
    function showQuizBox(formData) {
        quizBox.style.display = "block";
        startQuiz(formData);
    }

    // Start the quiz
    function startQuiz(formData) {
        const totalQuestions = 25;
        const questions = [
            {
                question: "What is 5 + 7?",
                options: [
                    "10",
                    "11",
                    "12",
                    "Error",
                ],
                answer: "12",
            },
            {
                question: "If every student in a class of 40 students has a dog, and 20 students have a cat, how many students have both a dog and a cat?",
                options: [
                    "10",
                    "20",
                    "30",
                    "40",
                ],
                answer: "20",
            },
            {
                question: "Which word does NOT belong with the others?",
                options: [
                    "Index",
                    "Glossary",
                    "Chapter",
                    "Book",
                ],
                answer: "Book",
            },
            {
                question: "Safe : Secure :: Protect : ?",
                options: [
                    "Lock",
                    "Guard",
                    "Sure",
                    "Conserve",
                ],
                answer: "Guard",
            },
            {
                question: "If '+' is '×', '×' is '-', '-' is '/' and '/' is '+'. What is the value of '18+2-10/5×2+3' using the above condition?",
                options: [
                    "19.8",
                    "6.8",
                    "2.6",
                    "4",
                ],
                answer: "6.8",
            },
            {
                question: "If the product of two consecutive positive even numbers is 48, what are the numbers?",
                options: [
                    "4 and 12",
                    "6 and 8",
                    "8 and 10",
                    "10 and 12",
                ],
                answer: "6 and 8",
            },
            {
                question: "If a train travels 300 km in 4 hours, what is its speed in km/hr?",
                options: [
                    "60",
                    "75",
                    "100",
                    "120",
                ],
                answer: "75",
            },
            {
                question: "A store offers a 20% discount on a ₹50 item. What is the final price after the discount?",
                options: [
                    "₹30",
                    "₹35",
                    "₹40",
                    "₹45",
                ],
                answer: "₹40",
            },
            {
                question: "If the time is 3:45 PM, what will the time be in 90 minutes?",
                options: [
                    "4:15 PM",
                    "5:15 PM",
                    "4:30 PM",
                    "5:30 PM",
                ],
                answer: "5:15 PM",
            },
            {
                question: "Four friends, A, B, C, and D distribute some money among themselves in such a manner that A gets one less than B, C gets 5 more than D, D gets 3 more than B. Who gets the smallest amount?",
                options: [
                    "A",
                    "B",
                    "C",
                    "D",
                ],
                answer: "A",
            },
            {
                question: "A coin is tossed three times, what will be the probability of getting at least 2 heads?",
                options: [
                    "1/8",
                    "1/2",
                    "7/8",
                    "1/4",
                ],
                answer: "1/2",
            },
            {
                question: "What is the range of f(x)=tanx?",
                options: [
                    "[-1, 1]",
                    "(-∞, ∞)",
                    "(-1,1)",
                    "[0,1]",
                ],
                answer: "(-∞, ∞)",
            },
            {
                question: "What does CPU stand for in computer terminology?",
                options: [
                    "Central Processing Unit",
                    "Computer Personal Unit",
                    "Control Processing Unit",
                    "Central Personal Unit",
                ],
                answer: "Central Processing Unit",
            },
            {
                question: "Which programming language is often used for web development and is known for its flexibility and ease of learning?",
                options: [
                    "C++",
                    "Java",
                    "Python",
                    "HTML",
                ],
                answer: "Python",
            },
            {
                question: "What is the primary purpose of an operating system?",
                options: [
                    "Managing hardware resources",
                    "Browsing the internet",
                    "Running applications",
                    "Playing games",
                ],
                answer: "Managing hardware resources",
            },
            {
                question: "In computer memory, which type of storage is non-volatile and retains data even when the power is turned off?",
                options: [
                    "RAM",
                    "ROM",
                    "Cache",
                    "CPU",
                ],
                answer: "ROM",
            },
            {
                question: "How many bits are there in a nibble?",
                options: [
                    "2",
                    "4",
                    "8",
                    "16",
                ],
                answer: "4",
            },
            {
                question: "Who is the father of computer science?",
                options: [
                    "Charles Babbage",
                    "Tim Berners Lee",
                    "Alan Turing",
                    "Dennis Ritchie",
                ],
                answer: "Charles Babbage",
            },
            {
                question: "In C, which keyword is used to declare a function?",
                options: [
                    "char",
                    "void",
                    "function",
                    "declare",
                ],
                answer: "void",
            },
            {
                question: "What does the 'scanf' function in C do?",
                options: [
                    "Print text to the screen",
                    "Read input from the user",
                    "Perform arithmetic calculations",
                    "Open a file",
                ],
                answer: "Read input from the user",
            },
            {
                question: "What will be the output of the following C code?\n\n#include <stdio.h>\nint main() {\n    int x = 5;\n    printf(\"%d\", x++);\n    return 0;\n}",
                options: [
                    "5",
                    "6",
                    "7",
                    "4",
                ],
                answer: "5",
            },
            {
                question: "What is the result of the expression: 5 % 2 in C?",
                options: [
                    "2.5",
                    "2",
                    "3",
                    "1.0",
                ],
                answer: "1",
            },
            {
                question: "Which of the following is a logical operator?",
                options: [
                    "!",
                    "%",
                    "==",
                    "&",
                ],
                answer: "!",
            },
            {
                question: "Who is the president of Codex Society?",
                options: [
                    "Atishay Tuli",
                    "Tushar Jaswal",
                    "Amrita Gargi",
                    "Geetika Sharma",
                ],
                answer: "Atishay Tuli",
            },
        ];
        
            document.querySelector(".total-quiz").innerHTML = `${currentQuestionIndex + 1} of ${questions.length} Questions`;
        

        let selectedOption = null;
        const timerElement = document.querySelector(".time-sec");
        let timeLeft = time;
        const nextButton = document.querySelector(".next-btn");
        const questionText = document.querySelector(".que-text");
        const optionList = document.querySelectorAll(".option-list .option");

        // Function to show a question
        function showQuestion(index) {
            questionText.textContent = questions[index].question;
            optionList.forEach((option, i) => {
                option.textContent = questions[index].options[i];
                option.classList.remove("correct", "incorrect", "disabled", "selected");
                option.onclick = () => selectOption(option);
            });
            nextButton.style.display = "none"; // Hide Next button until an option is selected
        }

        // Function to select an option
        function selectOption(option) {
            if (selectedOption) {
                selectedOption.classList.remove("selected");
            }
            option.classList.add("selected");
            selectedOption = option;
            nextButton.style.display = "block";
        }

        // Function to disable options
        function disableOptions() {
            optionList.forEach(option => {
                option.classList.add("disabled");
                option.onclick = null;
            });
        }

        // Function to update the quiz counter
        function updateQuizCounter() {
            document.querySelector(".total-quiz").innerHTML = `<span><p>${currentQuestionIndex + 1}</p> of <p>${questions.length}</p> Questions</span>`;
        }

        // Function to start the timer
        function startTimer() {
            timerElement.textContent = timeLeft;
            timer = setInterval(() => {
                timeLeft--;
                timerElement.textContent = timeLeft;

                // Update the width of the progress bar
                const progressPercentage = ((time - timeLeft) / time) * 100;
                progressBarInner.style.width = `${progressPercentage}%`;

                if (timeLeft <= 0) {
                    clearInterval(timer);
                    nextQuestion();
                }
            }, 1000);
        }

        // Function to reset the timer
        function resetTimer() {
            clearInterval(timer);
            timeLeft = time;
            startTimer();
        }

        // Function to handle the next question
        function nextQuestion() {
            if (selectedOption) {
                const correctAnswer = questions[currentQuestionIndex].answer;
                if (selectedOption.textContent === correctAnswer) {
                    selectedOption.classList.add("correct");
                    score++;
                } else {
                    selectedOption.classList.add("incorrect");
                    optionList.forEach(option => {
                        if (option.textContent === correctAnswer) {
                            option.classList.add("correct");
                        }
                    });
                }
            }

            disableOptions();

            if (currentQuestionIndex < questions.length - 1) {
                currentQuestionIndex++;
                setTimeout(() => {
                    showQuestion(currentQuestionIndex);
                    updateQuizCounter();
                    resetTimer();
                }, 400); // Reduced delay for a faster transition to the next question
            } else {
                finishQuiz(formData);
            }

            selectedOption = null; // Reset the selected option for the next question
        }

        // Function to finish the quiz
        function finishQuiz(formData) {
            clearInterval(timer);
            quizBox.style.display = "none";
            showSubmittingPage(formData);
        }

        // Function to show the "Submitting the test" page
        function showSubmittingPage(formData) {
            const submittingText = document.createElement("div");
            submittingText.className = "submitting-text";
            submittingText.textContent = "Wait Submitting the test, Thank you!  -team CODEX";
            document.body.appendChild(submittingText);

            setTimeout(() => {
                submittingText.remove();
                showResultPage(formData);
            }, 1500); // Delay before showing the result page
        }

        // Function to show the result page
        function showResultPage(formData) {
            resultBox.style.display = "block";
            sendFormAndScoreToGoogleSheets(formData, score); // Pass formData and score
        }


        // Click event for Next button
        nextButton.addEventListener("click", nextQuestion);

        // Initialize the quiz
        showQuestion(currentQuestionIndex);
        updateQuizCounter();
        startTimer();
    }

    // Function to send form data and score to Google Sheets
    function sendFormAndScoreToGoogleSheets(formData, score) {
        fetch('https://sheetdb.io/api/v1/chnjqoynyz6xx', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ...formData, SCORE: score })
        })
            .then(response => response.json())
            .then(data => {
                console.log('Data sent successfully:', data);
            })
            .catch(error => {
                console.error('Error sending data:', error);
                showSubmissionError();
            });
    }

    // Function to show a submission success message
    function showSubmissionSuccess() {
        submissionModal.style.display = "block";
        submissionMessage.textContent = "Your details has been submitted successfully!";

        setTimeout(() => {
            submissionModal.style.display = "none";
        }, 2000);
    }

    // Function to show a submission error message
    function showSubmissionError() {
        submissionModal.style.display = "block";
        submissionMessage.textContent = "There was an error submitting your test. Please try again.";
    }

    // Function to validate numerical input
    function validateInput(value, type) {
        if (type === 'number') {
            return !isNaN(value) && value.trim() !== '';
        }
        return true;
    }

    // Close submission modal on close button click
    closeBtn.addEventListener("click", function () {
        submissionModal.style.display = "none";
    });

document.querySelectorAll(".hm").forEach(function(button) {
    button.addEventListener("click", function () {
        window.location.href = 'index.html';
    });
});

});
