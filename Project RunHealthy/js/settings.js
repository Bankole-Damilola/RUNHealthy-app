import { getConfig } from "../config/configManager.js";
import { emit, on } from "./eventbus.js";


let config;

on("config:ready", () => {
    config = getConfig();
    console.log(config)
    initSettings();
})

on("config:changed", () => {
    config = getConfig()
    initSettings()
})

function updateSettingsUi() {
    // Get settings html
    const settingsSelector = document.querySelector(".settings_container .settings_wrapper")
    console.log(`Settings Inner HTML ${settingsSelector}`)

    // Set Setting Location
    settingsSelector.querySelector(".outdoor_and_location .location").innerText = config.userProfile.location

    // Set Settings Safety Air Quality
    settingsSelector.querySelector(".air_quality .pm_value").innerText = (config.thresholds.air.pm25) + config.thresholds.air.unit

    // Set Settings Safety Temperature
    settingsSelector.querySelector(".temperature .temp_value").innerText = `${config.thresholds.temperature.min} - ${config.thresholds.temperature.max}${config.thresholds.temperature.unit}`


}

function initSettings() {
    updateSettingsUi()
}


