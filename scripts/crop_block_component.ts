import {
  Block,
  BlockComponentPlayerInteractEvent,
  BlockComponentRandomTickEvent,
  BlockComponentTickEvent,
  BlockCustomComponent,
  CustomComponentParameters,
  EquipmentSlot,
  GameMode,
  Player,
  world,
} from "@minecraft/server";

type ComponentParameters = {
  max_age: number;
  use_random_tick?: boolean;
  grow_on_tick_chance?: number;
  fertilize_item?: string;
};

/**
 * @param {number} min The minimum integer
 * @param {number} max The maximum integer
 * @returns {number} A random integer between the `min` and `max` parameters (inclusive)
 */
const randomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;

export class CropBlockComponent implements BlockCustomComponent {
  static getAge(block: Block): number {
    try {
      const age = block.permutation.getState("crs_green:crop_age" as any);

      // Validate block's crop_age state
      if (age === undefined || typeof age !== "number") {
        throw new Error(
          `Invalid crop_age state for block at ${block.location.x}, ${block.location.y}, ${block.location.z}. Expected a number, got ${age}.`
        );
      }

      return age;
    } catch (error: unknown) {
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

  static tryGrowBlock(block: Block, params: ComponentParameters) {
    const growthChance: number = 1 / (params.grow_on_tick_chance ?? 10);

    // Apply random grow chance
    if (Math.random() > growthChance) return;

    // Get the crop_age state
    const age = CropBlockComponent.getAge(block);

    // Check to see if mature
    if (age === params.max_age - 1) return;

    // Grow crop
    block.setPermutation(block.permutation.withState("crs_green:crop_age" as any, age + 1));
  }

  static tryFertilize(block: Block, player: Player, params: ComponentParameters): boolean {
    // Get ItemStack from active slot
    const equippable = player.getComponent("minecraft:equippable");
    if (!equippable) return false;

    const mainHand = equippable.getEquipmentSlot(EquipmentSlot.Mainhand);

    if (!mainHand.hasItem() || mainHand.typeId !== params.fertilize_item) return false;

    if (player.getGameMode() == GameMode.Creative) {
      // Grow crop fully
      block.setPermutation(block.permutation.withState("crs_green:crop_age" as any, params.max_age - 1));
    } else {
      let age = CropBlockComponent.getAge(block);

      // Add random amount to crop age
      age += randomInt(1, params.max_age - 1 - age);
      block.setPermutation(block.permutation.withState("crs_green:crop_age" as any, age));

      // Decrement stack
      if (mainHand.amount > 1) {
        mainHand.amount--;
      } else {
        mainHand.setItem(undefined);
      }
    }

    // Play effects
    const effectLocation = block.center();
    block.dimension.playSound("item.bone_meal.use", effectLocation);
    block.dimension.spawnParticle("minecraft:crop_growth_emitter", effectLocation);

    return true;
  }

  onTick(event: BlockComponentTickEvent, customParams: CustomComponentParameters) {
    const params = customParams.params as ComponentParameters;

    if (!params.use_random_tick) {
      CropBlockComponent.tryGrowBlock(event.block, params);
    }
  }

  onRandomTick(event: BlockComponentRandomTickEvent, customParams: CustomComponentParameters) {
    const params = customParams.params as ComponentParameters;

    if (params.use_random_tick ?? true) {
      CropBlockComponent.tryGrowBlock(event.block, params);
    }
  }

  onPlayerInteract(event: BlockComponentPlayerInteractEvent, customParams: CustomComponentParameters) {
    const params = customParams.params as ComponentParameters;

    if (event.player === undefined) return;

    if (CropBlockComponent.getAge(event.block) < params.max_age) {
      if (params.fertilize_item) {
        CropBlockComponent.tryFertilize(event.block, event.player, params);
      }
    }
  }
}
