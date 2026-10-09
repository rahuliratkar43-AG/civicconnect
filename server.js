const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();

const PORT = 5000;


// ==========================================
// MIDDLEWARE
// ==========================================

app.use(express.json());


// Allow frontend to communicate with backend
app.use((req, res, next) => {

    res.header(
        "Access-Control-Allow-Origin",
        "*"
    );

    res.header(
        "Access-Control-Allow-Headers",
        "Content-Type"
    );

    res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, OPTIONS"
    );

    // Handle browser preflight requests
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }

    next();
});


// ==========================================
// PERMANENT COMPLAINT STORAGE
// ==========================================

const DATA_FILE = path.join(
    __dirname,
    "complaints.json"
);

let complaints = [];


// ==========================================
// LOAD EXISTING COMPLAINTS
// ==========================================

if (fs.existsSync(DATA_FILE)) {

    try {

        const data = fs.readFileSync(
            DATA_FILE,
            "utf8"
        );

        complaints =
            data.trim()
                ? JSON.parse(data)
                : [];

        console.log(
            `${complaints.length} complaint(s) loaded from storage.`
        );

    } catch (error) {

        console.error(
            "Error loading complaints.json:",
            error
        );

        complaints = [];
    }

} else {

    fs.writeFileSync(
        DATA_FILE,
        JSON.stringify([], null, 2),
        "utf8"
    );

    console.log(
        "complaints.json created."
    );
}


// ==========================================
// HOME
// ==========================================

app.get("/", (req, res) => {

    res.json({

        success: true,

        message:
            "CivicConnect Backend is Running!"

    });

});


// ==========================================
// TEST API
// ==========================================

app.get("/api/test", (req, res) => {

    res.json({

        success: true,

        message:
            "CivicConnect API is working!"

    });

});


// ==========================================
// GET ALL COMPLAINTS
// ==========================================

app.get("/api/complaints", (req, res) => {

    res.status(200).json({

        success: true,

        complaints: complaints

    });

});


// ==========================================
// SUBMIT COMPLAINT
// ==========================================

