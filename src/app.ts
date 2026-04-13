// SOLID Principles
//Single Responsibility Principle
//Open/Closed Principle
//Liskov Substitution Principle
//Interface Segregation Principle
//Dependency Inversion Principle

import logger from './util/logger';

export interface Order {
  id: number;
  item: string;

  price: number;
}

export class OrderManagement {
  private orders: Order[] = [];
  constructor(
    private validator: IValidator,
    private calculator: ICalculator,
  ) {}
  getOrders(): Order[] {
    return this.orders;
  }
  addOrder(item: string, price: number): void {
    try {
      const newOrder: Order = { id: this.orders.length + 1, item, price };
      this.validator.validate(newOrder);
      this.orders.push({ id: this.orders.length + 1, item, price });
    } catch (error: any) {
      throw new Error(`Failed to add order: ${error.message}`);
    }
  }
  getOrder(id: number): Order | undefined {
    const order = this.getOrders().find((order) => order.id === id);
    if (!order) {
      logger.warn(`Order with ID ${id} not found.`);
    }
    return order;
  }
  getTotalRevenue(): number {
    return this.calculator.getRevenue(this.orders);
  }
  getAverageBuyPower(): number {
    return this.calculator.getAverageBuyPower(this.orders);
  }
}
export class PremiumOrderManagement extends OrderManagement {
  constructor(validator: IValidator, calculator: ICalculator) {
    super(validator, calculator);
  }
  addOrder(item: string, price: number): void {
    if (price > 50) {
      throw new Error('Premium orders cannot exceed $50');
    }
    super.addOrder(item, price);
  }
}

interface IValidator {
  validate(order: Order): void;
}
export class Validator implements IValidator {
  private rules: IValidator[] = [
    new PriceValidator(),
    new ItemValidator(),
    new MaxPriceValidator(),
  ];

  validate(order: Order): void {
    this.rules.forEach((rule) => rule.validate(order));
  }
}
export class ItemValidator implements IValidator {
  private static possibleItems = [
    'Sponge',
    'Chocolate',
    'Fruit',
    'Red Velvet',
    'Birthday',
    'Carrot',
    'Marble',
    'Coffee',
  ];
  validate(order: Order): void {
    if (!ItemValidator.possibleItems.includes(order.item)) {
      throw new Error(`Invalid item: ${order.item}`);
    }
  }
}
export class OrderValidator implements IValidator {
  validate(order: Order): void {
    if (
      ![
        'Sponge',
        'Chocolate',
        'Fruit',
        'Red Velvet',
        'Birthday',
        'Carrot',
        'Marble',
        'Coffee',
      ].includes(order.item)
    ) {
      throw new Error(`Invalid item: ${order.item}`);
    }
  }
}
export class MaxPriceValidator implements IValidator {
  validate(order: Order): void {
    if (order.price > 100) {
      throw new Error(`Price exceeds maximum limit: ${order.price}`);
    }
  }
}
export class PriceValidator implements IValidator {
  validate(order: Order): void {
    if (order.price <= 0) {
      logger.error('Invalid price: ' + order.price);

      throw new Error(
        `Invalid price: ${order.price}. Price must be greater than zero.`,
      );
    }
  }
}
interface ICalculator {
  getRevenue(orders: Order[]): number;
  getAverageBuyPower(orders: Order[]): number;
}
export class FinancialCalculator implements ICalculator {
  public getRevenue(orders: Order[]): number {
    return orders.reduce((total, order) => total + order.price, 0);
  }
  public getAverageBuyPower(orders: Order[]): number {
    return orders.length === 0 ? 0 : this.getRevenue(orders) / orders.length;
  }
}
// Main
