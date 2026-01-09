import mongoose from "mongoose";
import slugify from "slugify";

const webinarsSchema = new mongoose.Schema(
    {
        logo: {
            public_id: {
                type: String,
                default: "",
            },
            url: {
                type: String,
                default: "",
            },
        },
        title: {
            type: String,
            default: "",
        },
        slug: {
            type: String,
            unique: true,
            lowercase: true,
            index: true,
        },
        description: {
            type: String,
            default: "",
        },
        organisedBy: {
            type: String,
            default: "",
        },
        category: {
            type: String,
            enum: ["Mathematics", "Literacy", "Science", "EdTech", "SEL & Wellbeing", "Arts & Music", "Languages", "NEP 2020", "Early Years", "Assessment"]
        },
        date: {
            type: Date,
        },
        views: {
            type: Number,
            default: 10,
        },

        startTime: {
            type: String,
            default: "",
        },

        duration: {
            type: String,
            default: "",
        },

        price: {
            type: String,
            default: "",
        },

        isFree: {
            type: Boolean,
            default: false,
        },
        isLive: {
            type: Boolean,
            default: false,
        },

        isCertified: {
            type: Boolean,
            default: false,
        },

        isOnDemand: {
            type: Boolean,
            default: false,
        },
        isStopped: {
            type: Boolean,
            default: false
        },

        /** 🔽 ACTION CONTROLS (Start Program / Enroll) */
        actions: {
            canStartProgram: {
                type: Boolean,
                default: true,
            },
            canEnroll: {
                type: Boolean,
                default: false,
            },
        },
        meta: {
            type: String
        },

        features: [
            {
                feature: {
                    type: String,
                    default: "",
                },
            },
        ],

        whoCanAttend: [
            {
                key: {
                    type: String,
                    enum: [
                        "leaders",
                        "teachers",
                        "heads",
                        "tuition_owners",
                        "coaching_owners",
                        "consultants",
                        "counsellors"
                    ],
                    required: true,
                    lowercase: true,
                    trim: true,
                },
                title: {
                    type: String,
                    required: true,
                },
            },
        ],

        trainer: [
            {
                trainerImage: {
                    public_id: {
                        type: String,
                        default: "",
                    },
                    url: {
                        type: String,
                        default:
                            "https://res.cloudinary.com/dpynxkjfq/image/upload/v1720520065/default-avatar-icon-of-social-media-user-vector_wl5pm0.jpg",
                    },
                },
                trainerName: {
                    type: String,
                    default: "",
                },
                designation: {
                    type: String,
                    default: "",
                },
                worksAt: {
                    type: String,
                    default: "",
                },
                description: {
                    type: String,
                    default: "",
                },
            },
        ],

        sessionAgenda: [
            {
                title: {
                    type: String,
                    default: "",
                },
                description: {
                    type: String,
                    default: "",
                },
                time: {
                    type: String,
                    default: "",
                },
            },
        ],

        attendeeBenefits: {
            title: {
                type: String,
                default: "",
            },
            features: [
                {
                    type: String,
                },
            ],
        },

        modules: [
            {
                moduleTitle: {
                    type: String,
                    default: ""
                },
                moduleLink: {
                    type: String,
                    default: ""
                },
                moduleDescription: {
                    type: String,
                    default: ""
                }
            }
        ],

        bonus: {
            title: {
                type: String,
                default: ""
            },
            description: {
                type: String,
                default: "",
            },
        },
        mode: {
            type: String,
            default: "",
        },
        link: {
            type: String,
            default: ""
        },
        registerFormSubheading: {
            type: String,
            default: ""
        },

        metaTitle: {
            type: String,
            default: ""
        },
        metaDescription: {
            type: String,
            default: ""
        },
        ogImage: {
            public_id: {
                type: String,
                default: "",
            },
            url: {
                type: String,
                default: "",
            },

        },
        utm_source: {
            type: String,
            default: ""
        },
        utm_medium: {
            type: String,
            default: ""
        },
        utm_campaign: {
            type: String,
            default: ""
        },
        schemaMarkup: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },

    },
    { timestamps: true }

);

/* 🔥 AUTO-GENERATE SLUG FROM TITLE */
webinarsSchema.pre("save", async function () {
    if (!this.isModified("title")) return;

    let slug = slugify(this.title, {
        lower: true,
        strict: true,
    });

    // Ensure slug uniqueness
    const existing = await this.constructor.findOne({ slug });
    if (existing) {
        slug = `${slug}-${Date.now()}`;
    }

    this.slug = slug;
});


const Webinars = mongoose.model("Webinars", webinarsSchema);

export default Webinars;
