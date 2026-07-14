# Flows

### What are Flows?

Flows in Contextual are sequences of [Nodes](/documentation-and-resources/components-and-data/flows/node-reference.md), connected together to perform a task or set of tasks. Each flow represents a series of steps that a [Message Object](/documentation-and-resources/components-and-data/flows/message-object.md) goes through, starting from an input, passing through various processing nodes, and ending at an output.

### Key Components

#### Nodes

* **Input Nodes**: These nodes receive data from outside of the flow.
  * *Event Start* - a custom Contextual node that allows ingress of data that is sent to the flow by one or more [Event to Flow Agents](/documentation-and-resources/components-and-data/agents/types-of-agents/event-to-flow.md)
  * *HTTP In* - allows ingress of data that is sent to the flow by one or more [HTTP to Flow Agents](/documentation-and-resources/components-and-data/agents/types-of-agents/http-to-flow.md)
  * MQTT - The MQTT node is used for integrating with MQTT (Message Queuing Telemetry Transport) brokers. MQTT is a lightweight messaging protocol often used for IoT (Internet of Things) applications due to its low bandwidth requirements.
  * UDP - The UDP node is used for sending and receiving messages over the User Datagram Protocol (UDP), enabling communication with other devices and services that use UDP for data transmission.
  * TCP - The TCP node is used for sending and receiving messages over the Transmission Control Protocol (TCP), facilitating reliable communication between Node-RED and other devices or services that use TCP.
* **Output Nodes**: These nodes send data and receive responses with other components within your Contextual system, as well as with external systems, like databases or APIs.
  * *HTTP Response* - Sends HTTP response codes (e.g. 200, 400) to end an HTTP flow.
  * *Event End - Provides the termination for an Event flow.*
  * *Event Error - Is similar to an Event End but can be used to terminate an error catch.*
* **Processing Nodes**: These nodes manipulate, transform, and process data as it moves through the flow. Examples include function nodes for custom JavaScript code, switch nodes for conditional routing, and template nodes for data formatting.

#### Wires

Wires connect nodes together, defining the path that data takes through the flow. Data travels from the output of one node to the input of the next.

### Creating and Managing Flows

#### Building Flows

1. **Drag and Drop**: Nodes are dragged from the palette onto the workspace.
2. **Connect Nodes**: Nodes are connected by dragging wires between them.
3. **Configure Nodes**: Each node can be configured by double-clicking on it to set properties and parameters.

#### Deploying Flows

Once a flow is designed and configured, it needs to be deployed to test it locally in the Contextual Flow Editor, and to stage it for operational release within your system which is achieved by [restarting the Agent](/documentation-and-resources/components-and-data/flows/node-red-flow-editor/restart-agents-to-make-changes-active.md) associated with the Flow.

#### Organizing Flows

Flows can be organized into tabs within the editor, allowing for better management and separation of different tasks or projects.

### Conclusion

Flows in provide a powerful and intuitive way to connect and orchestrate functionality within your Contextual solution. By leveraging the drag-and-drop interface and the extensive library of nodes that are certified to work in the unique Contextual environment, you can quickly build and deploy complex workflows with minimal coding.
