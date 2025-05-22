import {
  Block,
  BlockComponentPlayerInteractEvent,
  BlockComponentRandomTickEvent,
  BlockCustomComponent,
  EntityInventoryComponent,
  Player,
} from "@minecraft/server";

// new crop component class will handle placement from seed item too using on use this way we can detext if the block above is the upward face the block type the above block etc

export class CropGrowthComponent implements BlockCustomComponent {
  static tryGrowBlock(block: Block) {
    const perm = block.permutation;
    const age = perm.getState("crs_green:crop_age" as any);

    if (age === undefined || typeof age !== "number") {
      return;
    }

    if (age === 8) {
      return;
    }

    block.setPermutation(perm.withState("crs_green:crop_age" as any, age + 1));
  }

  static tryFertilize(block: Block, player: Player): boolean {
    const inventory = player.getComponent(EntityInventoryComponent.componentId) as EntityInventoryComponent;

    if (inventory === undefined) {
      return false;
    }

    const selectedItem = inventory.container?.getItem(player.selectedSlotIndex);

    if (selectedItem && selectedItem.typeId === "minecraft:bone_meal") {
      CropGrowthComponent.tryGrowBlock(block);
      selectedItem.amount--;
      inventory.container?.setItem(player.selectedSlotIndex, selectedItem);
      return true;
    }

    return false;
  }

  onRandomTick(event: BlockComponentRandomTickEvent) {
    CropGrowthComponent.tryGrowBlock(event.block);
  }

  onPlayerInteract(event: BlockComponentPlayerInteractEvent) {
    if (event.player === undefined) {
      return;
    }

    CropGrowthComponent.tryFertilize(event.block, event.player);
  }
}
