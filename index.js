// ==UserScript==
// @name         BLUE_MOODLE.ClosePopup() Hijacker
// @namespace    https://moodle.uowplatform.edu.au/
// @version      1.3
// @description  Hijacks ClosePopup to fully remove popups and overlays from UOW Moodle without reloading the page.
// @author       Gabriel
// @match        https://moodle.uowplatform.edu.au/*
// @grant        none
// ==/UserScript==

(() => {
    'use strict';

    // Number of retries to wait for BLUE_MOODLE to load
    let retries = 100;

    // Set up a repeating interval check every 100ms
    const interval = setInterval(() => {
        // Reference to the global BLUE_MOODLE object
        const bm = window.BLUE_MOODLE;

        // Exit if retries run out OR the required functions exist
        if (!--retries || (bm?.ClosePopup && bm?.CommonPopUp)) {
            // Stop further interval checks
            clearInterval(interval);

            // If the ClosePopup function exists on BLUE_MOODLE
            if (bm?.ClosePopup) {
                // Override the ClosePopup function
                bm.ClosePopup = (id = "dvOuter") => {
                    // Attempt to get the element by ID (default "dvOuter")
                    const el = document.getElementById(id);

                    // If element not found, log a warning and exit
                    if (!el) return console.warn(`[TM] Element '${id}' not found.`);

                    // Get the parent of the element
                    const parent = el.parentNode;

                    // If the parent is the overlay container (dvOuter), remove the entire container
                    if (parent?.id === "dvOuter") {
                        parent.remove();
                        console.log(`[TM] Removed popup container and overlay.`);
                    } else {
                        // Otherwise, remove just the specific element
                        el.remove();
                        console.log(`[TM] Removed popup element with id: ${id}`);
                    }
                };
            }
        }
    }, 100); // Retry interval: 100ms
})();
