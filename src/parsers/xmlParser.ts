import { promises as fs } from 'fs';
import { XMLParser } from 'fast-xml-parser';

/****
 * Reads an XML file and returns its contents as a JavaScript object
 * @param filePath - Path to the XML file
 * @returns Promise<any> - Parsed XML object
 * @throws Error if the file cannot be read or parsed
 */
export async function readXMLFile(filePath: string): Promise<any> {
  try {
    const xmlData = await fs.readFile(filePath, 'utf-8');
    const parser = new XMLParser();
    return parser.parse(xmlData);
  } catch (error) {
    throw new Error(`Error reading XML file: ${error}`);
  }
}

/***
 * Writes a JavaScript object to an XML file
 * @param filePath - Path where the XML file should be written
 * @param data - Object to write to the XML file
 * @returns Promise<void>
 * @throws Error if the file cannot be written  or if the data cannot be converted to XML
 */
export async function writeXMLFile(filePath: string, data: any): Promise<void> {
  try {
    const parser = new XMLParser();
    const xmlContent = parser.parse(data);
    await fs.writeFile(filePath, xmlContent, 'utf-8');
  } catch (error) {
    throw new Error(`Error writing XML file: ${error}`);
  }
}
