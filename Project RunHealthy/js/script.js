// Component usage
// Import this FIRST in your main file
import "../component/alert/alert.js"; // This registers the event listener

import { loadConfig, updateConfig, getConfig } from "../config/configManager.js";
import { loadNetwork, fetchGeoLocation } from "../network/apiManager.js";
import { emit, on } from "./eventbus.js";
import { validateThresholds } from "./validation.js";


let config;

(async() => {
    await loadConfig();
    emit("config:ready");

    config = getConfig()
    loadNetwork(config.userProfile.location)
})();

function fetchNavComponent() {

    fetch("../component/nav/nav.html")
    .then(res => res.text())
    .then(html => {
        const navHolder = document.getElementById("nav_placeholder");
        navHolder.innerHTML = html;

        // Highlight active page
        const currentPage = location.pathname.split("/").pop() || "dashboard.html";
        console.log(`Current Page is ${currentPage}`)
        const links = navHolder.querySelectorAll("a[data-page]");

        links.forEach(link => {
            console.log(`Link page is ${link.getAttribute("data-page")}`)
            if (link.getAttribute("data-page") === currentPage) {
                link.classList.add("active");
                console.log(`Got here to evaluate`);
            }
        });
    });
}

function loadDialog() {
    return fetch("../component/dialog/dialog.html")
        .then(res => res.text())
        .then(html => {
            document.getElementById("dialogHolder").innerHTML = html;

            // AFTER dialog exists in DOM
            const dialog = document.getElementById("myDialog");

            document.getElementById("openDialogBtn").onclick = () => {
                dialog.showModal();
            };

            document.getElementById("dialog_done_btn").onclick = async () => {

                const pm25 = parseNumber(dialog.querySelector("#air_quality").value);
                const tMin = parseNumber(dialog.querySelector("#temp_min").value);
                const tMax = parseNumber(dialog.querySelector("#temp_max").value);

                const newLocation = valueChecker(dialog.querySelector("#location").value);

                const errors = validateThresholds(pm25, tMin, tMax);

                if (errors.length > 0) {
                    console.log(errors.join("\n"));
                    emit("alert:show", {
                        type: "warning",
                        message: errors[0]
                    });
                    return;
                }

                let geoLocation

                if(newLocation !== null) {
                    let geoData 
                    try {
                        geoData = await fetchGeoLocation(newLocation)
                    } catch {
                        emit("alert:show", {
                            type: "error",
                            message: "Location not found. Please enter a valid city."
                        });
                    }

                    if(!geoData) {
                        return
                    } else {
                        geoLocation = geoData.city
                    }
                } else {
                    geoLocation = config.userProfile.location
                }

                updateConfig({
                    userProfile: { location: geoLocation },
                    thresholds: {
                        air: { pm25: pm25 ?? config.thresholds.air.pm25 , unit: "ug/m^3" },
                        temperature: { min: tMin ?? config.thresholds.temperature.min, max: tMax ?? config.thresholds.temperature.max, unit: "°C" }
                    }
                });

                // dialog.close(); 
                console.log("Changes saved!");
                emit("alert:show", {
                    type: "success",
                    message: "Settings updated successfully"
                });
                dialog.close();
            };
        });
}

function valueChecker(value) {
    // Returns cleaned value or null if invalid
    if (value === "" || value === null || value === undefined) {
        return null;
    }
    
    // Trim whitespace if it's a string
    if (typeof value === 'string') {
        value = value.trim();
        if (value === "") {
            return null;
        }
    }
    
    return value;
}

function parseNumber(value) {
    // Get validated value first
    const validatedValue = valueChecker(value);
    
    // If valueChecker returns null, return null
    if (validatedValue === null) {
        return null;
    }
    
    const num = Number(validatedValue);
    return Number.isNaN(num) ? null : num;
}


fetchNavComponent(); // Works Fine do not change anything for now
loadDialog();

