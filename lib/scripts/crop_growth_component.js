import { EntityInventoryComponent, } from "@minecraft/server";
// new crop component class will handle placement from seed item too using on use this way we can detext if the block above is the upward face the block type the above block etc
export class CropGrowthComponent {
    static tryGrowBlock(block) {
        const perm = block.permutation;
        const age = perm.getState("crs_green:crop_age");
        if (age === undefined || typeof age !== "number") {
            return;
        }
        if (age === 8) {
            return;
        }
        block.setPermutation(perm.withState("crs_green:crop_age", age + 1));
    }
    static tryFertilize(block, player) {
        var _a, _b;
        const inventory = player.getComponent(EntityInventoryComponent.componentId);
        if (inventory === undefined) {
            return false;
        }
        const selectedItem = (_a = inventory.container) === null || _a === void 0 ? void 0 : _a.getItem(player.selectedSlotIndex);
        if (selectedItem && selectedItem.typeId === "minecraft:bone_meal") {
            CropGrowthComponent.tryGrowBlock(block);
            selectedItem.amount--;
            (_b = inventory.container) === null || _b === void 0 ? void 0 : _b.setItem(player.selectedSlotIndex, selectedItem);
            return true;
        }
        return false;
    }
    onRandomTick(event) {
        CropGrowthComponent.tryGrowBlock(event.block);
    }
    onPlayerInteract(event) {
        if (event.player === undefined) {
            return;
        }
        CropGrowthComponent.tryFertilize(event.block, event.player);
    }
}
//# sourceMappingURL=crop_growth_component.js.map