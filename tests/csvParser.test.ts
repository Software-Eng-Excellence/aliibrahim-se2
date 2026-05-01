import { readCSVFile, writeCSVFile } from '../src/parsers/csvParser';
import { promises as fs } from 'fs';

describe('CSV Parser', () => {
  afterEach(async () => {
    await Promise.all([
      fs.unlink('./tests/test.csv').catch(() => {}),
      fs.unlink('./tests/invalid.csv').catch(() => {}),
      fs.unlink('./tests/newTest.csv').catch(() => {}),
    ]);
  });

  describe('readCSVFile', () => {
    beforeEach(async () => {
      const csvContent = `name,value
Test,42`;
      await fs.writeFile('./tests/test.csv', csvContent, 'utf-8');
    });

    it('should read CSV correctly without headers', async () => {
      expect(await readCSVFile('./tests/test.csv')).toEqual([['Test', '42']]);
    });

    it('should read CSV correctly with headers', async () => {
      expect(await readCSVFile('./tests/test.csv', true)).toEqual([
        ['name', 'value'],
        ['Test', '42'],
      ]);
    });

    it('should throw when file does not exist', async () => {
      await expect(readCSVFile('./tests/missing.csv')).rejects.toThrow(
        'Error reading CSV file',
      );
    });

    it('should handle empty CSV file', async () => {
      await fs.writeFile('./tests/test.csv', '', 'utf-8');

      await expect(readCSVFile('./tests/test.csv')).rejects.toThrow(
        'CSV file contains no data rows',
      );
    });

    it('should handle CSV with multiple rows', async () => {
      const csvContent = `name,value
A,1
B,2`;
      await fs.writeFile('./tests/test.csv', csvContent, 'utf-8');

      expect(await readCSVFile('./tests/test.csv')).toEqual([
        ['A', '1'],
        ['B', '2'],
      ]);
    });

    it('should handle CSV with missing values', async () => {
      const csvContent = `name,value
A,
B,2`;
      await fs.writeFile('./tests/test.csv', csvContent, 'utf-8');

      expect(await readCSVFile('./tests/test.csv')).toEqual([
        ['A', ''],
        ['B', '2'],
      ]);
    });
  });

  describe('writeCSVFile', () => {
    beforeEach(async () => {
      await fs.unlink('./tests/test.csv').catch(() => {});
    });

    it('should write CSV correctly', async () => {
      const data = [
        ['name', 'value'],
        ['Test', '42'],
      ];

      await writeCSVFile('./tests/newTest.csv', data);
      const fileContent = await fs.readFile('./tests/newTest.csv', 'utf-8');

      expect(fileContent).toContain('name,value');
      expect(fileContent).toContain('Test,42');
    });

    it('should overwrite existing CSV file', async () => {
      const initialData = [
        ['name', 'value'],
        ['Initial', '1'],
      ];

      const updatedData = [
        ['name', 'value'],
        ['Updated', '99'],
      ];

      await writeCSVFile('./tests/test.csv', initialData);
      await writeCSVFile('./tests/test.csv', updatedData);

      const fileContent = await fs.readFile('./tests/test.csv', 'utf-8');

      expect(fileContent).toContain('Updated,99');
      expect(fileContent).not.toContain('Initial,1');
    });

    it('should throw when writing to an invalid path', async () => {
      const data = [['name', 'value']];

      await expect(
        writeCSVFile('/invalid/path/test.csv', data),
      ).rejects.toThrow('Error writing CSV file');
    });
  });
});
