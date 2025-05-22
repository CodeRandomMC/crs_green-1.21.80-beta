import { EquipmentSlot, } from "@minecraft/server";
/**
 * @param {number} min The minimum integer
 * @param {number} max The maximum integer
 * @returns {number} A random integer between the `min` and `max` parameters (inclusive)
 */
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
export class CropBlockComponent {
    static getAge(block) {
        try {
            const age = block.permutation.getState("crs_green:crop_age");
            // Validate block's crop_age state
            if (age === undefined || typeof age !== "number") {
                throw new Error(`Invalid crop_age state for block at ${block.location.x}, ${block.location.y}, ${block.location.z}. Expected a number, got ${age}.`);
            }
            return age;
        }
        catch (error) {
            // Assert that error is an instance of Error
            if (error instanceof Error) {
                console.error(`Error in getAge: ${error.message}`);
                throw error;
            }
            // Handle non-Error cases
            console.error(`Error in getAge: Unknown error occurred`);
            throw new Error(`Unknown error in getAge at ${block.location.x}, ${block.location.y}, ${block.location.z}`);
        }
    }
    static tryGrowBlock(block, params) {
        var _a;
        const growthChance = 1 / ((_a = params.grow_on_tick_chance) !== null && _a !== void 0 ? _a : 10);
        // Apply random grow chance
        if (Math.random() > growthChance)
            return;
        // Get the crop_age state
        const age = block.permutation.getState("crs_green:crop_age");
        // Validate crop_age
        if (age === undefined || typeof age !== "number") {
            console.warn(`Invalid crop_age state for block at ${block.location.x}, ${block.location.y}, ${block.location.z}`);
            return;
        }
        // Check to see if mature
        else if (params.max_age !== undefined && age === params.max_age - 1)
            return;
        // Grow crop
        block.setPermutation(block.permutation.withState("crs_green:crop_age", age + 1));
    }
    static tryFertilize(block, player, params) {
        // Get ItemStack from active slot
        const equippable = player.getComponent("minecraft:equippable");
        if (!equippable)
            return false;
        const mainHand = equippable.getEquipmentSlot(EquipmentSlot.Mainhand);
        if (!mainHand.hasItem() || mainHand.typeId !== params.fertilize_item)
            return false;
        if (player.getGameMode().toString() === "creative") {
            // Grow crop fully
            block.setPermutation(block.permutation.withState("crs_green:crop_age", params.max_age - 1));
        }
        else {
            let age = CropBlockComponent.getAge(block);
            // Add random amount to crop age
            age += randomInt(1, params.max_age - 1 - age);
            block.setPermutation(block.permutation.withState("crs_green:crop_age", age));
            // Decrement stack
            if (mainHand.amount > 1) {
                mainHand.amount--;
            }
            else {
                mainHand.setItem(undefined);
            }
        }
        // Play effects
        const effectLocation = block.center();
        block.dimension.playSound("item.bone_meal.use", effectLocation);
        block.dimension.spawnParticle("minecraft:crop_growth_emitter", effectLocation);
        return true;
    }
    onTick(event, customParams) {
        const params = customParams.params;
        if (!params.use_random_tick) {
            CropBlockComponent.tryGrowBlock(event.block, params);
        }
    }
    onRandomTick(event, customParams) {
        var _a;
        const params = customParams.params;
        if ((_a = params.use_random_tick) !== null && _a !== void 0 ? _a : true) {
            CropBlockComponent.tryGrowBlock(event.block, params);
        }
    }
    onPlayerInteract(event, customParams) {
        const params = customParams.params;
        if (event.player === undefined)
            return;
        if (CropBlockComponent.getAge(event.block) < params.max_age) {
            if (params.fertilize_item) {
                CropBlockComponent.tryFertilize(event.block, event.player, params);
            }
        }
    }
}
//# sourceMappingURL=crop_block_component.js.map