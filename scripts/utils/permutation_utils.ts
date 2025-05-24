import { Block, World } from "@minecraft/server";
import { BlockStateSuperset } from "@minecraft/vanilla-data";

export enum CustomStateSet {
  CROP_AGE = `crs_green:crop_age`,
}

/**
 * A utility class for manipulating block states in Minecraft Bedrock Edition.
 * Provides methods to retrieve and set block state values for a given block using
 * either custom state names defined in `CustomStateSet` or standard state names
 * from `BlockStateSuperset`.
 */
export class BlockStateUtils {
  /**
   * Retrieves the value of a specified block state for a given block.
   * @param block - The block instance to query for the state value.
   * @param state_name - The name of the block state to retrieve, either from `CustomStateSet` enum or a key of `BlockStateSuperset`.
   * @returns The value of the block state as a `number`, `string`, or `boolean`.
   * @throws {Error} If the state name is invalid or not found for the block at the specified location.
   * @remarks
   * - Uses `block.permutation.getState` to access the state value.
   * - Logs an error to the console if the state is invalid or not found.
   * @example
   * ```typescript
   * import { CustomStateSet } from "./enums";
   * const facing = BlockStateUtils.getState(block, CustomStateSet.FacingDirection);
   * console.log(facing); // Outputs: e.g., 2 (north)
   * ```
   */
  static getState(block: Block, state_name: CustomStateSet | keyof BlockStateSuperset): number | string | boolean {
    const value = block.permutation.getState(state_name as any);

    if (typeof value === "number") {
      return value as number;
    } else if (typeof value === "string") {
      return value as string;
    } else if (typeof value === "boolean") {
      World
      return value as boolean;
    } else {
      throw new Error(`Invalid state '${state_name}' at ${block.location.x}, ${block.location.y}, ${block.location.z}`);
    }
  }

  /**
   * Retrieves the value of a specified block state as an integer.
   * @param block - The block instance to query for the state value.
   * @param state_name - The name of the block state to retrieve, either from `CustomStateSet` enum or a key of `BlockStateSuperset`.
   * @returns The integer value of the block state.
   * @throws {Error} If the state is not a valid integer or is invalid for the block.
   * @example
   * ```typescript
   * import { CustomStateSet } from "./enums";
   * const facing = BlockStateUtils.getInt(block, CustomStateSet.FacingDirection);
   * console.log(facing); // Outputs: e.g., 2
   * ```
   */
  static getInt(block: Block, state_name: CustomStateSet | keyof BlockStateSuperset): number {
    const value = this.getState(block, state_name);
    if (typeof value === "number" && Number.isInteger(value)) {
      return value;
    } else {
      throw new Error(`Expected integer for '${state_name}', received: ${value}`);
    }
  }

  /**
   * Retrieves the value of a specified block state as a string.
   * @param block - The block instance to query for the state value.
   * @param state_name - The name of the block state to retrieve, either from `CustomStateSet` enum or a key of `BlockStateSuperset`.
   * @returns The string value of the block state.
   * @throws {Error} If the state is not a valid string or is invalid for the block.
   * @example
   * ```typescript
   * import { CustomStateSet } from "./enums";
   * const color = BlockStateUtils.getString(block, CustomStateSet.Color);
   * console.log(color); // Outputs: e.g., "red"
   * ```
   */
  static getString(block: Block, state_name: CustomStateSet | keyof BlockStateSuperset): string {
    const value = this.getState(block, state_name);
    if (typeof value === "string") {
      return value;
    } else {
      throw new Error(`Expected string for '${state_name}', received: ${value}`);
    }
  }

  /**
   * Retrieves the value of a specified block state as a boolean.
   * @param block - The block instance to query for the state value.
   * @param state_name - The name of the block state to retrieve, either from `CustomStateSet` enum or a key of `BlockStateSuperset`.
   * @returns The boolean value of the block state.
   * @throws {Error} If the state is not a valid boolean or is invalid for the block.
   * @example
   * ```typescript
   * import { CustomStateSet } from "./enums";
   * const isOpen = BlockStateUtils.getBool(block, CustomStateSet.Open);
   * console.log(isOpen); // Outputs: e.g., true
   * ```
   */
  static getBool(block: Block, state_name: CustomStateSet | keyof BlockStateSuperset): boolean {
    const value = this.getState(block, state_name);
    if (typeof value === "boolean") {
      return value;
    } else {
      throw new Error(`Expected boolean for '${state_name}', received: ${value}`);
    }
  }

  /**
   * Sets the value of a specified block state for a given block.
   * @param block - The block instance to modify.
   * @param state_name - The name of the block state to set, either from `CustomStateSet` enum or a key of `BlockStateSuperset`.
   * @param value - The value to set for the block state, which must be a `string`, `boolean`, or integer `number`.
   * @returns `true` if the state was set successfully, `false` otherwise.
   * @throws {Error} If the value is a non-integer number or if the state cannot be set.
   * @remarks
   * - The block must be valid (i.e., not unloaded or out of bounds).
   * - Non-integer numbers are rejected with an error.
   * - Errors during state setting are logged to the console.
   * - Uses `block.setPermutation` to apply the new state value.
   * @example
   * ```typescript
   * import { CustomStateSet } from "./enums";
   * const success = BlockStateUtils.setState(block, CustomStateSet.FacingDirection, 3);
   * console.log(success); // Outputs: true if set, false if failed
   * ```
   */
  static setState(
    block: Block,
    state_name: CustomStateSet | keyof BlockStateSuperset,
    value: string | boolean | number
  ): boolean {
    if (block.isValid) {
      try {
        if (typeof value === "number" && !Number.isInteger(value)) {
          throw new Error(`Expected integer for '${state_name}', received: ${value}`);
        }

        block.setPermutation(block.permutation.withState(state_name as any, value));

        return true;
      } catch (error: unknown) {
        const errorMsg: string = error instanceof Error ? (error.message ?? "Unknown error") : "Unknown error";
        console.warn(errorMsg);
        return false;
      }
    } else {
      return false;
    }
  }
}

/**
 * A utility class for block permutation-related operations.
 * @remarks
 * Currently empty; intended for future utilities related to block permutations.
 */
export class PermutationUtils {}
