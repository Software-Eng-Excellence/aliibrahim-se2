import { promises as fs } from 'fs';
import { readXMLFile, writeXMLFile } from '../src/parsers/xmlParser';

describe('XML Parser', () => {
  const testFilePath = './tests/test.xml';

  describe('readXMLFile', () => {
    beforeEach(async () => {
      const xmlContent = `<root>
  <name>Test</name>
  <value>42</value>
</root>`;
      await fs.writeFile(testFilePath, xmlContent, 'utf-8');
    });

    it('should read XML file correctly', async () => {
      expect(await readXMLFile(testFilePath)).toEqual({
        root: {
          name: 'Test',
          value: 42,
        },
      });
    });

    it('should throw an error when the file does not exist', async () => {
      await expect(readXMLFile('./tests/missing.xml')).rejects.toThrow(
        'Error reading XML file',
      );
    });

    it('should handle nested XML correctly', async () => {
      const nestedXmlContent = `<root>
  <book>
    <title>Dune</title>
    <details>
      <author>Frank Herbert</author>
      <year>1965</year>
    </details>
  </book>
</root>`;
      await fs.writeFile(testFilePath, nestedXmlContent, 'utf-8');

      expect(await readXMLFile(testFilePath)).toEqual({
        root: {
          book: {
            title: 'Dune',
            details: {
              author: 'Frank Herbert',
              year: 1965,
            },
          },
        },
      });
    });

    it('should handle XML with multiple sibling elements', async () => {
      const siblingXmlContent = `<root>
  <item>
    <name>Item 1</name>
    <value>10</value>
  </item>
  <item>
    <name>Item 2</name>
    <value>20</value>
  </item>
</root>`;
      await fs.writeFile(testFilePath, siblingXmlContent, 'utf-8');

      expect(await readXMLFile(testFilePath)).toEqual({
        root: {
          item: [
            { name: 'Item 1', value: 10 },
            { name: 'Item 2', value: 20 },
          ],
        },
      });
    });

    it('should throw for malformed XML', async () => {
      const malformedXmlContent = `<root>
  <name>Test</name>
  <value>42</value>`;
      await fs.writeFile(testFilePath, malformedXmlContent, 'utf-8');

      await expect(readXMLFile(testFilePath)).rejects.toThrow(
        'Error reading XML file',
      );
    });

    it('should throw for truncated XML', async () => {
      const truncatedXmlContent = `<root>
  <name>Test</name>
  <value>`;
      await fs.writeFile(testFilePath, truncatedXmlContent, 'utf-8');

      await expect(readXMLFile(testFilePath)).rejects.toThrow(
        'Error reading XML file',
      );
    });
  });

  describe('writeXMLFile', () => {
    beforeEach(async () => {
      await fs.unlink(testFilePath).catch(() => {});
    });

    it('should write XML file correctly', async () => {
      const data = {
        root: {
          name: 'New Test',
          value: 100,
        },
      };

      await writeXMLFile(testFilePath, data);
      const fileContent = await fs.readFile(testFilePath, 'utf-8');

      expect(fileContent).toContain('<name>New Test</name>');
      expect(fileContent).toContain('<value>100</value>');
    });

    it('should overwrite an existing XML file', async () => {
      const initialData = {
        root: {
          name: 'Initial',
          value: 1,
        },
      };

      const updatedData = {
        root: {
          name: 'Updated',
          value: 999,
        },
      };

      await writeXMLFile(testFilePath, initialData);
      await writeXMLFile(testFilePath, updatedData);

      const fileContent = await fs.readFile(testFilePath, 'utf-8');

      expect(fileContent).toContain('<name>Updated</name>');
      expect(fileContent).toContain('<value>999</value>');
      expect(fileContent).not.toContain('<name>Initial</name>');
    });

    it('should throw when writing to an invalid path', async () => {
      const data = {
        root: {
          name: 'Test',
          value: 42,
        },
      };

      await expect(
        writeXMLFile('/invalid/path/test.xml', data),
      ).rejects.toThrow('Error writing XML file');
    });
  });
});
