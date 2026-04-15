import { readJSONFile, writeJSONFile } from '../src/parsers/jsonParser';
import { promises as fs } from 'fs';
describe('JSON Parser', () => {
  afterEach(async () => {
    await Promise.all([
      fs.unlink('./tests/test.json').catch(() => {}),
      fs.unlink('./tests/invalid.json').catch(() => {}),
      fs.unlink('./tests/truncated.json').catch(() => {}),
      fs.unlink('./tests/newTest.json').catch(() => {}),
    ]);
  });
  describe('readJSONFile', () => {
    beforeEach(async () => {
      const jsonData = { name: 'Test', value: 42 };
      await fs.writeFile(
        './tests/test.json',
        JSON.stringify(jsonData),
        'utf-8',
      );
    });
    it('should read valid JSON correctly', async () => {
      // Act & Assert
      expect(await readJSONFile('./tests/test.json')).toEqual({
        name: 'Test',
        value: 42,
      });
    });

    it('should throw when file does not exist', async () => {
      // Act & Assert
      await expect(readJSONFile('./tests/missing.json')).rejects.toThrow(
        'Error reading JSON file',
      );
    });

    it('should throw for invalid JSON', async () => {
      // Arrange
      const invalidContent = `{"name": "Test", "value": 42,}`;
      await fs.writeFile('./tests/invalid.json', invalidContent, 'utf-8');
      // Act & Assert
      await expect(readJSONFile('./tests/invalid.json')).rejects.toThrow(
        'Error reading JSON file',
      );
    });
    it('should throw for truncated JSON', async () => {
      // Arrange
      const truncatedContent = `{"name": "Test", "value": 42`;
      await fs.writeFile('./tests/truncated.json', truncatedContent, 'utf-8');
      // Act & Assert
      await expect(readJSONFile('./tests/truncated.json')).rejects.toThrow(
        'Error reading JSON file',
      );
    });
  });

  describe('writeJSONFile', () => {
    beforeEach(async () => {
      // Clean up any existing test files before each test
      await Promise.all([fs.unlink('./tests/test.json').catch(() => {})]);
    });

    it('should write JSON correctly', async () => {
      // Arrange
      const data = { name: 'New Test', value: 100 };
      const filePath = './tests/newTest.json';
      // Act
      await writeJSONFile(filePath, data);
      const fileContent = await fs.readFile(filePath, 'utf-8');
      // Assert
      expect(JSON.parse(fileContent)).toEqual(data);
    });

    it('should overwrite existing JSON file', async () => {
      // Arrange
      const initialData = { name: 'Initial Test', value: 50 };
      const updatedData = { name: 'Updated Test', value: 200 };
      const filePath = './tests/test.json';
      await writeJSONFile(filePath, initialData);
      // Act
      await writeJSONFile(filePath, updatedData);
      const fileContent = await fs.readFile(filePath, 'utf-8');
      //Assert
      expect(JSON.parse(fileContent)).toEqual(updatedData);
    });
    it('should throw when writing to an invalid path', async () => {
      // Arrange
      const data = { name: 'Test', value: 42 };
      const invalidPath = '/invalid/path/test.json';
      // Act & Assert
      await expect(writeJSONFile(invalidPath, data)).rejects.toThrow(
        'Error writing JSON file',
      );
    });
  });
});
