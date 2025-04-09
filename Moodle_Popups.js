// ==UserScript==
// @name         BLUE_MOODLE Kill All Popups Toggle (with Block Counter)
// @namespace    https://moodle.uowplatform.edu.au/
// @version      2.8
// @description  Toggle to block Moodle popups with a persistent setting and live counter of blocked popups displayed on the button
// @author       Luke
// @match        https://moodle.uowplatform.edu.au/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(() => {
    'use strict';

    const TOGGLE_KEY = 'popupVisibilityAllowed';
    let popupBlockingEnabled = localStorage.getItem(TOGGLE_KEY) === 'false';
    let popupBlockedCount = 0;

    const createHeaderToggleButton = () => {
        const toggleItem = document.createElement('li');
        toggleItem.className = 'rui-icon-menu-togglepopups';

        const btn = document.createElement('button');
        btn.id = "popup-toggle-btn";
        btn.type = "button";
        btn.title = "Click to toggle popup visibility";
        btn.style.position = "relative";
        btn.style.padding = "6px 12px";
        btn.style.fontSize = "13px";
        btn.style.border = "1px solid #ccc";
        btn.style.borderRadius = "6px";
        btn.style.margin = "4px";
        btn.style.cursor = "pointer";
        btn.style.color = "white";

        const badge = document.createElement('span');
        badge.id = "popup-blocked-count";
        badge.textContent = "0";
        badge.style.position = "absolute";
        badge.style.top = "-4px";
        badge.style.right = "-6px";
        badge.style.background = "#f44336";
        badge.style.color = "white";
        badge.style.fontSize = "10px";
        badge.style.padding = "2px 5px";
        badge.style.borderRadius = "50%";
        badge.style.display = "none";
        badge.style.minWidth = "18px";
        badge.style.textAlign = "center";

        const updateButton = () => {
            btn.textContent = `Popups: ${popupBlockingEnabled ? "OFF" : "ON"}`;
            btn.style.background = popupBlockingEnabled ? "#e53935" : "#43a047";

            // Reattach the badge (textContent overwrite removes it)
            btn.appendChild(badge);
        };

        btn.addEventListener("click", () => {
            popupBlockingEnabled = !popupBlockingEnabled;
            localStorage.setItem(TOGGLE_KEY, !popupBlockingEnabled); 
            updateButton();
            console.log(`[TM] Popups are now ${popupBlockingEnabled ? "BLOCKED (OFF)" : "ALLOWED (ON)"}`);
        });

        updateButton();
        toggleItem.appendChild(btn);

        const ul = document.querySelector('ul.rui-icon-menu.rui-icon-menu--right.ml-auto');
        if (ul) {
            ul.insertBefore(toggleItem, ul.firstChild);
        } else {
            console.warn("[TM] Header menu not found — can't insert popup toggle.");
        }

        return badge;
    };

    const observePopups = (badge) => {
        const observer = new MutationObserver(mutations => {
            if (!popupBlockingEnabled) return;

            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType !== 1) return;

                    const el = node.closest?.("#dvOuter") || node.querySelector?.("#dvOuter");
                    if (el) {
                        el.remove();
                        popupBlockedCount++;
                        badge.textContent = popupBlockedCount;
                        badge.style.display = "inline-block";
                        console.log(`[TM] Popup #${popupBlockedCount} blocked`);
                    }
                });
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });
    };

    const overrideClosePopup = (bm, badge) => {
        const original = bm.ClosePopup;
        bm.ClosePopup = (id = "dvOuter") => {
            const el = document.getElementById(id);
            if (!el) return console.warn(`[TM] Element '${id}' not found.`);
            if (popupBlockingEnabled) {
                const parent = el.parentNode;
                if (parent?.id === "dvOuter") {
                    parent.remove();
                } else {
                    el.remove();
                }
                popupBlockedCount++;
                badge.textContent = popupBlockedCount;
                badge.style.display = "inline-block";
                console.log(`[TM] Intercepted popup #${popupBlockedCount} with id: ${id}`);
            } else {
                original?.call(bm, id);
                console.log(`[TM] Allowed popup (blocking off) for: ${id}`);
            }
        };
    };

	// Added to make sure that the script will run on Firefox
    const waitForBM = (badge) => {
        let attempts = 0;
        const maxAttempts = 100;
        const interval = setInterval(() => {
            const bm = window.BLUE_MOODLE;
            if (bm?.ClosePopup && bm?.CommonPopUp) {
                clearInterval(interval);
                overrideClosePopup(bm, badge);
                console.log("[TM] BLUE_MOODLE.ClosePopup overridden.");
            }
            if (++attempts > maxAttempts) {
                clearInterval(interval);
                console.warn("[TM] BLUE_MOODLE never loaded.");
            }
        }, 200);
    };
	
	//On load event listener
    window.addEventListener('load', () => {
        const badge = createHeaderToggleButton();
        observePopups(badge);
        waitForBM(badge);
    });
})();
