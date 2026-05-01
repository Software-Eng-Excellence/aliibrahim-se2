import { promises as fs } from 'fs';
import { parse as csvParse } from 'csv-parse';
import { stringify as csvStringify } from 'csv-stringify';
/**
 * Reads a CSV file and returns its contents as a 2D array of strings
 * @param filePath - Path to the CSV file
 * @param includeHeaders - Whether to include the header row in the output (default: false)
 * @returns Promise<string[][]> - 2D array of strings
 */
export async function readCSVFile(
  filePath: string,
  includeHeaders: boolean = false,
): Promise<string[][]> {
  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');

    return new Promise((resolve, reject) => {
      csvParse(
        fileContent,
        {
          trim: true,
          skip_empty_lines: true,
        },
        (err, records: string[][]) => {
          if (!records || records.length === 0) {
            return reject(new Error('CSV file contains no data rows'));
          }
          if (err) return reject(err);
          if (!includeHeaders) {
            records.shift(); // Remove the header row if not included
          }
          resolve(records);
        },
      );
    });
  } catch (error) {
    throw new Error(`Error reading CSV file: ${error}`);
  }
}

/**
 * Writes a 2D array of strings to a CSV file
 * @param filePath - Path where the CSV file should be written
 * @param data - 2D array of strings to write
 * @returns Promise<void>
 */
export async function writeCSVFile(
  filePath: string,
  data: string[][],
): Promise<void> {
  try {
    const csvContent = await new Promise<string>((resolve, reject) => {
      csvStringify(data, (err, output) => {
        if (err) return reject(err);
        resolve(output);
      });
    });
    await fs.writeFile(filePath, csvContent, 'utf-8');
  } catch (error) {
    throw new Error(`Error writing CSV file: ${error}`);
  }
}
