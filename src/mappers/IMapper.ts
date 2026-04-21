import { Cake } from '../model/Cake.model';

export interface IMapper<T, U> {
  map(data: T): U;
}