app.post("/api/complaints", (req, res) => {

    const {
        userEmail,
        issueType,
        location,
        description,
        name,
        phone,
        latitude,
        longitude
    } = req.body;


    // ==========================================
    // CHECK BASIC REQUIRED FIELDS
    // ==========================================

    if (
        !userEmail ||
        !issueType ||
        !location ||
        !description ||
        !name ||
        !phone
    ) {

        return res.status(400).json({

            success: false,

            message:
                "Please fill all required fields."

        });

    }


    // ==========================================
    // CHECK MAP LOCATION
    // ==========================================

    if (
        latitude === undefined ||
        latitude === null ||
        latitude === "" ||
        longitude === undefined ||
        longitude === null ||
        longitude === ""
    ) {

        return res.status(400).json({

            success: false,

            message:
                "Please select a location on the map."

        });

    }


    // ==========================================
    // CONVERT COORDINATES TO NUMBERS
    // ==========================================

    const latitudeNumber =
        Number(latitude);

    const longitudeNumber =
        Number(longitude);


    // ==========================================
    // CHECK COORDINATES ARE VALID
    // ==========================================

    if (
        !Number.isFinite(latitudeNumber) ||
        !Number.isFinite(longitudeNumber)
    ) {

        return res.status(400).json({

            success: false,

            message:
                "Invalid map coordinates."

        });

    }


    // ==========================================
    // GENERATE UNIQUE COMPLAINT ID
    // ==========================================

    let complaintId;

    do {

        complaintId =
            "CC-" +
            new Date().getFullYear() +
            "-" +
            Math.floor(
                10000 + Math.random() * 90000
            );

    } while (

        complaints.some(
            item =>
                item.complaintId === complaintId
        )

    );


    // ==========================================
    // CREATE COMPLAINT OBJECT
    // ==========================================

    const complaint = {

        complaintId: complaintId,

        userEmail: userEmail,

        issueType: issueType,

        location: location,

        latitude: latitudeNumber,

        longitude: longitudeNumber,

        description: description,

        name: name,

        phone: phone,

        status: "Submitted",

        department:
            getDepartment(issueType),

        createdAt:
            new Date().toISOString()

    };


    // ==========================================
    // SAVE COMPLAINT IN MEMORY
    // ==========================================

    complaints.push(complaint);


    // ==========================================
    // SAVE COMPLAINT TO complaints.json
    // ==========================================

    try {

        fs.writeFileSync(

            DATA_FILE,

            JSON.stringify(
                complaints,
                null,
                2
            ),

            "utf8"

        );

        console.log(
            "Complaint saved successfully."
        );

        console.log(
            "Saved Complaint ID:",
            complaint.complaintId
        );

        console.log(
            "User Email:",
            complaint.userEmail
        );

        console.log(
            "Latitude:",
            complaint.latitude
        );

        console.log(
            "Longitude:",
            complaint.longitude
        );

        console.log(
            "Total complaints:",
            complaints.length
        );

    } catch (error) {

        console.error(
            "Error saving complaint:",
            error
        );

        // Remove from memory if file save failed
        complaints.pop();

        return res.status(500).json({

            success: false,

            message:
                "Complaint could not be saved."

        });

    }


    // ==========================================
    // TERMINAL LOG
    // ==========================================

    console.log(
        `New complaint submitted: ${complaintId}`
    );

    console.log(
        `Location: ${latitudeNumber}, ${longitudeNumber}`
    );


    // ==========================================
    // SEND RESPONSE TO FRONTEND
    // ==========================================

    res.status(201).json({

        success: true,

        message:
            "Complaint submitted successfully.",

        complaintId:
            complaintId,

        complaint:
            complaint

    });

});


// ==========================================
// TRACK COMPLAINT
// ==========================================

app.get(
    "/api/complaints/:id",
    (req, res) => {

        const complaintId =
            req.params.id
                .trim()
                .toUpperCase();


        console.log(
            `Tracking complaint: ${complaintId}`
        );


        // ==========================================
        // FIND COMPLAINT
        // ==========================================

        const complaint =
            complaints.find(

                item =>

                    item.complaintId &&
                    item.complaintId
                        .toUpperCase() ===
                    complaintId

            );


        // ==========================================
        // COMPLAINT NOT FOUND
        // ==========================================

        if (!complaint) {

            return res.status(404).json({

                success: false,

                message:
                    "Complaint not found. Please check your complaint ID."

            });

        }


        // ==========================================
        // COMPLAINT FOUND
        // ==========================================

        res.status(200).json({

            success: true,

            message:
                "Complaint found successfully.",

            complaint:
                complaint

        });

    }
);


// ==========================================
// DEPARTMENT ROUTING
// ==========================================

function getDepartment(issueType) {

    switch (issueType) {

        case "pothole":

            return "Road Department";


        case "garbage":

            return "Waste Management Department";


        case "water":

            return "Water Supply Department";


        case "streetlight":

            return "Electrical Department";


        case "drainage":

            return "Drainage Department";


        default:

            return "General Department";

    }

}


// ==========================================
// START SERVER
// ==========================================

const server =
    app.listen(
        PORT,
        "127.0.0.1",
        () => {

            console.log(
                "======================================"
            );

            console.log(
                "CivicConnect Backend is RUNNING"
            );

            console.log(
                `Server: http://127.0.0.1:${PORT}`
            );

            console.log(
                `Storage: ${DATA_FILE}`
            );

            console.log(
                "======================================"
            );

        }
    );


server.on(
    "error",
    (error) => {

        console.error(
            "SERVER ERROR:",
            error
        );

    }
);


server.on(
    "close",
    () => {

        console.log(
            "SERVER CLOSED"
        );

    }
);