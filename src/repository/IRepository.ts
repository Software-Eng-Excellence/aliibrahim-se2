export type id = string;

export interface ID {
  getId(): id;
}
export interface IRepository<T extends ID> {
  /**
   * Creates a new item in the repository and returns the created item's identifier.
   *
   * @param item - The item to create. Must conform to the repository's item type T.
   * @returns A promise that resolves to an ID object for the created item.
   * @throws {InvalidItemException} When the provided item is invalid (validation failed).
   * @throws {RepositoryException} When an unexpected repository error occurs (e.g. DB failure).
   */
  create(item: T): Promise<id>;

  /**
   * Retrieves an item by its identifier.
   *
   * @param id - The identifier object of the item to retrieve. Typically contains an `id` string.
   * @returns A promise that resolves to the requested item of type T.
   * @throws {ItemNotFoundException} When no item with the given id exists in the repository.
   * @throws {RepositoryException} When an unexpected repository error occurs.
   */
  get(id: id): Promise<T>;

  /**
   * Retrieves all items from the repository.
   *
   * @returns A promise that resolves to an array of items of type T. Returns an empty array if none exist.
   * @throws {RepositoryException} When an unexpected repository error occurs.
   */
  getAll(): Promise<T[]>;

  /**
   * Updates an existing item in the repository.
   *
   * @param item - The item to update. The item's `id` field identifies which record to update.
   * @returns A promise that resolves when the update is complete.
   * @throws {InvalidItemException} When the provided item is invalid for update.
   * @throws {ItemNotFoundException} When no item with the given id exists to update.
   * @throws {RepositoryException} When an unexpected repository error occurs.
   */
  update(item: T): Promise<void>;

  /**
   * Deletes an item from the repository by its identifier.
   *
   * @param id - The identifier object of the item to delete.
   * @returns A promise that resolves when the deletion is complete.
   * @throws {ItemNotFoundException} When no item with the given id exists to delete.
   * @throws {RepositoryException} When an unexpected repository error occurs.
   */
  delete(id: id): Promise<void>;
}
