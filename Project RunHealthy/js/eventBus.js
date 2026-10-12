// A super lightweight global event manager

/**
 * Simple event bus for component communication
 */
const listeners = {};

/**
 * Register an event listener
 * @param {string} eventName - Event name
 * @param {Function} callback - Handler function
 */
export function on(eventName, callback) {
    if (!listeners[eventName]) listeners[eventName] = [];
    listeners[eventName].push(callback);
}

/**
 * Emit an event with data
 * @param {string} eventName - Event name
 * @param {any} data - Event data
 */
export function emit(eventName, data) {
    if (!listeners[eventName]) return;
    listeners[eventName].forEach(cb => cb(data));
}