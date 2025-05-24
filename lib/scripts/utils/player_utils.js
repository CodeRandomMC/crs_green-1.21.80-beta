import { EquipmentSlot } from "@minecraft/server";
/**
 * Utility class for common player-related operations in Minecraft.
 */
export class PlayerUtils {
    /**
     * Retrieves the specified equipment slot for a player.
     * @param player - The player to query.
     * @param slot - The equipment slot to retrieve (e.g., Mainhand, Offhand).
     * @returns The ContainerSlot for the specified equipment slot, or undefined if retrieval fails.
     * @throws Error if the slot is invalid.
     */
    static getEquipmentSlot(player, slot) {
        try {
            if (!player) {
                throw new Error("Player must be defined to retrieve equipment slot.");
            }
            // Validate slot enum
            const validSlots = [
                EquipmentSlot.Mainhand,
                EquipmentSlot.Offhand,
                EquipmentSlot.Head,
                EquipmentSlot.Chest,
                EquipmentSlot.Legs,
                EquipmentSlot.Feet
            ];
            if (!validSlots.includes(slot)) {
                throw new Error(`Invalid equipment slot: ${slot}`);
            }
            const equippable = player.getComponent("minecraft:equippable");
            if (!equippable) {
                throw new Error(`Failed to get 'minecraft:equippable' component for player: ${player.name || "Unknown"}`);
            }
            const equipmentSlot = equippable.getEquipmentSlot(slot);
            if (!equipmentSlot) {
                console.warn(`Equipment slot ${slot} not found for player: ${player.name || "Unknown"}`);
                return undefined;
            }
            return equipmentSlot;
        }
        catch (error) {
            console.error(`Error in getEquipmentSlot for player ${(player === null || player === void 0 ? void 0 : player.name) || "Unknown"}: ${error}`);
            return undefined;
        }
    }
}
//# sourceMappingURL=player_utils.js.map