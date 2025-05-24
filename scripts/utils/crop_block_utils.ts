/**
 * Utility class for managing crop block states and growth mechanics in Minecraft Bedrock Addons.
 * Designed for Scripting API v2.0.0-Beta with custom block components v2 enabled (Minecraft 1.21.80).
 * Provides methods to get/set crop age and handle growth logic for blocks with the `crs_green:crop_age` state.
 *
 * @remarks
 * Requires a block state `crs_green:crop_age` defined in the block's JSON with valid integer values.
 * @example
 * ```json
 * // Block JSON example
 * {
 *   "minecraft:block": {
 *     "states": {
 *       "crs_green:crop_age": [0, 1, 2, 3, 4, 5, 6, 7]
 *     }
 *   }
 * }
 * ```
 */
import { Block } from "@minecraft/server";
import { BlockStateUtils, CustomStateSet } from "./permutation_utils";
import { CropBlockComponentParameters } from "../block_components/crop_block_component";

export class CropBlockUtils {
  /**
   * Retrieves and validates the crop's age from its block state.
   * @param block - The block to query.
   * @param max_age - The maximum age of the crop (exclusive).
   * @returns The validated crop age, clamped to [0, max_age - 1].
   * @throws Error if the crop_age state is invalid or missing.
   */
  static getAge(block: Block, max_age: number): number {
    try {
      const age = BlockStateUtils.getInt(block, CustomStateSet.CROP_AGE);

      // Clamp age to valid range
      if (age < 0 || age >= max_age) {
        console.warn(`Crop age out of bounds: ${age}. Clamping to [0, ${max_age - 1}].`);
        return Math.max(0, Math.min(age, max_age - 1));
      }

      return age;
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error occurred";
      console.error(`Error in getAge: ${errorMsg}`);
      throw new Error(
        `Failed to get age at ${block.location.x}, ${block.location.y}, ${block.location.z}: ${errorMsg}`
      );
    }
  }

  /**
   * Sets the crop's age in its block state.
   * @param block - The block to update.
   * @param age - The new age to set.
   * @param max_age - The maximum age of the crop (exclusive).
   * @throws Error if the age is invalid, max_age is invalid, or the block state cannot be updated.
   */
  static setAge(block: Block, age: number, max_age: number): void {
    try {
      // Validate max_age
      if (!Number.isInteger(max_age) || max_age < 2) {
        throw new Error(`Invalid max_age: ${max_age}. Must be an integer >= 2.`);
      }

      // Validate age
      if (!Number.isInteger(age)) {
        throw new Error(
          `Invalid age: ${age} at ${block.location.x}, ${block.location.y}, ${block.location.z}. Must be an integer.`
        );
      }

      // Clamp age to valid range
      const clampedAge = Math.max(0, Math.min(age, max_age - 1));
      if (age !== clampedAge) {
        console.warn(
          `Age out of bounds: ${age} at ${block.location.x}, ${block.location.y}, ${block.location.z}. Clamped to ${clampedAge}.`
        );
      }

      // Update block state
      BlockStateUtils.setState(block, CustomStateSet.CROP_AGE, clampedAge);
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : "Unknown error occurred";
      console.error(`Error in setAge: ${errorMsg}`);
      throw new Error(
        `Failed to set age at ${block.location.x}, ${block.location.y}, ${block.location.z}: ${errorMsg}`
      );
    }
  }

  /**
   * Attempts to grow the crop by one stage based on a random chance.
   * @param block - The crop block to grow.
   * @param params - Configuration parameters for growth.
   * @throws Error if max_age or grow_on_tick_chance is invalid.
   */
  static tryGrow(block: Block, params: CropBlockComponentParameters): void {
    // Validate parameters
    if (params.max_age < 2) {
      throw new Error(`Invalid max_age: ${params.max_age}. Must be >= 2.`);
    }
    const growChance = params.grow_on_tick_chance ?? 10;
    if (growChance <= 0) {
      throw new Error(`Invalid grow_on_tick_chance: ${growChance}. Must be positive.`);
    }

    // Check growth probability
    const growthChance = 1 / growChance;
    if (Math.random() > growthChance) {
      return;
    }

    // Get current age
    const age = CropBlockUtils.getAge(block, params.max_age);

    // Skip if mature
    if (age >= params.max_age - 1) {
      return;
    }

    // Increment age safely
    CropBlockUtils.setAge(block, age + 1, params.max_age);
  }
}
