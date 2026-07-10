import { NextFunction, Request, Response } from 'express';
import { OrderManagementService } from '../services/orderManagement.service';
import { ApiException } from '../util/exceptions/ApiException';
import { IdentifiableOrderItem } from '../model/Order.model';

import { JsonRequestFactory } from '../mappers';

export class OrderController {
  constructor(private readonly orderService: OrderManagementService) {}
  //create an order
  public async createOrder(req: Request, res: Response, next: NextFunction) {
    try {
      const orderData: IdentifiableOrderItem = JsonRequestFactory.create(
        req.body.category,
      ).map(req.body);
      if (!orderData) {
        throw new Error('Order data is required');
      }
      const newOrder = await this.orderService.createOrder(orderData);
      res.status(201).json(newOrder);
    } catch (error) {
      next(new ApiException(400, 'Error while creating order'));
    }
  }

  //Get Order
  public async getOrder(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const id = req.params.id;
      if (!id) {
        throw new Error('Order ID is required');
      }
      const order = await this.orderService.getOrder(id);
      res.status(200).json(order);
    } catch (error) {
      next(new ApiException(400, 'Error while getting order'));
    }
  }
  //Get All Orders
  public async getAllOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const orders = await this.orderService.getAllOrders();
      res.status(200).json(orders);
    } catch (error) {
      next(new ApiException(400, 'Error while getting all orders'));
    }
  }

  //Update Order
  public async updateOrder(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const id = req.params.id;
      if (!id) {
        throw new Error('Order ID is required');
      }
      const updatedOrderData: IdentifiableOrderItem = JsonRequestFactory.create(
        req.body.category,
      ).map(req.body);
      if (!updatedOrderData) {
        throw new Error('Updated order data is required');
      }
      if (updatedOrderData.getId() !== id) {
        throw new Error(
          'Order ID in the request body does not match the URL parameter',
        );
      }
      await this.orderService.updateOrder(updatedOrderData);
      res.status(200).json(updatedOrderData);
    } catch (error) {
      if (error instanceof Error) {
        next(
          new ApiException(400, 'Error while updating order' + error.message),
        );
        next(new ApiException(400, 'Error while updating order'));
      }
    }
  }
  //Delete Order
  public async deleteOrder(
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const id = req.params.id;
      if (!id) {
        throw new Error('Order ID is required');
      }
      await this.orderService.deleteOrder(id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error) {
        next(
          new ApiException(400, 'Error while deleting order' + error.message),
        );
      }
      next(new ApiException(400, 'Error while deleting order'));
    }
  }
  //get total revenue
  // get total orders count
}
