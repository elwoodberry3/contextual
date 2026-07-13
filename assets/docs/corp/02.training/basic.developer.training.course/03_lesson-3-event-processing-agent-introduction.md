# Lesson 3: Event Processing Agent Introduction

## Temperature Event Monitoring Agent

{% embed url="<https://www.loom.com/share/d84cd21e08d149a7bfbb71ee4f589cfa?sid=9e308241-c0d0-4de8-bead-d5389a248522>" %}

### Overview

**Objective**: Build an event-processing agent that receives the incoming temperature events and monitors temperature data for anomalies.

**Description**:

* Add a weather-alert native-object.
* Create an event-processing flow to monitor temperature data, either from manual submissions (like in Project 1) or through simulated temperature data (from an inject node). The goal is to detect temperature readings that fall outside of a set range (e.g., below 0°C or above 35°C) and create an alert object
* Create an event-processing agent using the new flow
* Add a trigger to the existing weather-report native object to send the message (as an event) to the new agent POST-INSERT.

**Terminal Objective:** Gain a basic understanding of how to create an event-to-flow agent that uses function nodes and switch nodes to process events, with the results being stored in additional native objects.

**Enabling Objectives:**

* Set up an inject node to simulate a weather-report event.
* Use a function node to detect low-temperature or high-temperature events.
* Add logic (switch node) to detect low/high temperature anomalies and create an alert native-object.
* Testing using an inject node.

**Skills:** FLOW-2, TRIGGER-1, CORE-1, CORE-3, CORE-5

### Detailed Steps

This lessson begins where Lesson 2 left off. Ensure that you have compled lesson 2 and have the agent, flow, and object-type from that lesson in your tenant before continuing.

In this lesson we are going to send the weather reports received by the HTTP agent to an Event processing agent that will monitor for anomalous temperature readings, and when found, generate a "Weather Alert" record.

#### Part 1 — Create a New Object Type

1. Create a new object-type called "weather-alert" as shown below:

```
{
  "primaryKey": "id",
  "type": "object",
  "$comment": "Schema representing a weather alert type",
  "properties": {
    "id": {
      "type": "string",
      "generate": {
        "type": "uuid",
        "format": "short"
      }
    },
    "timestamp": {
      "type": "string",
      "generate": {
        "type": "datetime"
      },
      "description": "The timestamp when the alert was created"
    },
    "type": {
      "type": "string",
      "enum": [
        "HIGH_TEMP",
        "LOW_TEMP",
        "WIND",
        "RAIN",
        "SNOW"
      ],
      "description": "The type of weather alert"
    },
    "description": {
      "type": "string",
      "minLength": 1,
      "description": "Detailed description of the weather alert"
    },
    "report": {
      "type": "object"
    }
  },
  "$commentRequired": "Optional, a list of mandatory properties for instances of this Object Type",
  "required": [
    "type",
    "description"
  ]
}
```

#### Part 2 — Create a New Flow

1. Create a new flow called "weather-monitor". Open the flow in the flow editor.
2. Add an Inject node, a Prepare Event node, and an Event Start node to the canvas as shown below.

<figure><img src="/files/Qw1zQv9wXLNh65vDbgiG" alt=""><figcaption></figcaption></figure>

4. Modify the Inject node, changing the msg.payload type to "JSON" and setting the JSON value to:

```
{
    "temperature": 25,
    "stationId": "JEFF"
}
```

5. Give the Inject node a name as well: "TEST". Save the changes to the Inject node.
6. Add a function node to the canvas and wire it in immediately after the Event Start node.
7. Double-click the function node to open the editor.
8. Add the following JavaScript code to the function node.

```javascript
// Payload will have temperature and stationId

// monitor for temperatures above 38C and below 0. Generate
// a weather alert if the temperature is outside of this range

msg.alert = false;

if (msg.payload.hasOwnProperty("temperature")) {

    if (msg.payload.temperature <= 0) {
        msg.alert = true;
        msg.alertType = "LOW_TEMP";
    } else if (msg.payload.temperature >= 38) {
        msg.alert = true;
        msg.alertType = "HIGH_TEMP";
    }
}

// important: always return msg from a function node
return msg;
```

9. Give the function node a name: "Check Temperature"
10. Click "Done" to save the changes to the function node.
11. Your flow should now look like this:

