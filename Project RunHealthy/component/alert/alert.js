import { on } from "../../js/eventbus.js";

let container;
let isInitialized = false;

async function initAlertSystem() {
    if (isInitialized) return;
    
    try {
        // Fetch the alert HTML component
        const response = await fetch("../component/alert/alert.html");
        const html = await response.text();
        
        // Create a temporary div to parse the HTML
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = html;
        
        // Find the alert container in the fetched HTML
        const alertContainer = tempDiv.querySelector("#alertContainer");
        
        if (alertContainer) {
            // Append to body
            document.body.appendChild(alertContainer);
            container = alertContainer;
            console.log("Alert container loaded successfully");
        } else {
            // Fallback: create container if not in HTML
            console.warn("Alert container not found in HTML, creating dynamically");
            container = document.createElement("div");
            container.id = "alertContainer";
            container.className = "alert-container";
            document.body.appendChild(container);
        }
        
        isInitialized = true;
    } catch (error) {
        console.error("Failed to load alert component:", error);
        // Fallback: create minimal container
        container = document.createElement("div");
        container.id = "alertContainer";
        container.className = "alert-container";
        document.body.appendChild(container);
        isInitialized = true;
    }
}

/**
 * Display an alert message
 * @param {string} message - Alert text
 * @param {string} type - Alert type (success, error, warning)
 * @param {number} timeout - Auto-remove timeout in ms
 */
export function showAlert(message, type = "error", timeout = 4000) {
    // Ensure system is initialized
    if (!isInitialized || !container) {
        initAlertSystem().then(() => {
            // Retry after initialization
            showAlert(message, type, timeout);
        });
        return;
    }
    
    const alert = document.createElement("div");
    alert.className = `alert ${type}`;
    alert.innerHTML = `
        <span>${message}</span>
        <button>&times;</button>
    `;

    alert.querySelector("button").onclick = () => alert.remove();
    container.appendChild(alert);

    if (timeout) {
        setTimeout(() => {
            alert.remove();
        }, timeout);
    }
}

// Initialize on import
initAlertSystem();

// Event-driven alerts
on("alert:show", ({ message, type }) => {
    console.log(`Alert event received: ${type} - ${message}`);
    showAlert(message, type);
});

// Optional: Export for manual use
export default { showAlert };