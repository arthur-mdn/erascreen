// models/Screen.js
const mongoose = require('mongoose');
const {Schema} = mongoose;

const timeRangeSchema = new mongoose.Schema({
    start: {
        type: String,
        required: true
    },
    end: {
        type: String,
        required: true
    },
    enabled: {
        type: Boolean,
        default: false
    }
});

const textTimeRangeSchema = new mongoose.Schema({
    start: {
        type: String,
        required: true
    },
    end: {
        type: String,
        required: true
    },
    text: {
        type: String,
        default: ""
    },
    backgroundColor: {
        type: String,
        default: ""
    },
    textColor: {
        type: String,
        default: ""
    },
    slideTime: {
        type: Number,
        default: 120
    },
    enabled: {
        type: Boolean,
        default: false
    }
});

const darkModeSchema = new mongoose.Schema({
    ranges: {
        type: [timeRangeSchema],
        default: [
            {
                start: "00:00",
                end: "06:00",
                enabled: true
            },
            {
                start: "19:00",
                end: "00:00",
                enabled: true
            }
        ]
    }
});

const textSlidesSchema = new mongoose.Schema({
    ranges: {
        type: [textTimeRangeSchema],
        default: []
    }
});

const screenSchema = new Schema({
    users: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            role: {
                type: String,
                required: true,
                default: "editor"
            },
            creation: {
                type: Date,
                default: Date.now()
            },
            permissions: {
                type: Array,
                default: []
            }
        }
    ],
    code: {
        type: String,
        required: true,
        unique: true
    },
    nom: {
        type: String,
        required: true,
        default: "Écran"
    },
    logo: {
        type: String,
        default: ""
    },
    image: {
        type: String,
        default: "public/template-screen-image.png"
    },
    icons: {
        type: Array,
        default: []
    },
    meteo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Meteo'
    },
    directions: [
        {
            arrow: {
                style: {
                    type: String,
                    default: ""
                },
                orientation: {
                    type: String,
                    default: ""
                }
            },
            title: {
                color: {
                    type: String,
                    default: ""
                },
                text: {
                    type: String,
                    default: ""
                }
            },
            description: {
                type: String,
                default: ""
            }
        }
    ],
    photos: {
        type: Array,
        default: []
    },
    text_slides: {
        type: textSlidesSchema,
        default: () => ({
            ranges: []
        })
    },
    config: {
        hide_slider_dots: {
            type: Boolean,
            default: false
        },
        photos_interval: {
            type: Number,
            default: 10
        }
    },
    dark_mode: {
        type: darkModeSchema,
        default: () => ({
            ranges: [
                {
                    start: "00:00",
                    end: "06:00",
                    enabled: true
                },
                {
                    start: "19:00",
                    end: "00:00",
                    enabled: true
                }
            ]
        })
    },
    status: {
        type: String,
        enumerable: ["online", "offline"],
        required: true,
        default: "offline"
    },
    creation: {
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model('Screen', screenSchema);
