import { OrderManagement, Validator, FinancialCalculator, Order } from '@/app';
describe('OrderManagement', () => {
  // before all, new validator and calculator instances
  // before each, create a new OrderManagement instance

  let validator: Validator;
  let calc: FinancialCalculator;
  let orderManagement: OrderManagement;
  let basevalidator: (order: Order) => void;
  beforeAll(() => {
    validator = new Validator();
    calc = new FinancialCalculator();
  });
  beforeEach(() => {
    basevalidator = validator.validate;
    validator.validate = jest.fn(); // Mock the validate method
    orderManagement = new OrderManagement(validator, calc);
  });
  afterEach(() => {
    validator.validate = basevalidator; // Restore the original method
  });
  it('should add a valid order', () => {
    // Arrange
    const item = 'Sponge';
    const price = 15;

    // Act
    const result = orderManagement.addOrder(item, price);

    // Assert
    expect(orderManagement.getOrders()).toEqual([{ id: 1, item, price }]);
  });
  it('should get an order by ID', () => {
    // Arrange
    orderManagement.addOrder('Sponge', 15);
    // Act
    const result = orderManagement.getOrder(1);
    // Assert
    expect(result).toEqual({ id: 1, item: 'Sponge', price: 15 });
  });

  it('should call financial calculator for total revenue', () => {
    // Arrange
    orderManagement.addOrder('Sponge', 15);
    const spy = jest.spyOn(calc, 'getRevenue');

    // Act
    const result = orderManagement.getTotalRevenue();

    // Assert
    expect(spy).toHaveBeenCalledWith([{ id: 1, item: 'Sponge', price: 15 }]);
    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveReturnedWith(15);
  });

  it('should throw addition exception if validator doesnt pathes', () => {
    // Arrange
    const item = 'Sponge';
    const price = 15;
    (validator.validate as jest.Mock).mockImplementation(() => {
      throw new Error('Validation failed');
    });

    //Act & Assert
    expect(() => orderManagement.addOrder(item, price)).toThrow(
      'Failed to add order: Validation failed',
    );
  });
});

describe('FinancialCalculator', () => {
  it('should calculate total revenue', () => {
    // Arrange
    const calc = new FinancialCalculator();
    const orders = [
      { id: 1, item: 'Sponge', price: 15 },
      { id: 2, item: 'Chocolate', price: 20 },
    ];
    // Act
    const result = calc.getRevenue(orders);
    // Assert
    expect(result).toBe(35);
  });
  it('should calculate average buy power', () => {
    // Arrange
    const calc = new FinancialCalculator();
    const orders = [
      { id: 1, item: 'Sponge', price: 15 },
      { id: 2, item: 'Chocolate', price: 20 },
    ];
    // Act
    const result = calc.getAverageBuyPower(orders);
    // Assert
    expect(result).toBe(17.5);
  });
});
