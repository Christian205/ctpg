let isGenerating = false; // Flag to prevent multiple clicks

function showForm() {
    var intro = document.getElementById('intro');
    var capstoneForm = document.getElementById('Capstone');
    var titleBox = document.getElementById('title-box');

    intro.style.display = "none";
    capstoneForm.style.display = "block";
    titleBox.style.display = "block";

    capstoneForm.scrollIntoView({ behavior: 'smooth' });
}

async function generateTitle() {
    if (isGenerating) return; // Prevent multiple clicks during countdown

    const apiKey = "AIzaSyDiRZTikGvOZXx0hzh3b8xOQ2WxhML5lU4";  // Replace with your actual Gemini API key
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    // Get user input
    const userTopic = document.getElementById("topic").value.trim();
    const selectedGenerate = document.getElementById("generate").value;
    const selectedField = document.getElementById("fields").value;
    const titleElement = document.getElementById("generated-titles");

    // Validate input
    if (!userTopic) {
        Swal.fire({
            title: "Error!",
            text: "Please enter your topic!!",
            icon: "error"
        });
        return;
    }

    if (selectedGenerate === "--Choose What to Generate--") {
        Swal.fire({
            title: "Selection Required!",
            text: "Please select what you want to generate!",
            icon: "warning"
        });
        return;
    }

    if (selectedField === "--Select a Field--") {
        Swal.fire({
            title: "Selection Required!",
            text: "Please select a field!",
            icon: "warning"
        });
        return;
    }

    // Check if the input contains only letters and spaces
    const isValidInput = /^[a-zA-Z\s]+$/.test(userTopic);
    if (!isValidInput) {
        Swal.fire({
            title: "Error!",
            text: "Please enter a valid topic (letters and spaces only)!!",
            icon: "error"
        });
        return;
    }

    // Create and show loader animation
    const loader = document.createElement("div");
    loader.className = "loader";
    titleElement.innerHTML = ""; // Clear previous title
    titleElement.appendChild(loader); 

    // AI prompt
    const promptText = selectedGenerate === "Generate Title"
        ? `Generate 1 unique capstone project titles related to: ${userTopic} in the field of ${selectedField}. provide the programming language used to build the project and a verry short description.`
        : `Generate a capstone project proposal related to: ${userTopic} in the field of ${selectedField}`;

    const prompt = {
        contents: [{ role: "user", parts: [{ text: promptText }] }]
    };

    try {
        console.log("Sending request to API:", url);
        console.log("Request payload:", JSON.stringify(prompt));

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(prompt)
        });

        console.log("Response status:", response.status);
        console.log("Response headers:", response.headers);

        // Check if the response status is not OK
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }

        // Parse response
        const data = await response.json();
        console.log("API Response:", data); // Debug API response

        // Check if the response structure is correct
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0] || !data.candidates[0].content.parts[0].text) {
            throw new Error("Unexpected API response structure");
        }

        const generatedText = data.candidates[0].content.parts[0].text || "No title generated!!!";

        // Ensure Proper Formatting
        let titlesArray = generatedText.split("\n").filter(title => title.trim() !== "");
        
        let titleListHTML = ""; // Create an unordered list
        titlesArray.forEach(title => {
            const [titleText, programmingLanguage, description] = title.split(" - ");
            titleListHTML += `
                <div class="title-item">
                    <p>${titleText.replace(/\*\*/g, '')}</p>
                    <p>${programmingLanguage ? programmingLanguage.replace(/\*\*/g, '') : ''}</p>
                    <p>${description ? description.replace(/\*\*/g, '') : ''}</p>
                </div>
            `; // Format each title properly
        });

        // Remove loader and show formatted titles
        titleElement.innerHTML = `<div class="result-title"></div><div class="result-content">${titleListHTML}</div>`;

    } catch (error) {
        console.error("Error:", error);
        titleElement.innerText = "Error generating title.";
        Swal.fire({
            title: "Error generating title!",
            text: `Please try again. Error: ${error.message}`,
            icon: "error"
        });
    }

    // Start the countdown
    startCountdown();
}

function startCountdown() {
    const button = document.getElementById('submit');
    let countdown = 10; // 10 seconds

    // Disable the button and update its text
    isGenerating = true;
    button.disabled = true;
    button.innerHTML = `Wait ${countdown} seconds to generate again`;

    const interval = setInterval(() => {
        countdown--;
        button.innerHTML = `Wait ${countdown} seconds to generate again`;

        if (countdown <= 0) {
            clearInterval(interval);
            button.disabled = false;
            button.innerHTML = `<img src="generate.png" alt="Generate Icon"> Generate`;
            isGenerating = false; // Reset the flag
        }
    }, 1000); // Update every second
}

// **Updated Copy Function: Copies Only the Titles Correctly**
function copyToClipboard() {
    let titleList = document.querySelectorAll("#generated-titles .title-item");
    
    if (titleList.length === 0) {
        Swal.fire({
            title: "No titles to copy!",
            icon: "warning"
        });
        return;
    }

    let textToCopy = "";
    titleList.forEach(item => {
        textToCopy += `${item.innerText}\n\n`; // Adds spacing between items
    });

    navigator.clipboard.writeText(textToCopy).then(() => {
        Swal.fire({
            title: "Copied to clipboard!",
            text: textToCopy,
            icon: "success"
        });
    }).catch(err => {
        console.error("Failed to copy:", err);
        Swal.fire({
            title: "Copy failed!",
            text: "Please try manually.",
            icon: "error"
        });
    });
}

function deleteTitles() {
    const titleElement = document.getElementById("generated-titles");
    titleElement.innerHTML = ""; // Clear the generated titles
    document.getElementById("topic").value = ""; // Clear the topic input
    document.getElementById("generate").value = "--Choose What to Generate--"; // Reset the generate select
    document.getElementById("fields").value = "--Select a Field--"; // Reset the fields select
    Swal.fire({
        title: "Deleted!",
        text: "Generated titles have been deleted!",
        icon: "success"
    });
}

function downloadTitles() {
    let titleList = document.querySelectorAll("#generated-titles .title-item");
    if (titleList.length === 0) {
        Swal.fire({
            title: "No titles or proposal to download!",
            icon: "warning"
        });
        return;
    }

    let textToDownload = "";
    titleList.forEach(item => {
        textToDownload += `${item.innerText}\n\n`; // Adds spacing between items
    });

    const blob = new Blob([textToDownload], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated_titles.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}