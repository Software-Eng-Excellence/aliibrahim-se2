import { readJSONFile, writeJSONFile } from '../src/parsers/jsonParser';
import { promises as fs } from 'fs';
// mock test to check valid file
describe('JSON Parser', () => {
  const testFilePath = './tests/test.json';
  const testData = { name: 'Test', value: 42 };

  beforeEach(async () => {
    // Ensure the test file is reset before each test
    await fs.writeFile(testFilePath, JSON.stringify(testData), 'utf-8');
  });
  it('should read JSON file correctly', async () => {
    // Act
    const data = await readJSONFile(testFilePath);
    // Assert
    expect(data).toEqual(testData);
  });
  it('should write JSON file correctly', async () => {
    // Arrange
    const newData = { name: 'New Test', value: 100 };
    // Act
    await writeJSONFile(testFilePath, newData);
    const fileContent = await fs.readFile(testFilePath, 'utf-8');
    // Assert
    expect(JSON.parse(fileContent)).toEqual(newData);
  });
});
// mock test to check invalid file
describe('JSON Parser - Invalid File', () => {
  const invalidFilePath = './tests/invalid.json';
  beforeEach(async () => {
    // Create an invalid JSON file
    await fs.writeFile(invalidFilePath, 'This is not a valid JSON', 'utf-8');
  });
  it('should throw an error when reading invalid JSON file', async () => {
    // Act & Assert
    await expect(readJSONFile(invalidFilePath)).rejects.toThrow();
  });
  it('should throw an error when writing to an invalid path', async () => {
    // Act & Assert
    await expect(
      writeJSONFile('/invalid/path/test.json', { test: 'data' }),
    ).rejects.toThrow();
  });
});
