import { emit } from "../js/eventbus.js";

let GLOBAL_CONFIG = null;
const DEFAULT_CONFIG = {
    userProfile: { location: "Unknown", condition: "", preferredActivity: "" },
    thresholds: {
        air: { pm25: 35, unit: "ug/m^3" },
        temperature: { min: 5, max: 30, unit: "°C" }
    },
    advice: {
        good: { status: "", message: "", note: "", recommendations: [] },
        bad: { status: "", message: "", note: "", recommendations: [] },
        caution: { status: "", message: "", note: "", recommendations: [] }
    }
};


/**
 * Load configuration from file and localStorage
 * Merges defaults, file config, and user overrides
 */
export async function loadConfig() {
    if (GLOBAL_CONFIG) return GLOBAL_CONFIG;

    const res = await fetch("/config/config.json");
    const fileConfig = await res.json();

    // Load overrides first
    const saved = loadUserOverrides();
    let userOverrides = saved ? JSON.parse(saved) : {};

    // Merge all config sources with priority: user overrides > file config > defaults
    GLOBAL_CONFIG = structuredClone({
        ...DEFAULT_CONFIG,
        ...fileConfig,
        ...userOverrides
    });

    console.log(`Config instantiation happened ${GLOBAL_CONFIG}`)
    console.log(GLOBAL_CONFIG)

    // emit("config:ready", GLOBAL_CONFIG);
    return GLOBAL_CONFIG;
}

export function getConfig() {
    return GLOBAL_CONFIG;
}

/**
 * Update configuration and persist changes
 * @param {Object} newValues - Partial configuration to update
 */
export function updateConfig(newValues) {
    GLOBAL_CONFIG = structuredClone({
        ...DEFAULT_CONFIG,
        ...GLOBAL_CONFIG,
        ...newValues
    });

    persistConfig();
    emit("config:changed", GLOBAL_CONFIG); // 🔥 notify all listeners
}


/**
 * Save configuration to localStorage
 */
export function persistConfig() {
    localStorage.setItem("user_config", JSON.stringify(GLOBAL_CONFIG));
}


/**
 * Load user configuration from localStorage
 * @returns {string|null} JSON string or null
 */
function loadUserOverrides() {
    const saved = localStorage.getItem("user_config");
    if (saved) {
        return saved;
    }
}
