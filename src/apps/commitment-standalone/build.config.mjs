import { defineBuildConfig } from "@open-pioneer/build-support";

export default defineBuildConfig({
    styles: "styles.scss",
    i18n: ["en"],
    services: {
        MenuHandler: {
            provides: ["onestop4all.MenuHandler"]
        }
    },
    ui: {
        references: ["onestop4all.MenuHandler"]
    }
});
