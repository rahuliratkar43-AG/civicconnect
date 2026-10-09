// ==========================================
// CIVICCONNECT APP.JS
// COMPLAINT SUBMISSION
// ==========================================


// ==========================================
// GET REPORT FORM
// ==========================================

const form = document.querySelector(".report-form");


if (form) {

    form.addEventListener(
        "submit",
        async function (event) {

            // Stop normal form submission
            event.preventDefault();


            // ==========================================
            // GET FORM ELEMENTS
            // ==========================================

            const issueTypeInput =
                document.querySelector("#issue-type");

            const descriptionInput =
                document.querySelector("#description");

            const locationInput =
                document.querySelector("#location");

            const nameInput =
                document.querySelector("#name");

            const phoneInput =
                document.querySelector("#phone");


            // Make sure all elements exist

            if (
                !issueTypeInput ||
                !descriptionInput ||
                !locationInput ||
                !nameInput ||
                !phoneInput
            ) {

                alert(
                    "Some required form fields are missing."
                );

                return;
            }


            // ==========================================
            // GET FORM VALUES
            // ==========================================

            const issueType =
                issueTypeInput.value.trim();

            const description =
                descriptionInput.value.trim();

            const location =
                locationInput.value.trim();

            const name =
                nameInput.value.trim();

            const phone =
                phoneInput.value.trim();


            // ==========================================
            // VALIDATE REQUIRED FIELDS
            // ==========================================

            if (!issueType) {

                alert(
                    "Please select the issue type."
                );

                issueTypeInput.focus();

                return;
            }


            if (!location) {

                alert(
                    "Please enter the location."
                );

                locationInput.focus();

                return;
            }


            if (!description) {

                alert(
                    "Please enter the description."
                );

                descriptionInput.focus();

                return;
            }


            if (!name) {

                alert(
                    "Please enter your name."
                );

                nameInput.focus();

                return;
            }


            if (!phone) {

                alert(
                    "Please enter your phone number."
                );

                phoneInput.focus();

                return;
            }


            // ==========================================
            // GET MAP COORDINATES
            // ==========================================

            const latitude =
                typeof window.selectedLatitude !== "undefined"
                    ? Number(window.selectedLatitude)
                    : null;


            const longitude =
                typeof window.selectedLongitude !== "undefined"
                    ? Number(window.selectedLongitude)
                    : null;


            console.log(
                "Selected Latitude:",
                latitude
            );

            console.log(
                "Selected Longitude:",
                longitude
            );


            // ==========================================
            // CHECK MAP LOCATION
            // ==========================================

            if (
                latitude === null ||
                longitude === null ||
                !Number.isFinite(latitude) ||
                !Number.isFinite(longitude)
            ) {

                alert(
                    "Please select your complaint location on the map."
                );

                return;
            }


            // ==========================================
            // GET CURRENT USER
            // ==========================================

            let currentUser = null;


            const localUser =
                localStorage.getItem(
                    "civicConnectCurrentUser"
                );


            const sessionUser =
                sessionStorage.getItem(
                    "civicConnectCurrentUser"
                );


            const userData =
                localUser || sessionUser;


            if (userData) {

                try {

                    currentUser =
                        JSON.parse(userData);

                }

                catch (error) {

                    console.error(
                        "Error reading current user:",
                        error
                    );

                }

            }


            // ==========================================
            // CHECK LOGIN
            // ==========================================

            if (!currentUser) {

                alert(
                    "Please login before submitting a complaint."
                );

                window.location.href =
                    "login.html";

                return;
            }


            // ==========================================
            // COMPLAINT DATA
            // ==========================================

            const complaintData = {

                issueType: issueType,

                location: location,

                description: description,

                name: name,

                phone: phone,

                latitude: latitude,

                longitude: longitude,

                userEmail:
                    currentUser.email || ""

            };


            console.log(
                "================================"
            );

            console.log(
                "Sending complaint:"
            );

            console.log(
                complaintData
            );

            console.log(
                "================================"
            );


            // ==========================================
            // DISABLE SUBMIT BUTTON
            // ==========================================

            const submitButton =
                document.querySelector(
                    "#submitBtn"
                );


            if (submitButton) {

                submitButton.disabled = true;

                submitButton.textContent =
                    "Submitting...";
            }


            // ==========================================
            // SEND DATA TO BACKEND
            // ==========================================

            try {

                const response =
                    await fetch(
                        "http://127.0.0.1:5000/api/complaints",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    complaintData
                                )
                        }
                    );


                // ==========================================
                // READ BACKEND RESPONSE
                // ==========================================

                const result =
                    await response.json();


                console.log(
                    "Backend response:",
                    result
                );


                // ==========================================
                // SUCCESS
                // ==========================================

                if (
                    response.ok &&
                    result.success &&
                    result.complaintId
                ) {

                    const complaintId =
                        result.complaintId;


                    alert(
                        "Complaint submitted successfully!\n\n" +
                        "Your Complaint ID is:\n" +
                        complaintId
                    );


                    // ==========================================
                    // OPEN TRACKING PAGE
                    // ==========================================

                    window.location.href =
                        "track.html?id=" +
                        encodeURIComponent(
                            complaintId
                        );


                    return;
                }


                // ==========================================
                // BACKEND ERROR
                // ==========================================

                alert(
                    result.message ||
                    "Unable to submit complaint."
                );

            }


            // ==========================================
            // CONNECTION ERROR
            // ==========================================

            catch (error) {

                console.error(
                    "Complaint submission error:",
                    error
                );


                alert(
                    "Unable to connect to CivicConnect server.\n\n" +
                    "Make sure the backend terminal is still running."
                );

            }


            // ==========================================
            // ENABLE BUTTON AGAIN
            // ==========================================

            finally {

                if (submitButton) {

                    submitButton.disabled =
                        false;

                    submitButton.textContent =
                        "Submit Report";
                }

            }

        }
    );

}