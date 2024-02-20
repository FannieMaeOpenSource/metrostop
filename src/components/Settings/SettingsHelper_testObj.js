export const ProcessUploadedMetrostopData_input=
[
    {
        "sector_name": "Typical",
        "phase_name": "Replication",
        "stop_parent": null,
        "stop_name": "DNA Replication",
        "cx": 0,
        "cy": 0,
        "description": "DNA Replication",
        "starting_event": "Initiation",
        "ending_event": "DNA replication termination",
        "stop_stakeholder": null,
        "stop_path": null,
        "Related Proteins": null,
        "phase_color": "#3498DB",
        "stop_has_line": "yes",
        "stop_label_position": "up",
        "Notes": null
    },
    {
        "sector_name": "Typical",
        "phase_name": "Transcription",
        "stop_parent": null,
        "stop_name": "Initiation I",
        "cx": 100,
        "cy": 0,
        "description": null,
        "starting_event": "DNA replication termination",
        "ending_event": "Transcription initiated",
        "stop_stakeholder": null,
        "stop_path": "Concurrent",
        "Related Proteins": null,
        "phase_color": "#2ECC71",
        "stop_has_line": "yes",
        "stop_label_position": "down",
        "Notes": null
    },
    {
        "sector_name": "Typical",
        "phase_name": "Transcription",
        "stop_parent": "Initiation I",
        "stop_name": "Nucleosome repositioned",
        "cx": null,
        "cy": null,
        "description": null,
        "starting_event": "DNA replication termination",
        "ending_event": "Nucleosome repositioned",
        "stop_stakeholder": null,
        "stop_path": "Concurrent",
        "Related Proteins": null,
        "phase_color": "#2ECC72",
        "stop_has_line": "yes",
        "stop_label_position": "down",
        "Notes": null
    },
    {
        "sector_name": "Typical",
        "phase_name": "Transcription",
        "stop_parent": "Initiation I",
        "stop_name": "Basal factors bind promoters",
        "cx": null,
        "cy": null,
        "description": null,
        "starting_event": "Nucleosome repositioned",
        "ending_event": "Basal factors bind promoters",
        "stop_stakeholder": null,
        "stop_path": "Concurrent",
        "Related Proteins": null,
        "phase_color": "#2ECC73",
        "stop_has_line": "yes",
        "stop_label_position": "down",
        "Notes": null
    },
    {
        "sector_name": "Typical",
        "phase_name": "Transcription",
        "stop_parent": "Initiation I",
        "stop_name": "Indirect repressor proteins bind",
        "cx": null,
        "cy": null,
        "description": null,
        "starting_event": "Nucleosome repositioned",
        "ending_event": "Indirect repressor proteins bind",
        "stop_stakeholder": null,
        "stop_path": "Optional",
        "Related Proteins": null,
        "phase_color": "#2ECC74",
        "stop_has_line": "yes",
        "stop_label_position": "down",
        "Notes": null
    },
    {
        "sector_name": "Typical",
        "phase_name": "Transcription",
        "stop_parent": "Initiation I",
        "stop_name": "Activators bind to enhancers",
        "cx": null,
        "cy": null,
        "description": null,
        "starting_event": "Nucleosome repositioned",
        "ending_event": "Activators bind to enhancers",
        "stop_stakeholder": null,
        "stop_path": "Concurrent",
        "Related Proteins": null,
        "phase_color": "#2ECC75",
        "stop_has_line": "yes",
        "stop_label_position": "down",
        "Notes": null
    },
    {
        "sector_name": "Typical",
        "phase_name": "Transcription",
        "stop_parent": "Initiation I",
        "stop_name": "Repressor and corepressor bind",
        "cx": null,
        "cy": null,
        "description": null,
        "starting_event": "Nucleosome repositioned",
        "ending_event": "Repressor and corepressor bind",
        "stop_stakeholder": null,
        "stop_path": "Concurrent",
        "Related Proteins": null,
        "phase_color": "#2ECC76",
        "stop_has_line": "yes",
        "stop_label_position": "down",
        "Notes": null
    }
];
export const ProcessUploadedMetrostopData_output=
{
    "sectors": [
        {
            "sector_id": 1,
            "sector_name": "Typical",
            "phases": [
                {
                    "phase_id": 1,
                    "phase_name": "Replication",
                    "stops": [
                        {
                            "stop_id": 1,
                            "stop_name": "DNA Replication",
                            "stop_activities": [],
                            "cx": 0,
                            "cy": 0,
                            "descendant_stop_id": [
                                2
                            ],
                            "stop_styles": {
                                "stop_has_line": "yes",
                                "stop_label_position": "up"
                            },
                            "starting_event": "Initiation",
                            "ending_event": "DNA replication termination",
                            "stop_definition": "DNA Replication",
                            "sector_id": 1,
                            "is_beginning_stop": true,
                            "color": "#3498DB",
                            "phase_name": "Replication",
                            "phase_id": 1
                        }
                    ],
                    "phase_styles": {
                        "phase_color": "#3498DB"
                    }
                },
                {
                    "phase_id": 2,
                    "phase_name": "Transcription",
                    "stops": [
                        {
                            "stop_id": 2,
                            "stop_name": "Initiation I",
                            "stop_activities": [
                                {
                                    "act_id": 1,
                                    "act_name": "Nucleosome repositioned",
                                    "act_description": null,
                                    "act_ending_event": "Nucleosome repositioned",
                                    "act_starting_event": "DNA replication termination",
                                    "act_path_type": "Concurrent",
                                    "act_meta_data": [],
                                    "attributes": {}
                                },
                                {
                                    "act_id": 2,
                                    "act_name": "Basal factors bind promoters",
                                    "act_description": null,
                                    "act_ending_event": "Basal factors bind promoters",
                                    "act_starting_event": "Nucleosome repositioned",
                                    "act_path_type": "Concurrent",
                                    "act_meta_data": [],
                                    "attributes": {}
                                },
                                {
                                    "act_id": 3,
                                    "act_name": "Indirect repressor proteins bind",
                                    "act_description": null,
                                    "act_ending_event": "Indirect repressor proteins bind",
                                    "act_starting_event": "Nucleosome repositioned",
                                    "act_path_type": "Optional",
                                    "act_meta_data": [],
                                    "attributes": {}
                                },
                                {
                                    "act_id": 4,
                                    "act_name": "Activators bind to enhancers",
                                    "act_description": null,
                                    "act_ending_event": "Activators bind to enhancers",
                                    "act_starting_event": "Nucleosome repositioned",
                                    "act_path_type": "Concurrent",
                                    "act_meta_data": [],
                                    "attributes": {}
                                },
                                {
                                    "act_id": 5,
                                    "act_name": "Repressor and corepressor bind",
                                    "act_description": null,
                                    "act_ending_event": "Repressor and corepressor bind",
                                    "act_starting_event": "Nucleosome repositioned",
                                    "act_path_type": "Concurrent",
                                    "act_meta_data": [],
                                    "attributes": {}
                                }
                            ],
                            "cx": 100,
                            "cy": 0,
                            "descendant_stop_id": [],
                            "stop_styles": {
                                "stop_has_line": "yes",
                                "stop_label_position": "down"
                            },
                            "starting_event": "DNA replication termination",
                            "ending_event": "Transcription initiated",
                            "stop_definition": null,
                            "sector_id": 1,
                            "is_beginning_stop": false,
                            "phase_name": "Transcription",
                            "phase_id": 2,
                            "color": "#2ECC71"
                        }
                    ],
                    "phase_styles": {
                        "phase_color": "#2ECC71"
                    }
                }
            ]
        }
    ]
};