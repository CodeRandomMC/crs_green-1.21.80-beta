import {
  Block,
  BlockComponentPlayerInteractEvent,
  BlockComponentRandomTickEvent,
  BlockCustomComponent,
  CustomComponentParameters,
  EquipmentSlot,
  GameMode,
  ItemStack,
  Player,
  world,
} from "@minecraft/server";
import { PlayerUtils } from "../utils/player_utils";
import { CropBlockUtils } from "../utils/crop_block_utils";
import { CRUtils } from "../utils/code_random_utils";

export interface CropBlockComponentParameters {
  /** Maximum age of the crop (exclusive, mature at max_age - 1). Must be >= 2. */
  max_age: number;
  /** Inverse probability of growth per tick (e.g., 10 means 1/10 chance). Defaults to 10. */
  grow_on_tick_chance?: number;
  /** Item type id for the item used to fertilize this crop defaults to 'minecraft:bone_meal' use 'minecraft:air' to disable fertilizing */
  fertilize_item?: string;
}

export class CropBlockComponent implements BlockCustomComponent {
  static tryFertilize(block: Block, player: Player, itemStack: ItemStack, params: CropBlockComponentParameters) {
    // Get current age
    const age = CropBlockUtils.getAge(block, params.max_age);

    // Check to see if player is in creative is so grow to max age
    if (player.getGameMode() === GameMode.creative) {
      CropBlockUtils.setAge(block, params.max_age - 1, params.max_age);
    } else {
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
        PlayerUtils.getEquipmentSlot(player, EquipmentSlot.Mainhand)?.setItem(itemStack);
      } else {
        PlayerUtils.getEquipmentSlot(player, EquipmentSlot.Mainhand)?.setItem(undefined);
      }
    }

    // Play visual and sound effects
    const effectLocation = block.center();
    block.dimension.playSound("item.bone_meal.use", effectLocation);
    block.dimension.spawnParticle("minecraft:crop_growth_emitter", effectLocation);

    return true;
  }

  // Check to see if player is trying to fertilize the crop
  onPlayerInteract(event: BlockComponentPlayerInteractEvent, customParams: CustomComponentParameters) {
    const params = customParams.params as CropBlockComponentParameters;

    // Crop is allready mature return
    if (CropBlockUtils.getAge(event.block, params.max_age) === params.max_age - 1) {
      return;
    }

    // Retrieve custom fertilize item from component parameters
    const fertilizeItemID: string = params.fertilize_item ?? `minecraft:bone_meal`;

    // If id is air, disable fertilizing on this crop
    if (fertilizeItemID === `minecraft:air`) return;

    const player: Player | undefined = event.player;

    // Check to see if player that interacted is still available
    if (player === undefined) return;

    // Get mainHand of the player
    const mainHand = PlayerUtils.getEquipmentSlot(player, EquipmentSlot.Mainhand);

    // Do nothing as we did not get a valid item back
    if (mainHand === undefined || !mainHand.hasItem()) return;

    const itemStack = mainHand.getItem();

    if (itemStack !== undefined) {
      if (itemStack.typeId == fertilizeItemID) {
        CropBlockComponent.tryFertilize(event.block, player, itemStack, params);
      }
    }
  }

  // Apply growth on random tick
  onRandomTick(event: BlockComponentRandomTickEvent, customParams: CustomComponentParameters) {
    CropBlockUtils.tryGrow(event.block, customParams.params as CropBlockComponentParameters);
  }
}
