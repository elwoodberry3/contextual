![Hero](../../../../imgs/pg-header.jpg)
# Lesson 4: Basic REST APIs

## Full Weather Reporting API

### Overview

In this lesson we build on the previous lessons and enhance our Weather Reporting System by adding a full RESTful API to our existing flow that allows the client application to Create (POST), Read (GET), Update (PUT/PATCH), and Delete (DELETE).

This is a common pattern in HTTP flows that provide a custom data access layer for a web or mobile application.

#### Objective

Learn about how to implement the various REST operations using a combination of HTTP-IN nodes and Object nodes.

**Description**:

* Enhance the incoming weather report to support additional fields including humidity, wind, wind direction, and UV index.
* Update the web form to allow the submission of these additional properties
* Add new endpoints to the flow to support a /weather-report API with GET, POST, PUT, PATCH, and DELETE.
* Test the new web app with the new endpoints.

**Terminal Objective:** Possess a solid understanding of how to create an HTTP-Flow that exposes BASIC REST API endpoints (GET, POST, PUT, PATCH, DELETE) and then uses the various Native Object nodes to implement those operations.

**Enabling Objectives:**

* Learn to use an HTTP-IN POST node combined with NO CREATE
* Learn to use an HTTP-IN PUT node combined with NO PUT
* Learn to use an HTTP-IN PATCH node combined with function node to build patch payload and NO PATCH
* Learn to use an HTTP-IN GET node combined with NO GET
* Learn to use an HTTP-IN DELETE node combined with NO DELETE

**New Skills:** NO-3, NO-4, NO-5, NO-6

### Detailed Steps

#### Add New Properties to Weather Report Object-Type

1. Edit the weather-report object type and add the following properties:
   * Humidity
   * Wind Speed
   * Wind direction
   * UV index
2. Open the submit-weather-report flow and modify the HTML form using the following HTML.

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Weather Report</title>
</head>

