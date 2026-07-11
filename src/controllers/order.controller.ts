import { NextFunction, Request, Response } from 'express';
import { OrderManagementService } from '../services/orderManagement.service';
import { IdentifiableOrderItem } from '../model/Order.model';

import { JsonRequestFactory } from '../mappers';
import { BadRequestException } from '../util/exceptions/http/BadRequestException';

export class OrderController {
  constructor(private readonly orderService: OrderManagementService) {}
  //create an order
  public async createOrder(req: Request, res: Response) {
    const orderData: IdentifiableOrderItem = JsonRequestFactory.create(
      req.body.category,
    ).map(req.body);
    if (!orderData) {
      throw new BadRequestException('Order data is required', {
        orderNotDefined: true,
      });
    }
    const newOrder = await this.orderService.createOrder(orderData);
    res.status(201).json(newOrder);
  }

  //Get Order
  public async getOrder(req: Request<{ id: string }>, res: Response) {
    const id = req.params.id;
    if (!id) {
      throw new BadRequestException('Order ID is required', {
        OrderIdNotDefined: true,
      });
    }
    const order = await this.orderService.getOrder(id);
    res.status(200).json(order);
  }
  //Get All Orders
  public async getAllOrders(req: Request, res: Response) {
    const orders = await this.orderService.getAllOrders();
    res.status(200).json(orders);
  }

  //Update Order
  public async updateOrder(req: Request<{ id: string }>, res: Response) {
    const id = req.params.id;
    if (!id) {
      throw new BadRequestException('Order ID is required', {
        OrderIdNotDefined: true,
      });
    }
    const updatedOrderData: IdentifiableOrderItem = JsonRequestFactory.create(
      req.body.category,
    ).map(req.body);
    if (!updatedOrderData) {
      throw new BadRequestException('Updated order data is required', {
        UpdatedOrderDataNotDefined: true,
      });
    }
    if (updatedOrderData.getId() !== id) {
      throw new BadRequestException('Order ID mismatch', {
        OrderIdMismatch: true,
      });
    }
    await this.orderService.updateOrder(updatedOrderData);
    res.status(200).json(updatedOrderData);
  }
  //Delete Order
  public async deleteOrder(req: Request<{ id: string }>, res: Response) {
    const id = req.params.id;
    if (!id) {
      throw new BadRequestException('Order ID is required', {
        OrderIdNotDefined: true,
      });
    }
    await this.orderService.deleteOrder(id);
    res.status(204).send();
  }
  //get total revenue
  // get total orders count
}
