document.getElementById("signupForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    // Show "Submitting..." message
    const submittingMessageElement = document.getElementById("submittingMessage");
    submittingMessageElement.textContent = "Submitting sign up form ..."; 

    // Collect form data
    const formData = {
        urName: document.getElementById("urName").value.trim(),
        urEmail: document.getElementById("urEmail").value.trim(),
        urPwd: document.getElementById("urPwd").value.trim(),
        cfmpass: document.getElementById("cfmpass").value.trim(),
    };

    // Submit the data as JSON
    try {
        const response = await fetch("/member/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
        });

        if (response.ok) {
            const result = await response.json(); // Parse JSON response
            // console.log(result.message); // Log the success message

            clearErrors(); // Clear previous errors

            // Create a temporary message element for Success
            const tempMessage = document.createElement("div");
            tempMessage.textContent = result.message; // Set the message text
            tempMessage.style.position = "absolute"; // Position relative to the form
            tempMessage.style.top = "calc(18% + 10px)"; // Position just below the form 18%
            tempMessage.style.left = "30%"; // Align with the left edge of the form 30%
            tempMessage.style.padding = "10px"; // Add some padding
            tempMessage.style.backgroundColor = "green"; // Background color
            tempMessage.style.color = "white"; // Text color
            tempMessage.style.borderRadius = "5px"; // Rounded corners
            tempMessage.style.zIndex = "1000"; // Ensure it's on top

            // Append to the form container
            const formContainer = document.getElementById("signupForm");
            formContainer.appendChild(tempMessage); // Add to form

            // Remove the message after a specified duration 
            setTimeout(() => {
                tempMessage.remove(); // Remove the message
            }, 5000); // 5 seconds

            document.getElementById("signupForm").reset(); // Reset the form
        } else {
            const errorData = await response.json();
            displayErrors(errorData); // Show validation and `chkResult` errors
        }
    } catch (error) {
        console.error("Error:", error);
        document.getElementById("errorMessage").textContent = "Something went wrong. Please try again.";
    } finally {
        // Clear the submitting message
        submittingMessageElement.textContent = "";
    }
});

// Function to display errors dynamically
function displayErrors(errors) {
    clearErrors(); // Clear previous errors

    // Create an array to collect error messages
    const errorMessages = [];

    // Display validation errors
    if (errors.validationErrors && errors.validationErrors.length > 0) {
        errors.validationErrors.forEach((error) => {
            const errorElement = document.getElementById(`${error.path}Error`);
            if (errorElement) {
                // errorElement.textContent = error.msg; // Display next to the input field
                errorMessages.push(error.msg); // Collect error messages
            }
        });
    }
    
    // Display chkResult errors
    if (errors.chkResult && errors.chkResult.length > 0) {
        const errorDiv = document.getElementById("errorMessage");
        errorDiv.innerHTML = ""; // Clear previous messages
        const ul = document.createElement("ul");

        errors.chkResult.forEach((message) => {
            // const li = document.createElement("li");
            // li.textContent = message;
            // li.style.fontWeight = "bold"; // Make the text bold
            // li.style.color = "red"; // Change text color to red
            // ul.appendChild(li);
            errorMessages.push(message); // Collect error messages
        });
        errorDiv.appendChild(ul);
    };

    // If there are any Error messages, display them in a temporary message
    if (errorMessages.length > 0) {
        const tempMessageContainer = document.createElement("div");
        tempMessageContainer.style.position = "absolute"; // Position relative to the form
        tempMessageContainer.style.top = "calc(18% + 10px)"; // Position just below the form 18%
        tempMessageContainer.style.left = "38%"; // Align with the left edge of the form 38%
        tempMessageContainer.style.padding = "10px"; // Add some padding
        tempMessageContainer.style.backgroundColor = "chocolate"; // Background color for errors
        tempMessageContainer.style.color = "white"; // Text color
        tempMessageContainer.style.borderRadius = "5px"; // Rounded corners
        tempMessageContainer.style.zIndex = "1000"; // Ensure it's on top

        // Create a paragraph for each error message
        errorMessages.forEach((msg) => {
            const p = document.createElement("p");
            p.textContent = msg; // Set the message text
            p.style.fontWeight = "bold"; // Set the font weight to bold
            p.style.margin = "0"; // Remove default margin to avoid spacing issues
            p.style.lineHeight = "1.5"; // Adjust line height for better readability
            tempMessageContainer.appendChild(p); // Append the paragraph to the container
        });

        // Append the container to the form
        const formContainer = document.getElementById("signupForm");
        formContainer.appendChild(tempMessageContainer); // Add to form

        // Remove the message after a specified duration 
        setTimeout(() => {
            tempMessageContainer.remove(); // Remove the message
        }, 5000); // 5 seconds
    };
};

// Function to clear all errors dynamically
function clearErrors() {
    document.querySelectorAll(".error-message").forEach((errorElement) => {
        errorElement.textContent = "";
    });
    document.getElementById("errorMessage").innerHTML = "";
}