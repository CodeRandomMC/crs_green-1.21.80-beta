import { EquipmentSlot, GameMode, } from "@minecraft/server";
import { PlayerUtils } from "../utils/player_utils";
import { CropBlockUtils } from "../utils/crop_block_utils";
import { CRUtils } from "../utils/code_random_utils";
export class CropBlockComponent {
    static tryFertilize(block, player, itemStack, params) {
        var _a;
        // Get current age
        const age = CropBlockUtils.getAge(block, params.max_age);
        // Check to see if player is in creative is so grow to max age
        if (player.getGameMode() === GameMode.creative) {
            CropBlockUtils.setAge(block, params.max_age - 1, params.max_age);
        }
        else {
            // Random growth in survival mode
            const maxIncrement = params.max_age - 1 - age;
            if (maxIncrement <= 0) {
                return false;
            }
            const increment = CRUtils.randomInt(1, maxIncrement);
            CropBlockUtils.setAge(block, age + increment, params.max_age);
            // Consume item
            if (itemStack.amount > 1) {
                itemStack.amount--;
            }
            else {
                (_a = PlayerUtils.getEquipmentSlot(player, EquipmentSlot.Mainhand)) === null || _a === void 0 ? void 0 : _a.setItem(undefined);
            }
        }
        // Play visual and sound effects
        const effectLocation = block.center();
        block.dimension.playSound("item.bone_meal.use", effectLocation);
        block.dimension.spawnParticle("minecraft:crop_growth_emitter", effectLocation);
        return true;
    }
    // Check to see if player is trying to fertilize the crop
    onPlayerInteract(event, customParams) {
        var _a;
        const params = customParams.params;
        // Crop is allready mature return
        if (CropBlockUtils.getAge(event.block, params.max_age) === params.max_age - 1) {
            return;
        }
        console.info(`fired`);
        // Retrieve custom fertilize item from component parameters
        const fertilizeItemID = (_a = params.fertilize_item) !== null && _a !== void 0 ? _a : `minecraft:bone_meal`;
        // If id is air, disable fertilizing on this crop
        if (fertilizeItemID === `minecraft:air`)
            return;
        const player = event.player;
        // Check to see if player that interacted is still available
        if (player === undefined)
            return;
        // Get mainHand of the player
        const mainHand = PlayerUtils.getEquipmentSlot(player, EquipmentSlot.Mainhand);
        // Do nothing as we did not get a valid item back
        if (mainHand === undefined || !mainHand.hasItem())
            return;
        const itemStack = mainHand.getItem();
        if (itemStack !== undefined) {
            if (itemStack.typeId == fertilizeItemID) {
                CropBlockComponent.tryFertilize(event.block, player, itemStack, params);
            }
        }
    }
    // Apply growth on random tick
    onRandomTick(event, customParams) {
        CropBlockUtils.tryGrow(event.block, customParams.params);
    }
}
//# sourceMappingURL=crop_block_component.js.map