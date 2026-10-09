// =====================================================
// CIVICCONNECT - STATUS PAGE
// =====================================================


// =====================================================
// GET ELEMENTS FROM STATUS.HTML
// =====================================================

const statusLoading =
    document.querySelector("#status-loading");

const statusResult =
    document.querySelector("#status-result");

const statusError =
    document.querySelector("#status-error");

const statusValue =
    document.querySelector("#status-value");

const complaintIdElement =
    document.querySelector("#complaint-id");

const issueTypeElement =
    document.querySelector("#issue-type");

const departmentElement =
    document.querySelector("#department");

const locationElement =
    document.querySelector("#location");

const descriptionElement =
    document.querySelector("#description");


// =====================================================
// GET TIMELINE ELEMENTS
// =====================================================

const timelineSubmitted =
    document.querySelector("#timeline-submitted");

const timelineReview =
    document.querySelector("#timeline-review");

const timelineProgress =
    document.querySelector("#timeline-progress");

const timelineResolved =
    document.querySelector("#timeline-resolved");


// =====================================================
// GET COMPLAINT ID FROM URL
// =====================================================

// Expected URL:
//
// status.html?id=CC-2026-12345
//

const urlParams =
    new URLSearchParams(
        window.location.search
    );


let complaintId =
    urlParams.get("id");


// =====================================================
// CHECK COMPLAINT ID
// =====================================================

if (!complaintId) {

    showStatusError(
        "No Complaint ID was provided. Please go back to the Track Complaint page and enter your Complaint ID."
    );

} else {

    // Remove spaces
    complaintId =
        complaintId.replace(/\s+/g, "");

    // Convert to uppercase
    complaintId =
        complaintId.toUpperCase();

    // Load complaint
    loadComplaintStatus();

}


// =====================================================
// LOAD COMPLAINT STATUS
// =====================================================

async function loadComplaintStatus() {

    try {

        console.log(
            "Checking Complaint ID:",
            complaintId
        );


        // -------------------------------------------------
        // CHECK COMPLAINT ID FORMAT
        // -------------------------------------------------

        const complaintIdPattern =
            /^CC-\d{4}-\d{5}$/;


        if (
            !complaintIdPattern.test(
                complaintId
            )
        ) {

            showStatusError(
                "Invalid Complaint ID. Please enter a valid ID like CC-2026-12345."
            );

            return;
        }


        // -------------------------------------------------
        // REQUEST COMPLAINT FROM BACKEND
        // -------------------------------------------------

        const response =
            await fetch(

                `http://127.0.0.1:5000/api/complaints/${encodeURIComponent(complaintId)}`,

                {
                    method: "GET",

                    headers: {
                        "Content-Type":
                            "application/json"
                    }
                }

            );


        // -------------------------------------------------
        // CONVERT RESPONSE TO JSON
        // -------------------------------------------------

        const result =
            await response.json();


        console.log(
            "Backend response:",
            result
        );


        // -------------------------------------------------
        // CHECK IF COMPLAINT WAS FOUND
        // -------------------------------------------------

        if (
            !response.ok ||
            !result.success ||
            !result.complaint
        ) {

            showStatusError(

                result.message ||
                "Complaint not found. Please check your Complaint ID."

            );

            return;
        }


        // -------------------------------------------------
        // GET COMPLAINT
        // -------------------------------------------------

        const complaint =
            result.complaint;


        console.log(
            "Complaint found:",
            complaint
        );


        // =================================================
        // DISPLAY COMPLAINT INFORMATION
        // =================================================

        if (complaintIdElement) {

            complaintIdElement.textContent =
                complaint.complaintId || complaintId;

        }


        if (issueTypeElement) {

            issueTypeElement.textContent =
                complaint.issueType || "-";

        }


        if (departmentElement) {

            departmentElement.textContent =
                complaint.department || "-";

        }


        if (locationElement) {

            locationElement.textContent =
                complaint.location || "-";

        }


        if (descriptionElement) {

            descriptionElement.textContent =
                complaint.description || "-";

        }


        // =================================================
        // GET CURRENT STATUS
        // =================================================

        const currentStatus =
            complaint.status || "Submitted";


        // Display status

        if (statusValue) {

            statusValue.textContent =
                currentStatus;

        }


        // =================================================
        // UPDATE STATUS TIMELINE
        // =================================================

        updateStatusTimeline(
            currentStatus
        );


        // =================================================
        // HIDE LOADING
        // =================================================

        if (statusLoading) {

            statusLoading.style.display =
                "none";

        }


        // =================================================
        // SHOW RESULT
        // =================================================

        if (statusResult) {

            statusResult.style.display =
                "block";

        }


    } catch (error) {

        console.error(
            "Status Page Error:",
            error
        );


        showStatusError(

            "Unable to connect to the CivicConnect server. Please make sure the backend is running."

        );

    }

}


// =====================================================
// UPDATE STATUS TIMELINE
// =====================================================

function updateStatusTimeline(status) {

    // Normalize status

    const normalizedStatus =
        String(status)
            .trim()
            .toLowerCase();


    // -------------------------------------------------
    // REMOVE PREVIOUS CLASSES
    // -------------------------------------------------

    const timelineItems =
        document.querySelectorAll(
            ".timeline-item"
        );


    timelineItems.forEach(
        function (item) {

            item.classList.remove(
                "active",
                "completed"
            );

        }
    );


    // =================================================
    // SUBMITTED
    // =================================================

    if (
        normalizedStatus === "submitted"
    ) {

        if (timelineSubmitted) {

            timelineSubmitted.classList.add(
                "active"
            );

        }

    }


    // =================================================
    // UNDER REVIEW
    // =================================================

    else if (
        normalizedStatus === "under review" ||
        normalizedStatus === "pending"
    ) {

        if (timelineSubmitted) {

            timelineSubmitted.classList.add(
                "completed"
            );

        }


        if (timelineReview) {

            timelineReview.classList.add(
                "active"
            );

        }

    }


    // =================================================
    // IN PROGRESS
    // =================================================

    else if (
        normalizedStatus === "in progress"
    ) {

        if (timelineSubmitted) {

            timelineSubmitted.classList.add(
                "completed"
            );

        }


        if (timelineReview) {

            timelineReview.classList.add(
                "completed"
            );

        }


        if (timelineProgress) {

            timelineProgress.classList.add(
                "active"
            );

        }

    }


    // =================================================
    // RESOLVED
    // =================================================

    else if (
        normalizedStatus === "resolved"
    ) {

        if (timelineSubmitted) {

            timelineSubmitted.classList.add(
                "completed"
            );

        }


        if (timelineReview) {

            timelineReview.classList.add(
                "completed"
            );

        }


        if (timelineProgress) {

            timelineProgress.classList.add(
                "completed"
            );

        }


        if (timelineResolved) {

            timelineResolved.classList.add(
                "active"
            );

        }

    }


    // =================================================
    // DEFAULT
    // =================================================

    else {

        if (timelineSubmitted) {

            timelineSubmitted.classList.add(
                "active"
            );

        }

    }

}


// =====================================================
// SHOW ERROR
// =====================================================

function showStatusError(message) {

    // Hide loading

    if (statusLoading) {

        statusLoading.style.display =
            "none";

    }


    // Hide result

    if (statusResult) {

        statusResult.style.display =
            "none";

    }


    // Show error

    if (statusError) {

        statusError.textContent =
            message;

        statusError.style.display =
            "block";

    }

}