import { CSVCakeMapper } from '../../mappers/Cake.mapper';
import { CSVOrderMapper } from '../../mappers/Order.mapper';
import { IOrder } from '../../model/IOrder';
import { readCSVFile, writeCSVFile } from '../../parsers/csvParser';
import { OrderRepository } from './Order.repository';

export class CakeOrderRepository extends OrderRepository {
  private mapper = new CSVOrderMapper(new CSVCakeMapper());
  constructor(private readonly filePath: string) {
    super();
  }
  protected async load(): Promise<IOrder[]> {
    // read 2d strings from file
    const csv = await readCSVFile(this.filePath);
    // convert the string array into an object using mapper
    // return the list of objects
    return csv.map(this.mapper.map.bind(this.mapper));
  }
  protected async save(orders: IOrder[]): Promise<void> {
    const header: string[] = [
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
    ];
    // covert the list of objects into a 2d array using mapper
    const csv = orders.map((order) => this.mapper.reverse(order));
    await writeCSVFile(this.filePath, [header, ...csv]);
  }
}
