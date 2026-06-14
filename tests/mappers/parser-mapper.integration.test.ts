// this test file is for testing the integration of parsers and mappers for the Cake entity. It ensures that the data read from CSV, JSON, and XML files can be correctly mapped to Cake objects using the respective mappers.

import fs from 'fs';
import path from 'path';

import {
  CSVCakeMapper,
  JSONCakeMapper,
  XMLCakeMapper,
} from '../../src/mappers/Cake.mapper';

import { readCSVFile, writeCSVFile } from '../../src/parsers/csvParser';
import { readJSONFile, writeJSONFile } from '../../src/parsers/jsonParser';
import { readXMLFile, writeXMLFile } from '../../src/parsers/xmlParser';

const tempDir = path.join(__dirname, 'temp');

beforeAll(() => {
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
  }
});

afterAll(() => {
  fs.rmSync(tempDir, { recursive: true, force: true });
});
describe('Cake parsing + mapper integration', () => {
  it('handles CSV file', async () => {
    const filePath = path.join(tempDir, 'cake.csv');

    const csvContent = [
      [
        'id',
        'type',
        'flavor',
        'filling',
        'size',
        'layers',
        'frostingType',
        'frostingFlavor',
        'decorationType',
        'decorationColor',
        'customMessage',
        'shape',
        'allergies',
        'specialIngredients',
        'packagingType',
      ],
      [
        '1',
        'Birthday',
        'Chocolate',
        'Cream',
        '8',
        '2',
        'Buttercream',
        'Vanilla',
        'Sprinkles',
        'Pink',
        'Happy Birthday',
        'Round',
        'Nuts',
        'Strawberries',
        'Box',
      ],
    ];

    await writeCSVFile(filePath, csvContent);

    const parsed = await readCSVFile(filePath);
    const cake = new CSVCakeMapper().map(parsed[0]);

    expect(cake.getType()).toBe('Birthday');
    expect(cake.getFrostingFlavor()).toBe('Vanilla');
    expect(cake.getSpecialIngredients()).toBe('Strawberries');
    expect(cake.getShape()).toBe('Round');
    expect(cake.getAllergies()).toBe('Nuts');
    expect(cake.getCustomMessage()).toBe('Happy Birthday');
    expect(cake.getDecorationColor()).toBe('Pink');
    expect(cake.getDecorationType()).toBe('Sprinkles');
    expect(cake.getFrostingType()).toBe('Buttercream');
    expect(cake.getLayers()).toBe(2);
    expect(cake.getSize()).toBe(8);
    expect(cake.getFilling()).toBe('Cream');
    expect(cake.getFlavor()).toBe('Chocolate');
    expect(cake.getPackagingType()).toBe('Box');
    expect(cake.getCategory()).toBe(0);
  });

  it('handles JSON file', async () => {
    const filePath = path.join(tempDir, 'cake.json');

    await writeJSONFile(filePath, {
      type: 'Birthday',
      flavor: 'Chocolate',
      filling: 'Cream',
      size: 8,
      layers: 2,
      frostingType: 'Buttercream',
      frostingFlavor: 'Vanilla',
      decorationType: 'Sprinkles',
      decorationColor: 'Pink',
      customMessage: 'Happy Birthday',
      shape: 'Round',
      allergies: 'Nuts',
      specialIngredients: 'Strawberries',
      packagingType: 'Box',
    });

    const parsed = await readJSONFile(filePath);
    const cake = new JSONCakeMapper().map(parsed);

    expect(cake.getFlavor()).toBe('Chocolate');
  });

  it('handles XML file', async () => {
    const filePath = path.join(tempDir, 'cake.xml');

    await writeXMLFile(filePath, {
      cake: {
        type: 'Birthday',
        flavor: 'Chocolate',
        filling: 'Cream',
        size: 8,
        layers: 2,
        frostingType: 'Buttercream',
        frostingFlavor: 'Vanilla',
        decorationType: 'Sprinkles',
        decorationColor: 'Pink',
        customMessage: 'Happy Birthday',
        shape: 'Round',
        allergies: 'Nuts',
        specialIngredients: 'Strawberries',
        packagingType: 'Box',
      },
    });

    const parsed = await readXMLFile(filePath);
    const cake = new XMLCakeMapper().map(parsed.cake);

    expect(cake.getType()).toBe('Birthday');
  });
});
