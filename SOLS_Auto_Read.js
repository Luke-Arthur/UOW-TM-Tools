// ==UserScript==
// @name         SOLSMail Auto Mark as Read
// @namespace    https://solss.uow.edu.au/
// @version      1.4
// @description  Auto-clicks "I have read the Message" buttons on UOW SOLS page.
// @author       Gabriel
// @match        https://solss.uow.edu.au/*
// @grant        none
// ==/UserScript==

(() => {
    'use strict';

    // Exit early if the page does not contain a SOLSMail Message
    if (!document.body.innerText.includes("SOLSMail Message")) return;

    // Select all enabled "I have read the Message" buttons
    const buttons = document.querySelectorAll('input[type="submit"][value="I have read the Message"]:not(:disabled)');

    // Click each button and count how many were clicked
    const clicked = Array.from(buttons).reduce((count, btn) => {
        btn.click(); // Simulate a click on the button
        return count + 1; // Increment the count
    }, 0);

    // Notify the user how many messages were marked as read
    alert(clicked
        ? `✅ ${clicked} SOLSMail message(s) were auto-marked as read.`
        : `ℹ️ No unread SOLSMail messages to mark as read.`);
})();
