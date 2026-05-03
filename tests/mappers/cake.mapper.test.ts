// this test file is for testing the validation logic in the Cake mappers.
//  It ensures that when invalid data is provided to the mappers,
// no need to test happy paths here since those are covered in the parser-mapper.integration.test.ts.
import {
  CSVCakeMapper,
  JSONCakeMapper,
  XMLCakeMapper,
} from '../../src/mappers/Cake.mapper';

describe('Mapper validation errors (bad data)', () => {
  it('throws for missing JSON field', () => {
    const parsed = { flavor: 'Chocolate' };

    expect(() => new JSONCakeMapper().map(parsed)).toThrow();
  });

  it('throws for invalid JSON number', () => {
    const parsed = { type: 'Birthday', size: 'bad' };

    expect(() => new JSONCakeMapper().map(parsed)).toThrow();
  });

  it('throws for incomplete CSV row', () => {
    const row = ['1', 'Birthday'];

    expect(() => new CSVCakeMapper().map(row)).toThrow();
  });

  it('throws for empty XML object', () => {
    expect(() => new XMLCakeMapper().map({})).toThrow();
  });

  it('throws for empty JSON object', () => {
    expect(() => new JSONCakeMapper().map({})).toThrow();
  });

  it('throws when XML numeric field is invalid', () => {
    const parsed = {
      cake: {
        type: 'Birthday',
        size: 'wrong',
      },
    };

    expect(() => new XMLCakeMapper().map(parsed.cake)).toThrow();
  });

  it('throws when XML is missing required field', () => {
    const parsed = {
      cake: {
        flavor: 'Chocolate',
      },
    };

    expect(() => new XMLCakeMapper().map(parsed.cake)).toThrow();
  });

  it('throws for invalid CSV numeric field', () => {
    const row = [
      '1',
      'Birthday',
      'Chocolate',
      'Cream',
      'bad',
      '2',
      'Buttercream',
      'Vanilla',
      'Sprinkles',
      'Pink',
      'msg',
      'Round',
      'Nuts',
      'Strawberries',
      'Box',
      '25.5',
      '1',
    ];

    expect(() => new CSVCakeMapper().map(row)).toThrow();
  });
});