<figure><img src="/files/U0w4oVdWSs4gWEu45ONr" alt=""><figcaption></figcaption></figure>

12. Drag a Switch node onto the canvas and wire it right after the function node.
13. Double-click the Switch node to open the configuration editor.
14. Give the switch node a name: "Alert?"
15. Modify the "Property" field to check for msg.alert
16. Modify the condition below the property to "is true"
17. Add another condition and set it to "otherwise"
18. At the bottom of the window, change the dropdown from "checking all rules" to "stopping after first match".
19. Your Switch node should now look like this:

<figure><img src="/files/LSHZonpTqq8jmvXiFunQ" alt=""><figcaption></figcaption></figure>

<figure><img src="/files/XkYVhkLLq83f17NPpL33" alt=""><figcaption></figcaption></figure>

20. Drag a new Function node onto the canvas and wire it to the "is true" output of the Switch node, like this:

<figure><img src="/files/9Hzrw1Go4ewbwGvAliZ9" alt=""><figcaption></figcaption></figure>

21. Open the function node and add the following JS. Give it a name: "Prep New Alert".

```
// build the alert record

msg.newAlert = {
    type: msg.alertType,
    description: msg.alertDescription,
    report: msg.payload
}

return msg;
```

22. Drag a new Create Object node onto the canvas and wire it after the "Prep New Alert" Function node.
23. Configure it as shown below:

<figure><img src="/files/3lLqKqu2wHG1rhqE76T9" alt=""><figcaption></figcaption></figure>

23. Drag an Event End node onto the canvas and wire it after the Create Object node.
24. Connect the "Otherwise" output of the Switch node to the Event End node also.
25. Your flow should now appear as shown below.

<figure><img src="/files/I5qS2NSiUw5D7CCsY5NI" alt=""><figcaption></figcaption></figure>

26. Drag a Catch Node onto the canvas.
27. Add log-tap node and wire it right after the Catch node. Name it "Error" and configure it for "Complete Msg Object" and log-level = Error.
28. Add an Event Error node after the log-tap node.
29. Your error handling should now look like this:

<figure><img src="/files/01JUZcW73hJJq7NTM6va" alt=""><figcaption></figcaption></figure>

30. Click Save to save your flow.

#### Part 3 — Create the Agent to run your new Flow

1. Create a new agent as shown below:

<figure><img src="/files/1KiDq5kMv1ofmjU8uveA" alt=""><figcaption></figcaption></figure>

NOTE: The agent type for this agent is "Event to Flow" and NOT "HTTP to Flow".

2. Open the agent and wait for it to show "Running" in the Operations tab.
3. Navigate to Components/Object Types and open the weather-report object type.
4. Click on the "Triggers" tab and add a "Post-Insert" trigger using the "+" button.
5. Select "SendToAgent"
6. Give the trigger a name: "Send Weather Report"
7. If needed, select "Weather Monitor" as the agent to send the event to. The trigger configuration should look like this:

<figure><img src="/files/aQIUPtUr2Yo0tPiv5u27" alt=""><figcaption></figcaption></figure>

8. Save the trigger by clicking on "Create Trigger".

#### Part 4 — Testing Your New Agent

1. Go back to the browser tab where you have the Submit Weather Report form. If you don't have it open any longer, go back to the "Submit Weather Report" agent and copy the agent URL and remember to append "/form" to the URL.
2. Submit a weather report with a temperature within the range 0 < temperature < 38. For example: 25.
3. Now submit a weather report with a temperature above the high temperature threshold. For example: 40.
4. Now submit a weather report with a temperature below the log temperature threshold. For example, -5.
5. Now navigate to Records/Data/Weather Reports in the console and verify that you see all of these new reports, as shown below.

<figure><img src="/files/IZ0zKck85FexNcIKu2Gg" alt=""><figcaption></figcaption></figure>

6. Now navigate to Records/Data/Weather Alerts in the console and verify that you see two weather alerts, for the HIGH\_TEMP alert and the LOW\_TEMP alert.

<figure><img src="/files/zgp4oLwFz7rm4XOHVxOC" alt=""><figcaption></figcaption></figure>

Congratulations! You have now completed Lesson 3 of the Basic Developer Training Course. You now have an understanding of how to create Event Processing agents as well as new function nodes such as Function and Switch.
