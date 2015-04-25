/**
 * Created by DrTone on 25/04/2015.
 */
var info =
{
    "scales": [
    {
        "name": "KscalePrivacy",
        "min": 0,
        "max": 6,
        "min-label": "Respect",
        "max-label": "Disrespect",
        "questions": ["Privacy01","Privacy02","Privacy03"],
        "classifications": [
            {
                "min": 0,
                "max": 2,
                "name": "HIGH",
                "label": "High respect for Karen’s privacy"
            },
            {
                "min": 3,
                "max": 3,
                "name": "MODERATE",
                "label": "Moderate respect for Karen’s privacy"
            },
            {
                "min": 4,
                "max": 6,
                "name": "LOW",
                "label": "Low respect for Karen’s privacy"
            }
        ]
    },
    {
        "name": "scaleNeuro",
        "min": 2,
        "max": 10,
        "min-label": "Low",
        "max-label": "High",
        "questions": ["Neuro01","Neuro02"],
        "classifications": [
            {
                "min":2,
                "max": 5,
                "name": "LOW",
                "label": "Low"
            },
            {
                "min":6,
                "max": 6,
                "name": "UNSURE",
                "label": "Unsure"
            },
            {
                "min":7,
                "max": 10,
                "name": "HIGH",
                "label": "High"
            }
        ]
    },
    {
        "name": "scaleLOC",
        "min": 0,
        "max": 4,
        "min-label": "External",
        "max-label": "Internal",
        "questions": ["LOC01","LOC02"],
        "classifications": [
            {
                "min":0,
                "max": 2,
                "name": "EXTERNAL",
                "label": "External"
            },
            {
                "min":3,
                "max": 4,
                "name": "INTERNAL",
                "label": "Internal"
            }
        ]
    },
    {
        "name": "scaleOpenness",
        "min": 2,
        "max": 10,
        "min-label": "Low",
        "max-label": "High",
        "questions": ["Open01","Open02"],
        "classifications": [
            {
                "min":2,
                "max": 5,
                "name": "LOW",
                "label": "Low"
            },
            {
                "name": "UNSURE",
                "min":6,
                "max": 6,
                "name": "LOW",
                "label": "Unsure"
            },
            {
                "min":7,
                "max": 10,
                "name": "HIGH",
                "label": "High"
            }
        ]
    }
],
    "questions": [
    {
        "name": "UserGoal",
        "answers": [
            {
                "value": "CONTROL",
                "label": "Control"
            },
            {
                "value": "REVIEW",
                "label": "Life Goals"
            },
            {
                "value": "ATTITUDE",
                "label": "Relationships"
            }
        ]
    },
    {
        "name": "Object",
        "answers": [
            {
                "value": "BANGLE",
                "label": "Bangle"
            },
            {
                "value": "CAMERA",
                "label": "Camera"
            },
            {
                "value": "DEER",
                "label": "Deer Family"
            }
        ]
    }
]
};