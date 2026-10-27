import { createSystem, defaultConfig, mergeConfigs } from "@chakra-ui/react";
import { config as defaultTrailsConfig } from "@open-pioneer/base-theme";
import {
    drawerAnatomy,
    numberInputAnatomy,
    dialogAnatomy,
    fieldAnatomy,
    tableAnatomy
} from "@chakra-ui/react/anatomy";

export const PrimaryColor = "#05668D";
export const PrimaryLight = "#2b9eab";
export const PrimaryColor40 = "#05668D40";
export const ActiveControlColor = "#22C0D2";
export const BorderColor = "#CCCCCC";
export const TransparentBackground = "#e0f6fa80";
export const TemporalInputVal = "#22c0d2";
export const TextBackgroundColor = "#F7FAFC";

export const config = mergeConfigs(defaultConfig, defaultTrailsConfig, {
    // change default color palette to "primary" color palette
    // see https://www.chakra-ui.com/guides/theming-change-default-color-palette
    // window-inactive (only for webkit/blink, no firefox support)
    globalCss: {
        "html": { colorPalette: "primary" },
        "::selection": { background: "Highlight !important" },
        "::selection:window-inactive": { background: "#c8c8c8 !important" }
    },
    // specify own theme configuration (see https://chakra-ui.com/docs/theming/overview#theme)
    theme: {
        breakpoints: {
            custombreak: "1000px",
            customXlBreak: "1800px"
        },
        tokens: {
            colors: {
                // define color palette for color scheme
                primary: {
                    50: { value: "#e0f2f6" },
                    100: { value: "#b3dee8" },
                    200: { value: "#80c4d8" },
                    300: { value: "#4daac7" },
                    400: { value: "#2695ba" },
                    500: { value: "#05668D" }, //primary color
                    600: { value: "#045271" },
                    700: { value: "#033d55" },
                    800: { value: "#022938" },
                    900: { value: "#01141c" },
                    950: { value: "#000a0e" }
                }
            },
            fonts: {
                body: {
                    value: "Arial, sans-serif"
                }
            }
        },
        semanticTokens: {
            colors: {
                // define semantic tokens to allow usage of `colorPalette` property in components
                // see https://chakra-ui.com/docs/theming/customization/colors#color-palette
                primary: {
                    solid: { value: "{colors.primary.500}" },
                    contrast: { value: "{colors.white}" },
                    fg: { value: "colors.pink" },
                    muted: { value: "{colors.primary.100}" },
                    subtle: { value: "{colors.primary.50}" },
                    emphasized: { value: "{colors.primary.300}" },
                    focusRing: { value: ActiveControlColor },
                    border: { value: BorderColor }
                },

                // define custom semantic tokens
                primary_background_primary: { value: "{colors.white}" },
                primary_background_light: { value: PrimaryLight },
                primary_font_primary: { value: "{colors.black}" },
                primary_font_secondary: { value: "{colors.gray.500}" },
                primary_font_inverse: { value: "{colors.white}" },
                primary_border: { value: BorderColor },
                primary_color: { value: PrimaryColor },

                // override chakra internal semantic tokens
                // see https://github.com/chakra-ui/chakra-ui/blob/main/packages/react/src/theme/semantic-tokens/colors.ts
                fg: {
                    DEFAULT: {
                        value: "{colors.primary_font_primary}"
                    },
                    subtle: {
                        value: "{colors.primary_font_secondary}"
                    },
                    inverted: {
                        value: "{colors.primary_font_inverse}"
                    }
                },
                bg: {
                    DEFAULT: {
                        value: "{colors.primary_background_primary}"
                    },
                    muted: {
                        value: "{colors.primary_background_light}"
                    }
                },
                border: {
                    DEFAULT: {
                        value: "{colors.primary_border}"
                    }
                }
            }
        },
        // Change style of components
        // see https://chakra-ui.com/docs/theming/customization/recipes#recipes
        recipes: {
            link: {
                variants: {
                    variant: {
                        plain: {
                            color: PrimaryColor,
                            fontWeight: 700
                        }
                    }
                }
            },
            button: {
                base: {
                    borderRadius: "0px"
                },
                variants: {
                    variant: {
                        solid: {
                            fontWeight: "600",
                            fontSize: "md",
                            background: PrimaryColor,
                            color: "white",
                            textTransform: "uppercase",
                            paddingLeft: "50px",
                            paddingRight: "50px",
                            _hover: {
                                bg: PrimaryColor
                            }
                        }
                    }
                }
            },
            separator: {
                base: {
                    borderColor: BorderColor
                }
            },
            input: {
                base: {
                    textStyle: "md"
                }
            }
        },
        slotRecipes: {
            drawer: {
                slots: drawerAnatomy.keys(),
                variants: {
                    size: {
                        customMenu: {
                            content: { maxWidth: "360px" }
                        }
                    }
                }
            },
            field: {
                slots: fieldAnatomy.keys(),
                base: {
                    label: {
                        textStyle: "md"
                    }
                }
            },
            dialog: {
                slots: dialogAnatomy.keys(),
                base: {
                    content: {
                        textStyle: "md"
                    },
                    header: {
                        fontSize: "xl",
                        fontWeight: "bold"
                    }
                },
                variants: {
                    size: {
                        "2xl": {
                            content: {
                                maxW: "2xl"
                            }
                        },
                        "3xl": {
                            content: {
                                maxW: "3xl"
                            }
                        },
                        "4xl": {
                            content: {
                                maxW: "4xl"
                            }
                        },
                        "5xl": {
                            content: {
                                maxW: "5xl"
                            }
                        },
                        "6xl": {
                            content: {
                                maxW: "6xl"
                            }
                        }
                    }
                }
            },
            table: {
                slots: tableAnatomy.keys(),
                base: {
                    columnHeader: {
                        textStyle: "md",
                        fontWeight: "bold",
                        color: "gray.600"
                    }
                },
                variants: {
                    variant: {
                        outline_custom: {
                            root: {},
                            columnHeader: {
                                borderWidth: "1px",
                                borderColor: "gray.200"
                            },
                            header: {
                                bg: "{colors.primary_background_primary}"
                            },
                            row: {
                                "&:not(:last-of-type)": {
                                    borderBottomWidth: "1px"
                                },
                                "borderColor": "gray.200"
                            },
                            footer: {
                                borderTopWidth: "1px"
                            }
                        }
                    }
                }
            },
            numberinput: {
                slots: numberInputAnatomy.keys(),
                variants: {
                    variant: {
                        custom: {
                            input: {
                                border: "2px solid",
                                borderRadius: "0",
                                borderColor: ActiveControlColor,
                                color: ActiveControlColor,
                                fontWeight: "bold",
                                _focus: {
                                    borderColor: ActiveControlColor
                                }
                            },
                            incrementTrigger: {
                                border: "0",
                                borderColor: "purple.200"
                            },
                            decrementTrigger: {
                                border: "0",
                                borderColor: "purple.200"
                            }
                        }
                    }
                }
            }
        }
    }
});

// 1. Create the system
export const system = createSystem(config);

// 2. Add the DEFAULT export for the CLI
export default system;
