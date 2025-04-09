// ==UserScript==
// @name         UOW SOLS WAM Calculator
// @namespace    https://solss.uow.edu.au/
// @version      1.4
// @description  Calculates and displays WAM with grade and clean layout on UOW SOLS.
// @author       Gabriel
// @match        https://solss.uow.edu.au/sid/sols_enrolment_record_student*
// @grant        none
// ==/UserScript==

(() => {
    'use strict';

    // Helper function to check if a value is numeric
    const isNumeric = val => !isNaN(val) && isFinite(val);

    // Helper function to get grade from WAM value
    const getGrade = wam => {
        if (wam >= 85) return "High Distinction";
        if (wam >= 75) return "Distinction";
        if (wam >= 65) return "Credit";
        if (wam >= 50) return "Pass";
        return "Fail";
    };

    // Function to generate and return a WAM display element (as a div)
    const createWAMDisplay = (wam, grade) => {
        const div = document.createElement("div");
        div.innerHTML = `
            <div style="margin-bottom: 20px;">
                <strong>Calculated Weighted Average Mark (WAM)</strong>
                <table class="table table-striped table-bordered" style="margin-top: 10px;">
                    <thead class="cf">
                        <tr align="center">
                            <th>WAM</th>
                            <th>Grade</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr align="center">
                            <td>${wam}</td>
                            <td>${grade}</td>
                        </tr>
                    </tbody>
                </table>
                <hr class="divider" style="width: 80%;">
            </div>`;
        return div;
    };

    // Wait until the page is fully loaded
    window.addEventListener('load', () => {
        // Select the main table that contains enrolment records
        const table = document.querySelector('table.table-striped');
        if (!table) return; // Exit if the table isn't found

        // Initialize total marks and credit points
        let totalMarks = 0, totalCP = 0;

        // Loop through each row in the table body
        table.querySelectorAll('tbody tr').forEach(row => {
            const cells = row.querySelectorAll('td');
            const cp = parseInt(cells[4]?.textContent.trim()); // Credit Points column
            const mark = parseFloat(cells[5]?.textContent.trim()); // Mark column

            // Only include valid numeric data
            if (isNumeric(cp) && isNumeric(mark)) {
                totalMarks += mark * cp;
                totalCP += cp;
            }
        });

        // Prevent division by zero if no valid credit points found
        if (!totalCP) return;

        // Calculate WAM
        const wam = (totalMarks / totalCP).toFixed(2);

        // Determine grade based on WAM
        const grade = getGrade(wam);

        // Create and display the WAM and grade UI
        const wamDisplay = createWAMDisplay(wam, grade);

        // Insert the WAM display above the original table
        table.parentElement.insertBefore(wamDisplay, table);
    });
})();
