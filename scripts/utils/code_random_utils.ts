export class CRUtils {
  /**
   * Generates a random integer between min and max (inclusive).
   * @param min - The minimum integer.
   * @param max - The maximum integer.
   * @returns A random integer in the range [min, max].
   */
  static randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}
