# Metro Stop

## Datasets

### Main Datasets

We have two standard datasets to render an event based process diagram:

1. Process DataSet – **required** - all the processes with their in and outgoing events
2. Event DataSet – *optional* - details on the events

### Attribute Datasets

We can load datasets related to attributes in the main datasets (or in the events dataset) in two ways:

1. Attribute Reference Dataset - we can load data as reference data for attributes in the main datasets. An example would be process-owner, which could be populated with e.g. emails, that in turn can be referenced with additional details on the person.
2. Attribute Diagram Dataset - when configured as such, an attribute dataset can be treated as a graph itself and rendered according to predefined designs as configured in the config.json

### Configuration JSON

Settings.json is used to configure different aspects of the application. The schema is as follows.
```javascript
{
    process data:{
        additional attributes: ["IT Assets","tester2","tester5"]
    },
    general : {
        navbar:{
            logo: "static/logo_dark.svg",
            title : "Multifamily Loan Life Cycle"
        },
        settings_panel:{
            "show_start_end_event":"false"
        }
    },
    process_attr : {
        related_it_assets : {
            data: "assets-data.js"
        }
    },
    event_attr : {},
    render : {
        sub_process : {
            data: "related_it_assets",
            extension: "SystemContext"
        }
    }
}
```
1. `general` - Describes aspects of application UI

    1.a. `navbar` - Can change image used for logo portion of navbar (`logo`) as well as title (`title`)
2. `process_attr` - Specify aspects of data potentially rendered with extensions
3. `event_attr` - Specify information about event data
3. `process_attr` - Specify information about process data
4. `render` - Specify information about extension, in example we register `SystemContext` as an extension
## Plugins

All data loading is done using plugins that are conditionally loaded. Plugins reside in the plugins folder.

Custom methods available to plugins:

- Papa Parse - https://www.papaparse.com/

### Main Plugins

1. process-data.js - A plugin to load the process dataset
2. events-data.js - A plugin to load the events dataset

### Attribute Plugins

tbd

## Configuration
 
We can now configure the code to look for these default files plugins for process and events.

The config.json file should contain the following sections:
Visual config Eg colors for phases, position for main events, legend details (future)
Reference config
List of columns to be auto loaded (and be available for manual upload)
For each column: details on rendering the data, ranging from a simple hover with more info, to a visual integration of the data (here we still need to decide on how to render data)

## FAQ's

### How is each stop mapped as a descendant of another stop?

> The MetroStop will rely on the user to provide the proper coordinates, "starting_event" and "ending_event" for each stop in the dataset > to determine the order of stops.
>
> - The "cx" and "cy" fields determine the horizontal and vertical positioning of the stops respectively. Where the range is from 0 to 1670 pixels in width and 0 to 1000 pixels in height.
> - Descendants are assigned using events. If stop A leads to stop B, then stop A's ending event must equal stop B's starting event value.

### How are activities mapped to a stop?

> The MetroStop will use the "stop_parent" column to determine the activities that belong to a stop.
>
> - The activities are then organized according to their events. If activity A leads to actvity B, then activitiy A's ending event must equal activity B's starting event.

### What is the CSV format MetroStop can consume?

> The following is a sample of the column names which is the accepted format Metrostop can take as input. Where column names **must** be the following with no extra space before or after text. The ' character **must** be used instead of commas inside of text and for seperated lists. For example, a record with multiple values for column "stake_holder," should be: "John Doe'Jane Doe"

| sector_name | phase_name | stop_name | starting_event | ending_event | stop_parent | cx  | cy  | stop_capability | stop_stakeholder | description | definition | related_it_assets | phase_color | stop_has_line | stop_label_position | Notes |
| ----------- | ---------- | --------- | -------------- | ------------ | ----------- | --- | --- | --------------- | ---------------- | ----------- | ---------- | ----------------- | ----------- | ------------- | ------------------- | ----- |

### What is the JSON schema for the MetroStop

> The following is the schema required in order for the Metrostop to consume data. When provided a CSV, the MetroStop with convert the file into the following JSON schema.

```javascript
{
   sectors: [
       sector_id: 0,
       sector_name: "Sample Sector 0",
       phases: [
           phase_id: 0,
           phase_name: "Sample Phase 0",
          phase_styles: {
               phase_color: "red"
           },
           stops: [
               stop_id: 0,
               stop_name: "Sample Stop 0",
               stop_definition: "Sample Definition 0",
               cx: "0",
               cy: "0",
               starting_event: "Sample Starting Event 0",
               ending_event: "Sample Ending Event 0,
               stop_styles: {
                   stop_has_line: "yes/no",
                   stop_label_position: "up/down"
               },
              stop_activities: [
                   act_id: 0,
                   act_name: "Sample Actvitiy 0",
                   act_starting_event: "Sample Starting Event 0",
                   act_ending_event: "Sample Starting Event 1,
                   act_stakeholders: ['Sample StakeHolder 0', Sample StakeHolder 1'],
                   act_it_assets: ['Sample IT asset 0', 'Sample IT asset 1'],
                   act_meta_data: [
                       {
                           title: "Description 0"
                       }
                   ]
               ]
           ]
      ]
   ]
}
```
