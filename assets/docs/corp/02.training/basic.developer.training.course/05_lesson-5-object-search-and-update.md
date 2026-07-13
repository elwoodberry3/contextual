![Hero](../../../../imgs/pg-header.jpg)
# Lesson 5: Object Search and Update

## Hourly Weather Summaries

### Overview

In this lesson we build on the previous lessons and enhance our Weather Reporting System by creating hourly weather summary records for each weather station. We also enhance the basic weather report to include additional observations. The goal of this lesson is to learn advanced record manipulation using Object Nodes in a Contextual Flow.

#### Objective

Learn more advanced Object-type record manipulation by using incoming weather reports to create and update hourly weather summary records.

**Description**:

* Create an hourly weather summary object type that will hold both the individual observations from the hour but also contain min, max, and average values for the hour.
* Create a weather-summarization flow to receive the individual weather reports and create/update the hourly summary records.

**Terminal Objective:** TBD

**Enabling Objectives:**

* TBD

**New Skills:** NO-3, NO-4, NO-5, NO-6

### Detailed Steps

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
   * reports (array of objects)
3. Use the AI schema assistant as needed!
4. Make sure it has an auto-generated 'id' field as the primary key
5. Save the new object type

#### Create a New Weather Summarization Flow

This new flow will receive the incoming weather report using a trigger. It will then GET the existing weather summary for the current hour (if there is one). Using the report and the existing summary, it will calculate the updated values for the report and then PATCH the report with the modified values. It will also add the report to the reports array on the summary record.

1. Create a new flow called "weather-summarization"
2. Add the Inject, Prepare Event, and Start Event nodes

#### Using an Object Search Node

The first thing we need to do in this new flow is to do a search to see if the hourly weather-summary record for the current hour already exists. If it does, then we are going to update it. If it doesn't, then we are going to create it.

Before we use a search node, we need to use a function to get the parameters setup for the search.

1. Add a function node and connect it to the Event Start node.
2. Open the function node and add the following JavaScript:
3.
