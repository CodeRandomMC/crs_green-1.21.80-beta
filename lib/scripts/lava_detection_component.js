import { MinecraftBlockTypes } from "@minecraft/vanilla-data";
export class LavaDetectionComponent {
    static detectLava(block) {
        var _a, _b, _c, _d, _e;
        if (!block || !block.isValid)
            return false;
        const blockType = MinecraftBlockTypes.Lava;
        if (((_a = block.above()) === null || _a === void 0 ? void 0 : _a.typeId) === blockType)
            return true;
        if (((_b = block.east()) === null || _b === void 0 ? void 0 : _b.typeId) === blockType)
            return true;
        if (((_c = block.west()) === null || _c === void 0 ? void 0 : _c.typeId) === blockType)
            return true;
        if (((_d = block.north()) === null || _d === void 0 ? void 0 : _d.typeId) === blockType)
            return true;
        if (((_e = block.south()) === null || _e === void 0 ? void 0 : _e.typeId) === blockType)
            return true;
        return false;
    }
    static breakBlock(block) {
        if (block.isValid) {
            // Set the block to air to mimic lava destroy
            block.setType(MinecraftBlockTypes.Air);
            // Play effects for user feedback
            block.dimension.playSound("crop.lava_destroy", block.location);
            block.dimension.spawnParticle("minecraft:basic_smoke_particle", block.location);
        }
    }
    onTick(event, customParameters) {
        const params = customParameters.params;
        const block = event.block;
        if (LavaDetectionComponent.detectLava(block)) {
            switch (params.on_lava_touches) {
                case "break":
                    LavaDetectionComponent.breakBlock(block);
                    break;
                default:
                    break;
            }
        }
    }
}
//# sourceMappingURL=lava_detection_component.js.map