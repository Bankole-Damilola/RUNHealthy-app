// =========================================================
//  TEMPERATURE GAUGE
// =========================================================

const minTemp = -10;
const maxTemp = 50;

export function drawTempGauge(canvas, userComfortTemp) {
    // Color scale
    const tempBands = [
        { limit: 0,  color: "#4FC3F7" },
        { limit: 10, color: "#81D4FA" },
        { limit: 20, color: "#21A65A" },
        { limit: 30, color: "#FFEB3B" },
        { limit: 40, color: "#FF9800" },
        { limit: 50, color: "#D32F2F" }
    ];

    const ctx = canvas.getContext("2d");

    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h * 0.85;   // ← Moves arc upward slightly
    const radius = 100;     // ← Fits inside 200px height

    ctx.clearRect(0, 0, w, h);

    const start = Math.PI;

    // Colored ranges
    tempBands.forEach((band, i) => {
        const prev = i === 0 ? minTemp : tempBands[i - 1].limit;

        const sNorm = (prev - minTemp) / (maxTemp - minTemp);
        const eNorm = (band.limit - minTemp) / (maxTemp - minTemp);

        const a1 = start + sNorm * Math.PI;
        const a2 = start + eNorm * Math.PI;

        ctx.beginPath();
        ctx.lineWidth = 18;
        ctx.strokeStyle = band.color;
        ctx.arc(cx, cy, radius - 30, a1, a2);
        ctx.stroke();
    });

    // Tick marks every 10°C
    ctx.fillStyle = "#000";
    ctx.font = "13px Arial";

    for (let t = minTemp; t <= maxTemp; t += 10) {
        const norm = (t - minTemp) / (maxTemp - minTemp);
        const ang = start + norm * Math.PI;

        const tx = cx + Math.cos(ang) * (radius - 5);
        const ty = cy + Math.sin(ang) * (radius - 5);

        ctx.fillText(t, tx - 10, ty);
    }

    // Comfort temperature marker
    const comfortNorm = (userComfortTemp - minTemp) / (maxTemp - minTemp);
    const angle = start + comfortNorm * Math.PI;

    ctx.beginPath();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 4;
    ctx.arc(cx, cy, radius - 55, angle - 0.02, angle + 0.02);
    ctx.stroke();

    console.log('Done with draw temp')
}

export function updateTemperature(needle, temp) {
    
    console.log(`The TEMPERATUREVALUE is ${temp}`)
    
    temp = Math.max(minTemp, Math.min(maxTemp, temp));

    const norm = (temp - minTemp) / (maxTemp - minTemp);
    const angle = norm * 180 - 90;

    // drawTempGauge(25)

    needle.style.transform =
        `rotate(${angle}deg)`;

    // document.getElementById("tempValue").innerText =
    //     `Temperature: ${temp}°C`;
}

// =========================================================
//  PM2.5 GAUGE (Air Quality)
// =========================================================

export function drawPmGauge(canvas, pmValue, userThreshold) {
    const ctx = canvas.getContext("2d");

    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h * 0.85;
    const radius = 100;

    ctx.clearRect(0, 0, w, h);

    // ===== Background Gray Arc =====
    ctx.beginPath();
    ctx.lineWidth = 18;
    ctx.strokeStyle = "#ddd";
    ctx.arc(cx, cy, radius - 30, Math.PI, 2 * Math.PI);
    ctx.stroke();

    // ===== Color Progress Arc =====
    let color = "#21A65A"; // Green (Safe)

    if (pmValue > userThreshold) color = "#FFC107"; // Yellow (Caution)
    if (pmValue > userThreshold * 1.5) color = "#D32F2F"; // Red (Danger)

    const maxPM = 100;
    const progress = Math.min(pmValue / maxPM, 1);
    const angle = Math.PI + progress * Math.PI;

    ctx.beginPath();
    ctx.lineWidth = 20;
    ctx.strokeStyle = color;
    ctx.arc(cx, cy, radius - 30, Math.PI, angle);
    ctx.stroke();

    // ===== Tick Marks =====
    ctx.fillStyle = "#000";
    ctx.font = "13px Arial";
    [0, 50, 100].forEach(v => {
        const norm = v / maxPM;
        const ang = Math.PI + norm * Math.PI;

        const tx = cx + Math.cos(ang) * (radius - 8);
        const ty = cy + Math.sin(ang) * (radius - 8);

        ctx.fillText(v, tx - 10, ty);
    });

    // ===== Comfort Threshold Marker =====
    const thresholdNorm = Math.min(userThreshold / maxPM, 1);
    const thresholdAngle = Math.PI + thresholdNorm * Math.PI;

    ctx.beginPath();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#000"; // Black thin line
    ctx.arc(
        cx,
        cy,
        radius - 22,
        thresholdAngle - 0.01,
        thresholdAngle + 0.01
    );
    ctx.stroke();
}


export function updatePmNeedle(canvas, needle, pmValue, thresholdPm) {
    
    console.log(`The PMVALUE is ${pmValue}`)

    const min = 0, max = 100;
    pmValue = Math.max(min, Math.min(max, pmValue));

    const norm = pmValue / max;
    const angle = norm * 180 - 90;

    drawPmGauge(canvas, pmValue, thresholdPm) // The 35 in the above caters for the user safety limit

    needle.style.transform =
        `rotate(${angle}deg)`;

    // document.getElementById("pmValue").innerText =
    //     `PM2.5: ${pmValue} µg/m³`;
}


// updatePmNeedle(20)

