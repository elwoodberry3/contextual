![Hero](../../../../imgs/pg-header.jpg)
# Lesson 2: Logging and Error Handling Basics

## Logging Basics for Weather Monitoring with Logtap and CATCH Nodes

{% embed url="<https://www.loom.com/share/23a5d4df55b84e1c989d9762d58c5fa3?sid=7aa07e37-5e9b-4993-9413-1d7aa76ed299>" %}

### Overview

**Prerequisites:** This lesson assumes that you completed [Lesson 1: HTTP Agent Introduction](/documentation-and-resources/training/basic-developer-training-course/lesson-1-http-agent-introduction.md)

You will need the components (object-type, flow, and agent) from that lesson to complete Lesson 2.

**Objective**: Implement logging for weather data submissions using the logtap nodes and introduce error handling with the CATCH node.

**Description**: This project builds on the flow from Project 1 by adding logtap nodes for logging at various levels (debug, info, warn, error). The logtap node is used to monitor weather data submissions and track important events. In case of an error (e.g., invalid data), the CATCH node will capture the error and log it at the "error" level. Students will also learn how to view the logs from a running agent.

**Terminal Objective:** Understand how to debug agent-deployed flows and handle errors.\
\
**Enabling Objectives:**

* Introduce the logtap node and explain how to log at various levels (debug, info, warn, error) in a synchronous manner.
* Add logtap nodes at key points in the flow to log data submissions and important events like threshold breaches in weather monitoring.
* Demonstrate how to use the CATCH node to capture errors (e.g., invalid weather data) and log those at the error level using the logtap node.
* View the logs from a running agent.

**Skills:** LOG-1, LOG-2, LOG-3, ERROR-2, ERROR-3

By using logtap nodes and introducing error handling with the CATCH node, this project will help students understand how to monitor agent-deployed flows, handle different log levels, and deal with errors in a structured way.

### Detailed Steps

#### Part 1 — Adding Logging to your Flows

1. Login to your Contextual tenant. If you completed Lesson #1, then you will have the object-type, flow, and agent definitions from that lesson to use in this lesson.
2. Navigate to Components/Flows and open the flow editor for the "submit-weather-report" flow.
3. Locate the log-tap node in the palette.
4. Drag the log-tap node onto the canvas and onto the wire in between the HTTP-IN node (for GET /form) and the template node. If there isn't enough room for the log-tap node, drag the nodes farther apart to make room.
5. Now double-click the log-tap node to open the configuration editor.
   1. Add a name: "GET /flow"
   2. Click on "msg." and select "compelte msg object"
   3. Push "Done" to save your changes
6. Insert additional log-tap nodes in between the other nodes in the flow. You will end up with four log-tap nodes looking something like this:

<figure><img src="/files/W5exnNmgQAeCY9ssX8Ar" alt=""><figcaption></figcaption></figure>

#### Part 2 — Debugging with Inject Nodes

There are two ways to see the outputs from your log-tap nodes. The first is in the flow editor itself while the second is in the log-viewer in the console.

In order to see log outputs in the flow editor however we need to actually execute the flow. We do that by using an "inject" node.

1. Find the inject node in the palette under the "common" group and drag it onto the canvas above the HTTP-IN GET node.
2. Double-click the inject node and open the configuration editor. Give the node a name such as "TEST".
3. Now wire the Inject node to the log-tap node as shown below:

<figure><img src="/files/VXXH2ehqiTH6v52Ltkq4" alt=""><figcaption></figcaption></figure>

10. Push "Save" in the top-right corner of the editor to save all of your changes.
11. Now you are ready to test. On the right side of editor you will find various panes that provide different functions.
12. Click on the little "Bug" button on the toolbar to select the debug pane.

<figure><img src="/files/rAPCpYJkyKkiAFDvrd6e" alt=""><figcaption></figcaption></figure>

13. Now click on the litte button on the left side of the Inject node. This will "inject" the test payload into the flow.

<figure><img src="/files/gm8g7pDdZjHaTxK4Ncmv" alt=""><figcaption></figcaption></figure>

14. You should now see the debug output in the Debug pane. There will be a top-level message from each of the two log-tap nodes. You can expand the messages by clicking the little triangle next to each message.

<figure><img src="/files/o3XgJ5sYhtMkqatZTHLO" alt=""><figcaption></figcaption></figure>

15. Play around with the log messages and see what is in each one. The first one should show you the test payload from the inject node, while the second one should show you the HTML from the template node.

#### Part 3 — Handling Errors with Catch Nodes

The next step is to add a Catch Node to handle errors. The simplest form of a catch node, which is a Catch ALL, is what we will cover in this lesson.

