# Using Agents in Flows

While agents are the container for the execution of a flow, a flow can also send messages/events to another agent for processing.

This is done by using the "Send To Agent" node in a flow.

<figure><img src="/files/T7JsnWuZQUGw69X0nUBK" alt="" width="176"><figcaption></figcaption></figure>

The send to agent node can be found in the "request" category in the palette in the flow editor.

Using this node allows a flow to effectively route messages to different agents based on data type as shown in the flow below.

<figure><img src="/files/mFP6ha6BJnwAwU1XAVxX" alt=""><figcaption></figcaption></figure>

The Send To Agent node is very easy to use. Simply select the agent from the list "Agent Id" property and provide the optional key and required payload properties.

<figure><img src="/files/OEtHI80QPANe8myWG0CA" alt=""><figcaption></figcaption></figure>
