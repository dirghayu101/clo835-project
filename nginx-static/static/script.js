function changeText() {
    const textElement = document.getElementById('dynamic-text');
    textElement.innerHTML = "You've clicked the button! Nginx is serving this dynamic change.";
    textElement.style.color = "#f39c12";
}
