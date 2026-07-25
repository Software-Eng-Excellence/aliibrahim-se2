import { ToyRepository } from '../../src/repository/postgresql/Toy.order.repository'; // Update path as needed
import { ConnectionManager } from '../../src/repository/postgresql/ConnectionManager';
import {
  IdentifiableToyBuilder,
  ToyBuilder,
} from '../../src/model/builders/Toy.builder';
import { ItemNotFoundException } from '../../src/util/exceptions/repostiroyException';

// These tests hit a real Postgres database (DATABASE_URL) and are skipped
// in CI, where no such database is available; run them locally with a .env.
const describeIfDb = process.env.DATABASE_URL ? describe : describe.skip;

describeIfDb('ToyRepository - Streamlined Integration Tests', () => {
  let repository: ToyRepository;
  let pool: ReturnType<typeof ConnectionManager.getPool>;

  beforeAll(async () => {
    pool = ConnectionManager.getPool();
    repository = new ToyRepository();
    jest.setTimeout(15000);
    await repository.init();
  });

  afterAll(async () => {
    await pool.end();
  });

  /**
   * Helper utility to spin up a clean Toy entity structure with all domain fields
   */
  function createMockToy() {
    return IdentifiableToyBuilder.newBuilder()
      .setToy(
        ToyBuilder.newBuilder()
          .setToyType('Action Figure')
          .setAgeGroup('8-12 Years')
          .setBrand('TechToys Ltd')
          .setMaterial('ABS Plastic')
          .setBatteryRequired(true)
          .setEducational(true)
          .build(),
      )
      .build();
  }

  // --- SINGLE LEAN LIFECYCLE TARGETING TOY PROPERTIES ---
  it('should successfully pass a toy through the entire CRUD lifecycle, validating all toy-specific fields', async () => {
    const mockToy = createMockToy();

    // 1. Create Execution
    const createdId = await repository.create(mockToy);
    expect(createdId).toBe(mockToy.getId());

    // 2. Read Execution: Verify every toy-specific property maps correctly from PostgreSQL
    const fetchedToy = await repository.get(createdId);
    expect(fetchedToy.getId()).toBe(createdId);
    expect(fetchedToy.getBrand()).toBe('TechToys Ltd');
    expect(fetchedToy.getToyType()).toBe('Action Figure');
    expect(fetchedToy.getMaterial()).toBe('ABS Plastic');
    expect(fetchedToy.getAgeGroup()).toBe('8-12 Years');
    expect(fetchedToy.isBatteryRequired()).toBe(true);
    expect(fetchedToy.isEducational()).toBe(true);

    // 3. Update Execution: Mutate specific properties to check update paths
    const updatedToy = IdentifiableToyBuilder.newBuilder()
      .setId(createdId)
      .setToy(
        ToyBuilder.newBuilder()
          .setBrand('TechToys Ltd')
          .setToyType('Action Figure')
          .setMaterial('Recycled Plastic') // Mutated field
          .setAgeGroup('8-12 Years')
          .setBatteryRequired(false) // Mutated field
          .setEducational(false) // Mutated field
          .build(),
      )
      .build();

    await repository.update(updatedToy);

    // Verify changes applied perfectly
    const verifiedMutation = await repository.get(createdId);
    expect(verifiedMutation.isBatteryRequired()).toBe(false);
    expect(verifiedMutation.isEducational()).toBe(false);

    // 4. Delete Execution: Tear down the record cleanly
    await repository.delete(createdId);

    // 5. Final Empty Verification Check
    await expect(repository.get(createdId)).rejects.toThrow(
      ItemNotFoundException,
    );
  });
});
