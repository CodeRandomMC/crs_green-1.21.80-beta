import { system } from "@minecraft/server";
import { LavaDetectionComponent } from "./block_components/lava_detection_component";
import { CropBlockComponent } from "./block_components/crop_block_component";
system.beforeEvents.startup.subscribe((init) => {
    // Register custom block components
    init.blockComponentRegistry.registerCustomComponent("crs_green:lava_detection", new LavaDetectionComponent());
    init.blockComponentRegistry.registerCustomComponent("crs_green:crop", new CropBlockComponent());
});
//# sourceMappingURL=main.js.map