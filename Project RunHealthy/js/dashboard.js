import { drawPmGauge, drawTempGauge, updatePmNeedle, updateTemperature } from "../component/gauge/gauge.js";
import { getConfig } from "../config/configManager.js";
import { emit, on } from "./eventbus.js";
import { loadNetwork } from "../network/apiManager.js";

let config;
const gaugeRegistry = {
    uiElem: {
        pm: null, temp: null
    },
    values: {
        pm25: null, temp: null, timeStamp: null
    },
    ready: {
        pm: false, temp: false
    }
}

on("config:ready", () => {
    config = getConfig();
    // console.log(config)
    initDashboard();
})

on("network:data", (data) => {
    // console.log(data)

    gaugeRegistry.values.pm25 = data.air.currentPM25
    gaugeRegistry.values.temp = data.weather.current.temperature
    gaugeRegistry.values.timeStamp = new Date(data.weather.fetchedAt)
    emit("dashboard:update");
});


on("dashboard:update", () => {
    // console.log(`This is registry value ${gaugeRegistry.values.pm25}`)
    updateDashboardUI(gaugeRegistry.values.pm25, gaugeRegistry.values.temp, gaugeRegistry.values.timeStamp);
});

on("gauge:pm:ready", () => {
    updatePmGaugeValue(gaugeRegistry.values.pm25)
});

on("gauge:temp:ready", () => {
    updateTempGaugeValue(gaugeRegistry.values.temp)
})

on("config:changed", async () => {
    // RESET the registry first
    gaugeRegistry.uiElem = { pm: null, temp: null };
    gaugeRegistry.values = { pm25: null, temp: null };
    gaugeRegistry.ready = { pm: false, temp: false };
    
    config = getConfig();
    
    // Load network AFTER resetting
    await loadNetwork(config.userProfile.location);
    
    // Initialize dashboard
    initDashboard();
});


function fetchTemperatureGauge() {

    fetch("../component/gauge/gauge.html")
    .then(res => res.text())
    .then(html => {
        const temperatureHolder = document.getElementById("temperature_gauge")
        temperatureHolder.innerHTML = html

        // Get elements AFTER they exist
        const canvas = temperatureHolder.querySelector(".gauge");
        const needle = temperatureHolder.querySelector(".needle");

        canvas.id = "tempCanvas"
        needle.id = "tempNeedle"

        gaugeRegistry.uiElem.temp = { canvas, needle }
        gaugeRegistry.ready.temp = true


        requestAnimationFrame(() => {
            drawTempGauge(canvas, config.thresholds.temperature.max)
            gaugeRegistry.ready.temp = true
            emit("gauge:temp:ready")
        });
        
    });
}

function fetchPmGauge() {
    fetch("../component/gauge/gauge.html")
    .then(res => res.text())
    .then(html => {
        const gaugeHolder = document.querySelector(".pm-gauge");
        gaugeHolder.innerHTML = html;

        const canvas = gaugeHolder.querySelector(".gauge");
        const needle = gaugeHolder.querySelector(".needle")

        canvas.id = "pmCanvas"
        needle.id = "pmNeedle"

        gaugeRegistry.uiElem.pm = {canvas, needle}

        requestAnimationFrame(() => {
            updatePmNeedle(canvas, needle, 0, config.thresholds.air.pm25)
            gaugeRegistry.ready.pm = true
            emit("gauge:pm:ready")
        });


        
    });
}


function updateDashboardUI(pm25, temp, time_stamp) {
    const dashboardQuerySelector = document.querySelector("main .main_body_container")
    // console.log(dashboardQuerySelector)

    // Location
    dashboardQuerySelector.querySelector(".chart_note span").innerText = config.userProfile.location
    // console.log(`This is element${document.querySelector(".pm_gauge_text_wrapper .pm_value")}`)

    // Chart Readings
    // Air Quality
    const pmVal = pm25 ?? 55
    dashboardQuerySelector.querySelector(".pm_gauge_text_wrapper .pm_value").innerText = pmVal + config.thresholds.air.unit // Switch for actual data once populated by API
    
    // Temperature
    const tempVal = temp ?? 6
    dashboardQuerySelector.querySelector(".temp_gauge_text_wrapper .temp_value").innerText = tempVal + config.thresholds.temperature.unit // Switch for actual data once populated by API

    dynamicAdvice(pmVal, tempVal, dashboardQuerySelector)

    // Safety
    dashboardQuerySelector.querySelector(".pm_text span").innerText = (config.thresholds.air.pm25) + config.thresholds.air.unit
    dashboardQuerySelector.querySelector(".temp_value_range span").innerText = `${config.thresholds.temperature.min} - ${config.thresholds.temperature.max}${config.thresholds.temperature.unit}`

    // Time updated
    document.querySelector(".time_stamp span").innerText = `${time_stamp}`
}

export function dynamicAdvice(pmData, tempData, uiElem) {
    if (!uiElem || !config) return;

    const extremeJudge = 1.5;

    const pmLimit = config.thresholds.air.pm25;
    const minTemp = config.thresholds.temperature.min;
    const maxTemp = config.thresholds.temperature.max;

    const isPmGood = pmData <= pmLimit;
    const isPmExtreme = pmData >= pmLimit * extremeJudge;
    const isTempGood = tempData >= (minTemp - 5) && tempData <= (maxTemp + 5);

    let adviceKey = "caution";

    if (isPmGood && isTempGood) {
        adviceKey = "good";
    } else if (isPmExtreme || !isTempGood) {
        adviceKey = "bad";
    }

    applyAdviceUI(uiElem, config.advice[adviceKey], adviceKey);
}

function applyAdviceUI(uiElem, adviceData, state) {
    const adviseCard = uiElem.querySelector(".advise_card");
    const titleEl = adviseCard.querySelector(".advise");
    const noteEl = adviseCard.querySelector(".advise_note");
    const listEl = uiElem.querySelector(".recommended_advise_card .recommended_advise");

    // Reset states
    adviseCard.classList.remove("good", "caution", "bad");

    // Apply state
    adviseCard.classList.add(state);

    // Text content
    titleEl.innerText = adviceData.status;
    noteEl.innerText = adviceData.note;

    // Recommendations
    listEl.innerHTML = adviceData.recommendations
        .map(item => `<li>${item}</li>`)
        .join("");
}

function updatePmGaugeValue(pmValue) {
    // console.log("Needle update for PM run");
    if (!gaugeRegistry.uiElem.pm) return;

    // console.log("Needle update for PM");
    const { canvas, needle } = gaugeRegistry.uiElem.pm;
    updatePmNeedle(canvas, needle, pmValue, config.thresholds.air.pm25)
}

function updateTempGaugeValue(tempValue) {
    if (!gaugeRegistry.uiElem.temp) return;

    const { canvas, needle } = gaugeRegistry.uiElem.temp;
    updateTemperature(needle, tempValue)
}


function initDashboard() {
    fetchTemperatureGauge(); // Works Fine do not change anything for now
    fetchPmGauge(); // Works Fine do not change anything for now
    updateDashboardUI(gaugeRegistry.values.pm25, gaugeRegistry.values.temp, gaugeRegistry.values.timeStamp);; // TODO: Update using data from API 
}
