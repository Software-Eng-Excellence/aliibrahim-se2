export interface IMapper<T, U> {
  map(data: T): U;
  reverse(data: U): T;
}