<body>
    <h1>Submit Weather Report</h1>
    <form id="weatherForm">
        <label for="temperature">Temperature (°C):</label>
        <input type="number" id="temperature" name="temperature" required><br><br>

        <label for="humidity">Humidity (%):</label>
        <input type="number" id="humidity" name="humidity" required><br><br>

        <label for="windSpeed">Wind Speed (m/s):</label>
        <input type="number" id="windSpeed" name="windSpeed" required><br><br>

        <label for="windDirection">Wind Direction (degrees):</label>
        <input type="number" id="windDirection" name="windDirection" required><br><br>

        <label for="UVIndex">UV Index:</label>
        <input type="number" id="UVIndex" name="UVIndex" required><br><br>

        <label for="stationId">Station ID:</label>
        <input type="text" id="stationId" name="stationId" required><br><br>

        <button type="submit" id="submitButton">CREATE</button>
    </form>

    <h2>Weather Report Details</h2>
    <p id="weatherReportDetails"></p>

    <script>
        let currentId = null;

        document.getElementById('weatherForm').addEventListener('submit', async function(event) {
            event.preventDefault();

            const temperature = parseFloat(document.getElementById('temperature').value);
            const humidity = parseFloat(document.getElementById('humidity').value);
            const windSpeed = parseFloat(document.getElementById('windSpeed').value);
            const windDirection = parseFloat(document.getElementById('windDirection').value);
            const UVIndex = parseFloat(document.getElementById('UVIndex').value);
            const stationId = document.getElementById('stationId').value;

            const data = {
                temperature,
                humidity,
                windSpeed,
                windDirection,
                UVIndex,
                stationId
            };

            try {
                const url = currentId ? `/weather-report/${currentId}` : '/weather-report';
                const method = currentId ? 'PUT' : 'POST';

                const response = await fetch(url, {
                    method,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    const result = await response.json();
                    currentId = result.id;

                    // Change button to 'UPDATE' if an existing report is being updated
                    document.getElementById('submitButton').textContent = 'UPDATE';

                    document.getElementById('weatherReportDetails').innerHTML = `
                        <strong>ID:</strong> ${result.id} <br>
                        <strong>Temperature:</strong> ${result.temperature} °C <button onclick="updateField('temperature')">Update</button><br>
                        <strong>Humidity:</strong> ${result.humidity} % <button onclick="updateField('humidity')">Update</button><br>
                        <strong>Wind Speed:</strong> ${result.windSpeed} m/s <button onclick="updateField('windSpeed')">Update</button><br>
                        <strong>Wind Direction:</strong> ${result.windDirection} ° <button onclick="updateField('windDirection')">Update</button><br>
                        <strong>UV Index:</strong> ${result.UVIndex} <button onclick="updateField('UVIndex')">Update</button><br>
                        <strong>Station ID:</strong> ${result.stationId} <button onclick="updateField('stationId')">Update</button><br><br>
                        <button onclick="deleteRecord()">Delete</button>
                    `;
                } else {
                    document.getElementById('weatherReportDetails').textContent = "Error submitting report.";
                }
            } catch (error) {
                document.getElementById('weatherReportDetails').textContent = "Network error.";
            }
        });

        function updateField(field) {
            const newValue = prompt(`Enter new value for ${field}:`);
            if (newValue !== null) {
                const data = {};
                data[field] = field === 'stationId' ? newValue : parseFloat(newValue);

                fetch(`/weather-report/${currentId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                }).then(response => {
                    if (response.ok) {
                        return response.json();
                    } else {
                        throw new Error('Failed to update field');
                    }
                }).then(result => {
                    document.getElementById('weatherReportDetails').innerHTML = `
                        <strong>ID:</strong> ${result.id} <br>
                        <strong>Temperature:</strong> ${result.temperature} °C <button onclick="updateField('temperature')">Update</button><br>
                        <strong>Humidity:</strong> ${result.humidity} % <button onclick="updateField('humidity')">Update</button><br>
                        <strong>Wind Speed:</strong> ${result.windSpeed} m/s <button onclick="updateField('windSpeed')">Update</button><br>
                        <strong>Wind Direction:</strong> ${result.windDirection} ° <button onclick="updateField('windDirection')">Update</button><br>
                        <strong>UV Index:</strong> ${result.UVIndex} <button onclick="updateField('UVIndex')">Update</button><br>
                        <strong>Station ID:</strong> ${result.stationId} <button onclick="updateField('stationId')">Update</button><br><br>
                        <button onclick="deleteRecord()">Delete</button>
                    `;
                }).catch(error => {
                    alert("Error updating field: " + error.message);
                });
            }
        }

        function deleteRecord() {
            fetch(`/weather-report/${currentId}`, {
                method: 'DELETE'
            }).then(response => {
                if (response.ok) {
                    document.getElementById('weatherReportDetails').textContent = "Weather report deleted.";
                    currentId = null;
                    // Change button back to 'CREATE' after deletion
                    document.getElementById('submitButton').textContent = 'CREATE';
                } else {
                    alert("Error deleting report.");
                }
            }).catch(error => {
                alert("Network error.");
            });
        }
    </script>
</body>

</html>
```

#### Add a Full REST API

The steps above satify the need for a POST node to create a new record. Now let's add the additional nodes to provide for update and delete capabilities to give our flow a full REST API.

1. First, add a HTTP-IN POST node with a path of /weather-report and wire it in parallel with your existing /submit node so that it does the same thing.
2. Now add an HTTP-IN node with a verb=GET and a path=/weather-report/:reportId

> > * Now add a function node with the following JS

```
// Get the reportId param from the path

msg.reportId = msg.req.params["reportId"];

return msg;
```

> > * Now add a GET Object node and configure it's type for "weather-report" and it's object id for msg.reportId

3. Now add an HTTP-IN node with a verb=PUT and a path=/weather-report

> > * Now add a function node with the following JS

```javascript

msg.reportId = msg.req.params["reportId"];

if (!msg.payload.hasOwnProperty("id")) {
    msg.payload.id = msg.reportId;
}

delete msg.payload._metaData;

return msg;
```

> > * Now add a PUT Object node and configure it's type for "weather-report" and it's object id for msg.reportId, and input as msg.payload

4. Now add an HTTP-IN node with a verb=PATCH and a path=/weather-report

> > * Now add a function node with the following JS

```javascript

msg.reportId = msg.req.params["reportId"];
msg.patchArray = [];

// Iterate over each property in the payload
for (let key in msg.payload) {
    if (!msg.payload.hasOwnProperty(key)) continue;

    // Check if the key is an allowed property
    switch (key) {
        case "temperature":
        case "humidity":
        case "windSpeed":
        case "windDirection":
        case "UVIndex":
            msg.patchArray.push({
                op: "set",
                path: "/" + key,
                value: msg.payload[key]
            });
            break;
        default:
            throw new Error("Invalid property (" + key + ") specified.");
    }
}

// Set the patchRequest if there are patches to apply
msg.payload = msg.patchArray.length > 0 ? msg.patchArray : [];

return msg;

```

> > * Now add a SWITCH node with two conditions:
> >   * msg.payload: is not empty
> >   * otherwise
> > * Dont forget to select "stopping after first match" at the bottom of the node configuration.
> > * Now add a PATCH Object node and configure it's type for "weather-report" and it's object id for msg.reportId, and input as msg.payload

5. Your complete flow should now look like this:

<figure><img src="/files/C2LcXOJ7ayYY8oQSSZ0a" alt=""><figcaption></figcaption></figure>

6. Push SAVE to save the changes and then restart the agent.

#### Testing in the Revised Web App

#### Create Weather Summary Object-Type

1. Now create a new object type and call it "weather-summary". This will be the object type that is used to store hourly weather summaries.
2. Give it the following properties:
   * date
   * hour
   * avgTemperature
   * minTemperature
   * maxTemperature
   * avgHumidity
   * minHumidity
   * maxHumidity
   * avgWindSpeed
   * minWindSpeed
   * maxWindSpeed
   * reports
3. Make sure it has an auto-generated 'id' field as the primary key
4. Save the new object type

#### Create a New Weather Summarization Flow

This new flow will receive the incoming weather report using a trigger. It will then GET the existing weather summary for the current hour (if there is one). Using the report and the existing summary, it will calculate the updated values for the report and then PATCH the report with the modified values. It will also add the report to the reports array on the summary record.

1. Create a new flow called "weather-summarization"
2. Add the Inject, Prepare Event, and Start Event nodes
3. Add a
