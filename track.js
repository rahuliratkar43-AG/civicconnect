// =====================================================
// CIVICCONNECT - TRACK COMPLAINT
// =====================================================

console.log("CivicConnect: track.js loaded successfully.");


// =====================================================
// GET HTML ELEMENTS
// =====================================================

const trackForm = document.getElementById("track-form");

const trackError = document.getElementById("track-error");

const complaintIdInput =
    document.getElementById("complaint-id");


// =====================================================
// CHECK REQUIRED ELEMENTS
// =====================================================

if (!trackForm) {

    console.error(
        "CivicConnect Error: #track-form was not found."
    );

}

if (!trackError) {

    console.error(
        "CivicConnect Error: #track-error was not found."
    );

}

if (!complaintIdInput) {

    console.error(
        "CivicConnect Error: #complaint-id was not found."
    );

}


// =====================================================
// FORM SUBMISSION
// =====================================================

if (trackForm) {

    trackForm.addEventListener(
        "submit",
        function (event) {

            // VERY IMPORTANT:
            // Prevent the browser from reloading the page
            event.preventDefault();

            console.log(
                "CivicConnect: Track Complaint button clicked."
            );

            trackComplaint();

        }
    );

}


// =====================================================
// TRACK COMPLAINT FUNCTION
// =====================================================

async function trackComplaint() {

    // -------------------------------------------------
    // Check input element
    // -------------------------------------------------

    if (!complaintIdInput) {

        console.error(
            "CivicConnect Error: Complaint ID input not found."
        );

        return;

    }


    // -------------------------------------------------
    // Get complaint ID
    // -------------------------------------------------

    let complaintId =
        complaintIdInput.value.trim();


    console.log(
        "Entered Complaint ID:",
        complaintId
    );


    // -------------------------------------------------
    // Hide previous error
    // -------------------------------------------------

    if (trackError) {

        trackError.style.display =
            "none";

    }


    // -------------------------------------------------
    // Check empty input
    // -------------------------------------------------

    if (complaintId === "") {

        showError(
            "Please enter your complaint ID."
        );

        complaintIdInput.focus();

        return;

    }


    // -------------------------------------------------
    // Remove spaces
    // -------------------------------------------------

    complaintId =
        complaintId.replace(/\s+/g, "");


    // -------------------------------------------------
    // Convert to uppercase
    // -------------------------------------------------

    complaintId =
        complaintId.toUpperCase();


    // -------------------------------------------------
    // Put cleaned ID back into input
    // -------------------------------------------------

    complaintIdInput.value =
        complaintId;


    // -------------------------------------------------
    // Check complaint ID format
    // -------------------------------------------------

    const complaintIdPattern =
        /^CC-\d{4}-\d{5}$/;


    if (
        !complaintIdPattern.test(
            complaintId
        )
    ) {

        showError(
            "Invalid complaint ID. Please enter an ID like CC-2026-12345."
        );

        complaintIdInput.focus();

        return;

    }


    // =================================================
    // GET TRACK BUTTON
    // =================================================

    const trackButton =
        trackForm.querySelector(
            ".track-submit-btn"
        );


    try {

        // -------------------------------------------------
        // Disable button
        // -------------------------------------------------

        if (trackButton) {

            trackButton.disabled =
                true;

            trackButton.innerHTML =
                "Checking...";

        }


        // -------------------------------------------------
        // Show console message
        // -------------------------------------------------

        console.log(
            "CivicConnect: Checking complaint with backend..."
        );


        console.log(
            "Request URL:",
            `http://127.0.0.1:5000/api/complaints/${encodeURIComponent(complaintId)}`
        );


        // =================================================
        // CONNECT TO BACKEND
        // =================================================

        const response =
            await fetch(
                `http://127.0.0.1:5000/api/complaints/${encodeURIComponent(complaintId)}`,
                {
                    method: "GET"
                }
            );


        // -------------------------------------------------
        // Backend response
        // -------------------------------------------------

        console.log(
            "Backend HTTP status:",
            response.status
        );


        // -------------------------------------------------
        // Convert response to JSON
        // -------------------------------------------------

        const result =
            await response.json();


        console.log(
            "Backend response:",
            result
        );


        // =================================================
        // CHECK WHETHER COMPLAINT EXISTS
        // =================================================

        if (
            !response.ok ||
            !result.success ||
            !result.complaint
        ) {

            console.log(
                "CivicConnect: Complaint was not found."
            );


            showError(
                result.message ||
                "Complaint not found. Please check your complaint ID."
            );


            return;

        }


        // =================================================
        // COMPLAINT FOUND
        // =================================================

        const complaint =
            result.complaint;


        console.log(
            "CivicConnect: Complaint found.",
            complaint
        );


        // -------------------------------------------------
        // Get confirmed complaint ID
        // -------------------------------------------------

        const confirmedComplaintId =
            complaint.complaintId ||
            complaintId;


        console.log(
            "Confirmed Complaint ID:",
            confirmedComplaintId
        );


        // =================================================
        // OPEN STATUS.HTML
        // =================================================

        const statusURL =
            `./status.html?id=${encodeURIComponent(confirmedComplaintId)}`;


        console.log(
            "CivicConnect: Opening status page:",
            statusURL
        );


        // Redirect to status.html
        window.location.href =
            statusURL;


    } catch (error) {

        // =================================================
        // CONNECTION ERROR
        // =================================================

        console.error(
            "CivicConnect Tracking Error:",
            error
        );


        showError(
            "Unable to connect to the CivicConnect server. Please make sure the backend is running."
        );


    } finally {

        // -------------------------------------------------
        // Enable button again
        // -------------------------------------------------

        if (trackButton) {

            trackButton.disabled =
                false;

            trackButton.innerHTML =
                'Track Complaint <span>→</span>';

        }

    }

}


// =====================================================
// SHOW ERROR
// =====================================================

function showError(message) {

    console.log(
        "CivicConnect Error Message:",
        message
    );


    if (!trackError) {

        return;

    }


    trackError.textContent =
        message;


    trackError.style.display =
        "block";


    // Scroll to error
    setTimeout(function () {

        trackError.scrollIntoView({

            behavior: "smooth",

            block: "center"

        });

    }, 100);

}