1. Find the Catch Node (in the Common group) in the palette and drag it onto the canvas.
2. Now drag a log-tap Node onto the canvas and place it next to the Catch Node. Wire the catch node to the log-tap node.
3. Set the "Log Level" for the log-tap node to "Error".
4. Now drag an HTTP Response Node to the canvas and place it to the right of the log-tap node. Wire the log-tap node to the HTTP Response node.
5. Double-click the HTTP Response node to open the configuration editor.
6. Set the name of the node to "SERVER ERROR"
7. Set the status code to 500.
8. Click Done to save your changes to the node.

You should now have a new set of nodes in your flow that look something like this:

<figure><img src="/files/rOy36qM8RHX8ClrVRGCm" alt=""><figcaption></figcaption></figure>

8. Click Save (upper right) to save changes to the flow.

#### Part 4 — Updating the Object Type with Validation Rules

In order to be able to test the Catch node, we need to be able to force an error to occur in the flow. In order to do this, we will first update the object-type to add validation rules on the 'temperature' property.

Navigate to Components/Object Types and click on weather-report to open that type. Click on the "Data Schema" tab to edit the schema.

The modify the schema for the temperature attribute as shown below.

<figure><img src="/files/MU1Ja04em4stIaqqxa4Z" alt=""><figcaption></figcaption></figure>

With the minimum and maximum values specified on that field, we will be able to force an error to occur simply by entering a value outside of the valid range.

#### Part 5 — Viewing Logs in the Debug Pane

1. Drag a new inject node into the flow above your "Submit Form" (/POST) node.
2. Double-click the Inject node to open the configuration editor.
3. Where it says "timestamp", click on that drop-down and select "JSON".
4. Now click the "..." button next to the "{}"

<figure><img src="/files/menrOvG8Kl2gSlHEcCKB" alt=""><figcaption></figcaption></figure>

5. In the JSON editor window that opens, create a test JSON weather report with an invalid value.

<pre><code><strong>{
</strong>    "temperature": 101,
    "stationId": "JEFF"
}
</code></pre>

6. Click "Done" to save your changes in the editor.
7. Give the inject node a name such as "INVALID".
8. Click "Done" a second time to save the changes to the Inject node.

<figure><img src="/files/TWbmUzzR7JGrMHxt9sDQ" alt=""><figcaption></figcaption></figure>

2. Save the flow.
3. Inject the test message using the "INVALID" inject node button.
4. View the output in the debug pane.
5. You will now see output from the "Error" log-tap node created earlier showing the validation error:

<figure><img src="/files/T4iYapUv5EeX8dLD1Zno" alt=""><figcaption></figcaption></figure>

#### Part 6 — Restarting Your Agent with the New Flow

1. Go back to the Console and navigate to Components/Agents
2. Open the "Submit Weather Report" agent
3. You should see the following under the details section:

<figure><img src="/files/DERwRKTThn1ljyDl7h9v" alt=""><figcaption></figcaption></figure>

1. Click "Update to Version X". This will update the version of the flow currently used and prompt you to restart the agent. Click "RESTART NOW" when prompted.
2. Use the Operations tab to check on the instance status. Wait for the agent to return to the "Running" state before continuing.

#### Part 7 — Using the Web Form to Test

1. Go back to the Definitions tab for the agent and copy the "Agent URL" to the clipboard
2. Open a browser and paste in the URL. Add "/form" to the end of the URL and hit enter.
3. You should once again see the Weather Report form.
4. Submit a valid weather report with 25 degrees and a station ID.
5. Submit an invalid weather report with 101 for the temperature and a station ID.

#### Part 8 — Viewing Logs in the Console

1. Now go back to the console.
2. Open the agent and go to the "logs" tab.
3. You will see something like this:

<figure><img src="/files/wnI1jz5zlYcq6rwfqj9X" alt=""><figcaption></figcaption></figure>

4. Notice that you have only one flow log from the two tests that. you did above in [#part-7-using-the-web-form-to-test](#part-7-using-the-web-form-to-test "mention"). That is because Log levels below "Warn" are not active when the flow is running within an agent. You can see those log outputs in the editor, but they won't appear in the agent logs. The 'flow' log that you do see is the one from the error condition that you created by submitting an invalid temperature using the web form.
5. Click on the 'id' next to the flow log and open the log.
6. You will see the "Error" output from your log-tap node. You can open the second-level "message" object to see the details.

<figure><img src="/files/64z8ie2VVMg6ekihtTLc" alt=""><figcaption></figcaption></figure>

Congratulations! You have now completed Lesson 2. You now have a good understanding of logging and error handling in Contextual flows, and you know how to view those log messages in both the editor and in the agent log viewer.
