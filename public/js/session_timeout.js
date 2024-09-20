let timeoutID;

// Session timeout duration (1 hour = 3600 seconds)
const sessionTimeout = 3600 * 1000; // 1 hour in milliseconds

function resetTimer() {
    clearTimeout(timeoutID);
    timeoutID = setTimeout(logoutUser, sessionTimeout);
}

function logoutUser() {
    alert("Session expired due to inactivity. Logging out.");
    localStorage.clear();
    window.location.href = "index.html"; 
}

// Listen for user activity to reset the timer
window.onload = resetTimer;
document.onmousemove = resetTimer;
document.onkeydown = resetTimer;
document.ontouchstart = resetTimer;
