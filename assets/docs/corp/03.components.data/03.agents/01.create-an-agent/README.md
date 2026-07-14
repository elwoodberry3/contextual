# Creating an Agent

Here is a quick guide for creating your first Agent in Contextual.

1. Access your Contextual Tenant Workspace
2. Select **Components** > **Agents** from the main menu
3. Select <img src="/files/uTIKYxsYdhaum0ERHo9A" alt="" data-size="line"> to Create an Agent
4. Provide the basic [**Definition**](/documentation-and-resources/components-and-data/agents/agent-details/definition.md)...
   * Agent Id - permanent, must be unique
   * Agent Name - required, editable
   * Agent Description - optional, editable
   * Agent Type - Specifies the trigger type for the agent:
     * Event to Flow - Agent receives asynchronous events from Object Type triggers or other Agents
     * Cron to Flow - Agent executes a flow on a cron schedule
     * HTTP to Flow - Agent processing incoming HTTP requests on an agent-specific URL:\
       \<agentId>.service.\<tenantName>.my.contextual.io
   * Flow - once you specify the agent type, a drop-down list of available flows will appear and allow you to select a flow to be used for this agent.
   * Entry Point - for Event to Flow agents, if the flow supports more than one Event Start entry point, then a drop-down will appear that allows you to select which entry point this specific agent deployment should use.
   * Processing Type (Event to Flow only, under **Advanced**) - choose **Ordered** (default) or **Unordered**. See [Definition](/documentation-and-resources/components-and-data/agents/agent-details/definition.md) for guidance on choosing.
   * Image (version) - specifies the version of the agent runtime to be used for this agent.
   * Parallel Instance Scaling Type - allows for the specification of the auto-scaling type:
     * Compute Threshold - specifies a percentage CPU threshold which if exceeded consistently, will cause additional instances of the agent to be deployed.
     * Event Lag - specifies the number of unprocessed events which, if exceeded, will cause additional instances of the agent to be deployed.
   * Parallel Instances - specifies the number of agents to be deployed as a minimum and a maximum number of instances
     * Minimum - the minimum number of instances must be at least 1 but can be more.
     * Maximum - the maxinum number of instances must be greater than or equal to the minimum, but can be more.
     * Note: if the minimum and maximum number of instances are the same, then auto-scaling is effectively disabled.
   * Event Lag Threshold - if "Event Lag" is selected for the scaling type, then this field specifies the number of unprocessed events which, if exceeded, will trigger the deployment of an additional agent.
   * Instance Compute - if "Compute Threshold" is selected for the scaling type, then this field specifies the percentage of CPU utilization which, if exceeded, will trigger the deployment of an additional agent.
   * Instance Compute - specifies the size of the agent (small, medium, large). The agent sizes correspond to a specific mCPU capacity assigned to the agent.
   * Schedule - if "Cron to Flow" is selected, this field defines when the flow should run.
   * Environment Variables - allows the user to add environment variable name and value pairs that are accessible at runtime by the flow that is being executed, allowing for flows to be made configurable based on the environment variables provided.
5. Click **Create**
