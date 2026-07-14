# Agents

**What are Agents?**

In Contextual.io, an "agent" refers to the operational deployment of a flow created using the flow editor. Flows are designed sequences of processing steps, triggered either by the receipt of asynchronous events (from object-type triggers or other agents) or by incoming HTTP requests, which you can easily construct and modify within the flow editor. Once a flow is defined, it can be deployed as an agent.

Agents are the dynamic instances that execute the flows. They are designed to operate autonomously and efficiently under varying load conditions. Each agent encapsulates the logic of the flow and handles its execution according to the operational parameters defined during deployment.

**Key Features of Agents**

* **Deployment**: Agents are deployed versions of flows which you can configure and manage. Once a flow is set up in the flow editor, deploying it as an agent takes just a few clicks.
* **Scalability**: Agents are highly scalable, supporting both scale-out (increasing the number of agent instances to handle more load) and scale-up (upgrading the size of an individual agent to Small, Medium, or Large to enhance its processing capability). This flexibility allows you to optimize resource usage and cost based on your specific needs.
* **Auto-scaling**: Agents can automatically adjust their scale based on operational metrics. You can configure auto-scaling based on CPU utilization or lag (such as topic-lag in event streams), ensuring that agents remain responsive and efficient even under fluctuating loads.
* **Operational Monitoring**: Contextual.io provides robust tools for monitoring and diagnosing agents. Developers can access logs specific to each agent, allowing for detailed inspection and troubleshooting of flow executions. This feature is crucial for maintaining the reliability and performance of your applications.

**How Agents Work**

Agents operate by continuously monitoring for triggers—either from asynchronous events or direct HTTP API calls. When a trigger is detected, the agent processes it according to the sequence of operations defined in the flow. The platform ensures that all operations adhere to the configured scalability and performance settings.

During execution, agents can interact with various external systems and services, making them highly versatile in integrating disparate data sources and performing complex workflows. The real-time monitoring and logging capabilities of agents provide an essential feedback loop for developers, assisting in rapid development cycles and iterative improvements.

**Conclusion**

In summary, agents are fundamental to the operational efficiency and scalability of applications developed on the Contextual.io platform. They empower developers to build, deploy, and manage high-performance applications with ease, providing the tools necessary for high-level monitoring and management of operational flows. Whether processing large volumes of data or handling intricate integrations, agents in Contextual.io provide a robust, scalable solution for modern application needs.
