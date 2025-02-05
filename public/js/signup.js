const API_URL = "http://localhost:2222";

document.getElementById("signupForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value;
    const firstname = document.getElementById("firstname").value;
    const lastname = document.getElementById("lastname").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch(`${API_URL}/users/signup`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, firstname, lastname, password }),
        });

        const data = await response.json();

        if (response.ok) {
            alert("Signup successful! Redirecting to login...");
            window.location.href = "login.html";
        } else {
            alert(data.error || "Signup failed! Please try again.");
        }
    } catch (error) {
        console.error("Error during signup:", error);
        alert("An error occurred. Please try again later.");
    }
});
