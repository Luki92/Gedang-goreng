import { personaStore } from '../stores/persona.svelte.js';

export function detectUniversal() {
    if (typeof window === 'undefined') return;

    // 1. Browser Detection
    const userAgent = navigator.userAgent;
    let browser = 'Unknown';
    if (userAgent.indexOf("Firefox") > -1) browser = "Firefox";
    else if (userAgent.indexOf("SamsungBrowser") > -1) browser = "Samsung";
    else if (userAgent.indexOf("Opera") > -1 || userAgent.indexOf("OPR") > -1) browser = "Opera";
    else if (userAgent.indexOf("Trident") > -1) browser = "Explorer";
    else if (userAgent.indexOf("Edge") > -1 || userAgent.indexOf("Edg") > -1) browser = "Edge";
    else if (userAgent.indexOf("Chrome") > -1) browser = "Chrome";
    else if (userAgent.indexOf("Safari") > -1) browser = "Safari";

    // 2. OS Detection
    let os = "Unknown";
    if (userAgent.indexOf("Win") !== -1) os = "Windows";
    if (userAgent.indexOf("Mac") !== -1) os = "MacOS";
    if (userAgent.indexOf("Linux") !== -1) os = "Linux";
    if (userAgent.indexOf("Android") !== -1) os = "Android";
    if (userAgent.indexOf("like Mac") !== -1) os = "iOS";

    // 3. Resolution
    const res = `${window.screen.width}x${window.screen.height}`;

    // Wait a bit after load to trigger
    setTimeout(() => {
        const pool = [];
        if (browser !== 'Unknown') pool.push({ type: 'BROWSER', val: browser });
        if (os !== 'Unknown') pool.push({ type: 'OS', val: os });
        pool.push({ type: 'RESOLUTION', val: res });
        pool.push({ type: 'RESOLUTION', val: null }); // Generic resolution roasts

        const chosen = pool[Math.floor(Math.random() * pool.length)];
        personaStore.triggerRandom(chosen.type, chosen.val);
    }, 5000);
}
