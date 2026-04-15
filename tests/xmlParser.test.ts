import { promises as fs } from 'fs';
import { readXMLFile, writeXMLFile } from '../src/parsers/xmlParser';

describe('XML Parser', () => {
  const testFilePath = './tests/test.xml';

  describe('readXMLFile', () => {
    beforeEach(async () => {
      const xmlContent = `<root><name>Test</name><value>42</value></root>`;
      await fs.writeFile(testFilePath, xmlContent, 'utf-8');
    });

    it('should read XML file correctly', async () => {
      const data = await readXMLFile(testFilePath);

      expect(data).toEqual({
        root: { name: 'Test', value: '42' },
      });
    });

    it('should throw an error when the file does not exist', async () => {
      await expect(readXMLFile('./tests/missing.xml')).rejects.toThrow(
        'Error reading XML file',
      );
    });
  });

  describe('writeXMLFile', () => {
    it('should write XML file correctly', async () => {
      const newData = { root: { name: 'New Test', value: 100 } };

      await writeXMLFile(testFilePath, newData);
      const fileContent = await fs.readFile(testFilePath, 'utf-8');

      expect(fileContent).toContain('<name>New Test</name>');
      expect(fileContent).toContain('<value>100</value>');
    });

    it('should throw an error when writing to an invalid path', async () => {
      await expect(
        writeXMLFile('/invalid/path/test.xml', { test: 'data' }),
      ).rejects.toThrow();
    });
  });
});
