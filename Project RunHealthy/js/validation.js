/**
 * Validate user threshold inputs
 * @param {number} pm25 - PM2.5 threshold
 * @param {number} tMin - Minimum temperature
 * @param {number} tMax - Maximum temperature
 * @returns {string[]} Array of error messages
 */
export function validateThresholds(pm25, tMin, tMax) {
    const errors = [];

    // PM2.5 validation (only if provided)
    if (pm25 !== null) {
        if (pm25 < 0) errors.push("PM2.5 cannot be below 0.");
        if (pm25 > 500) errors.push("PM2.5 cannot exceed 500 µg/m³.");
    }

    // Temperature validation (only if provided)
    if (tMin !== null && tMin < -20) {
        errors.push("Minimum temperature cannot be below -20°C.");
    }

    if (tMax !== null && tMax > 60) {
        errors.push("Maximum temperature cannot exceed 60°C.");
    }

    // Only compare min/max if BOTH are provided
    if (tMin !== null && tMax !== null && tMin >= tMax) {
        errors.push("Minimum temperature must be LOWER than maximum temperature.");
    }

    return errors;
}

