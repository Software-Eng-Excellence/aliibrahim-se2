import { MapperFactory } from '../../src/mappers/Mapper.factory';
import { ItemCategory } from '../../src/model/IItem';
import { PostgresCakeMapper } from '../../src/mappers/Cake.mapper';
import { PostgresBookMapper } from '../../src/mappers/Book.mapper';
import { PostgresToyMapper } from '../../src/mappers/Toy.mapper';

describe('MapperFactory', () => {
  it('should return PostgresCakeMapper for CAKE', () => {
    expect(MapperFactory.create(ItemCategory.CAKE)).toBeInstanceOf(
      PostgresCakeMapper,
    );
  });

  it('should return PostgresBookMapper for BOOK', () => {
    expect(MapperFactory.create(ItemCategory.BOOK)).toBeInstanceOf(
      PostgresBookMapper,
    );
  });

  it('should return PostgresToyMapper for TOY', () => {
    expect(MapperFactory.create(ItemCategory.TOY)).toBeInstanceOf(
      PostgresToyMapper,
    );
  });

  it('should throw an error for an unsupported category', () => {
    expect(() => MapperFactory.create('INVALID' as ItemCategory)).toThrow(
      'Unsupported mapper category',
    );
  });
});
