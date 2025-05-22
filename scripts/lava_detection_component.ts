import { Block, BlockComponentTickEvent, BlockCustomComponent, CustomComponentParameters } from "@minecraft/server";
import { MinecraftBlockTypes } from "@minecraft/vanilla-data";

type ComponentParameters = {
  on_lava_touches?: "break";
};

export class LavaDetectionComponent implements BlockCustomComponent {
  static detectLava(block: Block): boolean {
    if (!block || !block.isValid) return false;

    const blockType = MinecraftBlockTypes.Lava;

    if (block.above()?.typeId === blockType) return true;
    if (block.east()?.typeId === blockType) return true;
    if (block.west()?.typeId === blockType) return true;
    if (block.north()?.typeId === blockType) return true;
    if (block.south()?.typeId === blockType) return true;

    return false;
  }

  static breakBlock(block: Block) {
    if (block.isValid) {
      // Set the block to air to mimic lava destroy
      block.setType(MinecraftBlockTypes.Air);

      // Play effects for user feedback
      block.dimension.playSound("crop.lava_destroy", block.location);
      block.dimension.spawnParticle("minecraft:basic_smoke_particle", block.location);
    }
  }

  onTick(event: BlockComponentTickEvent, customParameters: CustomComponentParameters) {
    const params = customParameters.params as ComponentParameters;
    const block: Block = event.block;

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
