import { promises as fs } from 'fs';
/**
 * Reads a JSON file and returns its contents as an object
 * @param filePath - Path to the JSON file
 * @returns Promise<any> - Parsed JSON object
 */
export async function readJSONFile(filePath: string): Promise<any> {
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    throw new Error(`Error reading JSON file: ${error}`);
  }
}
/**
 * Writes an object to a JSON file
 * @param filePath - Path where the JSON file should be written
 * @param data - Object to write to the JSON file
 * @returns Promise<void>
 */

export async function writeJSONFile(
  filePath: string,
  data: any,
): Promise<void> {
  try {
    const jsonContent = JSON.stringify(data, null, 2); // Pretty print with 2 spaces
    await fs.writeFile(filePath, jsonContent, 'utf-8');
  } catch (error) {
    throw new Error(`Error writing JSON file: ${error}`);
  }
}
