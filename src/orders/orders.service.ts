import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { CreateOrderDto } from "./dto/create-order.dto";
import { InjectModel } from "@nestjs/sequelize";
import { UsersService } from "../users/users.service";
import { ProductsService } from "../products/products.service";
import { Order } from "./orders.model";
import { OrderDetails } from "./order-details.model";
import { User } from "../users/users.model";
import { Request } from "express";
import { products, UpdateOrderDto } from "./dto/update-order.dto";
import { RolesEnum } from "../constants/roles.enum";
import { Product } from "../products/products.model";
import { Op, or, Sequelize } from "sequelize";
import { PaginationDto } from "../query-dtos/pagination.dto";
import { FilterDto } from "../query-dtos/filter.dto";
import { BotService } from "../bot/bot.service";
import { sessions } from "../app.module";
import { Context } from "../bot/context.interface";

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order) private orderRepository: typeof Order,
    @InjectModel(OrderDetails) private orderDetailsRepository: typeof OrderDetails,
    private userService: UsersService,
    private productService: ProductsService,
    private botService: BotService
  ) {
  }

  async create(dto: CreateOrderDto, request) {
    let order;
    try {
      const orderDto = { userId: request.user.id, card: dto.card, cash: dto.cash };
      const products = [];
      let totalPrice = 0;
      for (let p of dto.products) {
        const product = await this.productService.getById(p.id);
        if (!product) {
          break;
        }
        totalPrice += +product.price * +p.quantity;
        products.push({ productId: +product.id, productVersion: +product.version, quantity: +p.quantity });
      }

      if (totalPrice !== (dto.card + dto.cash)) {
        throw new HttpException("Order price was calculated incorrectly", HttpStatus.BAD_REQUEST);
      }
      // if (query-dtos.type === "RETURNED") {
      //   orderDto.card = -orderDto.card;
      //   orderDto.cash = -orderDto.cash;
      // }

      order = await this.orderRepository.create(orderDto);

      for (let productDetails of products) {
        await this.orderDetailsRepository.create({ ...productDetails, orderId: order.id });
      }


    } catch (e) {
      throw new HttpException(e.message, HttpStatus.NOT_FOUND);
    }

    // const orderWithProducts = await this.getOne(order.id, request);
    // try {
    //   const superadmin = await this.userService.getOne(1);
    //
    //   if (superadmin.telegram_id) {
    //     await this.botService.sendOrder(superadmin.telegram_id, orderWithProducts, true);
    //   }
    // } catch (e) {
    //   console.log(e);
    //   await sessions.saveSession(`${e.on.payload.chat_id}:${e.on.payload.chat_id}`, {});
    // }
    //
    // try {
    //   const cashier = await this.userService.getOne(request.user.id);
    //
    //   if (cashier.telegram_id) {
    //     await this.botService.sendOrder(cashier.telegram_id, orderWithProducts, true);
    //   }
    // } catch (e) {
    //   console.log(e);
    //   await sessions.saveSession(`${e.on.payload.chat_id}:${e.on.payload.chat_id}`, {});
    // }
    await this.sendToTg(order.id, request, true);
    return order;
  }

  async getAll(query: PaginationDto, request) {
    const page = +query.page || 1;
    const limit = +query.limit || 30;
    const offset = (page - 1) * limit;
    let orders;

    if (request.user.role === RolesEnum.cashier) {
      orders = await this.orderRepository.findAndCountAll({
        where: { userId: request.user.id },
        order: [["updatedAt", "DESC"]],
        limit,
        offset,
        include: [{
          model: User,
          attributes: { exclude: ["password", "roleId", "createdAt", "updatedAt", "deletedAt"] },
          paranoid: false
        }]
      });
    } else {
      orders = await this.orderRepository.findAndCountAll({
        order: [["createdAt", "DESC"]],
        limit,
        offset,
        include: [{
          model: User,
          attributes: { exclude: ["password", "roleId", "createdAt", "updatedAt", "deletedAt"] },
          paranoid: false
        }]
      });
    }


    const ordersSortedByDay = { pageCount: Math.ceil(orders.count / limit), data: [] };
    orders.rows.map((order) => {
      const date = order.createdAt.toISOString().split("").slice(0, 10).join("");
      // if (ordersSortedByDay.data[date]) {
      //   ordersSortedByDay.data[date] = [...ordersSortedByDay.data[date], order];
      // } else {
      //   ordersSortedByDay.data[date] = [order];
      // }

      if (ordersSortedByDay.data?.at(-1)?.date === order.createdAt.toISOString().split("").slice(0, 10).join("")) {
        ordersSortedByDay.data.at(-1).data.push(order);
      } else {
        ordersSortedByDay.data.push({ date: date, data: [order] });
      }

      // console.log(date);
    });
    // console.log(ordersSortedByDay);
    return ordersSortedByDay;
  }

  async getByFilter(query: FilterDto, request) {
    let START, END;

    if (!query.date && !query.month && !query.from && !query.to) {
      START = new Date().setHours(0, 0, 0, 0);
      END = new Date().setHours(23, 59, 59, 59);
    }

    if (query.date) {
      if (isNaN(Date.parse(query.date))) {
        throw new HttpException("Invalid date", HttpStatus.BAD_REQUEST);
      }

      START = new Date(query.date).setHours(0, 0, 0, 0);
      END = new Date(query.date).setHours(23, 59, 59, 59);
    }

    if (!query.date && query.month) {
      if (isNaN(Date.parse(query.month)) || query.month.length !== 7) {
        throw new HttpException("Invalid date", HttpStatus.BAD_REQUEST);
      }

      START = new Date(query.month + "-01").setHours(0, 0, 0, 0);

      const year = +query.month.split("-")[0];
      const month = +query.month.split("-")[1];
      const days = new Date(year, month, 0).getDate();
      END = new Date(query.month + "-" + days).setHours(23, 59, 59, 59);
    }

    if (!query.date && query.from && query.to) {
      if (isNaN(Date.parse(query.from)) || isNaN(Date.parse(query.to))) {
        throw new HttpException("Invalid date", HttpStatus.BAD_REQUEST);
      }
      START = new Date(query.from).setHours(0, 0, 0, 0);
      END = new Date(query.to).setHours(23, 59, 59, 59);
    }


    let cash = 0, card = 0, returned = 0;
    const products = [];
    let orders;

    if (request.user.role !== RolesEnum.cashier){
      orders = await this.orderRepository.findAll({
        where: {
          // Sequelize.fn('CURRENT_DATE'): {[Op.eq]: Sequelize.fn("date_trunc", "day", Sequelize.col("Order.createdAt"))}
          createdAt: {
            [Op.gt]: START,
            [Op.lt]: END
          }
          // Sequelize.where(Sequelize.fn('date_trunc',"month", Sequelize.col("createdAt")))
        },
        // where: {
        //   createdAt: [Sequelize.literal(`Sequelize.fn("date_trunc", "day", Sequelize.col("Order.createdAt")) = Sequelize.fn('CURRENT_DATE')`)]
        // },
        order: [["createdAt", "DESC"]],
        include: [
          { model: User, attributes: { exclude: ["password", "updatedAt", "deletedAt", "roleId"] }, paranoid: false },
          {
            all: true,
            attributes: { exclude: ["createdAt", "updatedAt", "deletedAt", "orderId", "id", "categoryId"] },
            nested: true,
            paranoid: false
          }
        ]
      })
    }else {
      orders = await this.orderRepository.findAll({
        where: {
          createdAt: {
            [Op.gt]: START,
            [Op.lt]: END
          },
          userId: request.user.id
        },
        order: [["createdAt", "DESC"]],
        include: [
          { model: User, attributes: { exclude: ["password", "updatedAt", "deletedAt", "roleId"] }, paranoid: false },
          {
            all: true,
            attributes: { exclude: ["createdAt", "updatedAt", "deletedAt", "orderId", "id", "categoryId"] },
            nested: true,
            paranoid: false
          }
        ]
      })
    }

    orders.forEach(order => {
      cash += order.cash;
      card += order.card;
      returned += order.returned;

      const productDetails = order.products;

      productDetails.forEach((p) => {
        const product = {
          name: p.product.name,
          quantity: p.quantity,
          price: p.product.price,
          returnedQuantity: p.returnedQuantity
        };

        const pro = products.find(p => p.name === product.name);

        if (pro) {
          pro.quantity += product.quantity;
          pro.returnedQuantity += product.returnedQuantity;
        } else {
          products.push(product);
        }
      });

    });

    return { card, cash, returned, products };
  }

  async getOne(id: number, request) {

    const products = [];
    const order = await this.orderRepository.findByPk(id, {
      include: [
        { model: User, attributes: { exclude: ["password", "updatedAt", "deletedAt", "roleId"] } },
        {
          all: true,
          attributes: { exclude: ["createdAt", "updatedAt", "deletedAt", "orderId", "id", "categoryId"] },
          nested: true,
          paranoid: false
        }
      ],
      attributes: { exclude: ["userId", "updatedAt"] }
    });

    if (!order) {
      throw new HttpException("Order with this id not found", HttpStatus.NOT_FOUND);
    }

    if ((request.user.role === RolesEnum.cashier) && (order.user.id !== request.user.id)) {
      throw new HttpException("Unauthorized", HttpStatus.FORBIDDEN);
    }

    const productDetails = order.products;

    productDetails.forEach((p, i) => {
      const product = {
        id: p.productId,
        name: p.product.name,
        price: 0,
        quantity: p.quantity,
        returnedQuantity: p.returnedQuantity
      };

      if (!p.product.history.length) {
        product.price = p.product.price;
      } else if (p.productVersion === p.product.version) {
        product.price = p.product.price;
      } else {
        let history = p.product.history.filter(pr => pr.productVersion === p.productVersion);
        // console.log(history);
        product.price = history[0].price;
      }

      products.push(product);
    });

    const orderDetails = { ...order.toJSON(), products };

    // console.log(orderDetails);
    return orderDetails;
  }

  async update(id: number, dto: UpdateOrderDto, request) {
    let returned = 0;

    try {
      const order = await this.getOne(id, request);

      // if(order.createdAt.toISOString().split("").slice(0, 10).join("") !== new Date().toISOString().split("").slice(0, 10).join("")){
      //   throw new HttpException('You can not edit', HttpStatus.FORBIDDEN)
      // }

      for (let p of dto.products) {
        const product = order.products.find(pro => pro.id === p.productId);

        if (!product) {
          throw new HttpException(`Product with ${p.productId} not found`, HttpStatus.NOT_FOUND);
        }

        if (product.quantity < p.returnedQuantity) {
          throw new HttpException(`Returned products more than ordered ones`, HttpStatus.BAD_REQUEST);
        }

        returned += +product.price * +p.returnedQuantity;
        const pro = await this.orderDetailsRepository.findOne({ where: { productId: p.productId, orderId: order.id } });
        pro.returnedQuantity = p.returnedQuantity;
        await pro.save();
      }

      const ord = await this.orderRepository.findByPk(id);
      ord.returned = returned;
      await ord.save();
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.BAD_REQUEST);
    }
    return await this.sendToTg(id, request, false);
  }

  async updateAll(id: number, request) {
    const order = await this.orderRepository.findByPk(id, {
      include: [OrderDetails],
      attributes: { exclude: ["createdAt", "updatedAt", "orderId"] }
    });

    if (!order) {
      throw new HttpException("Order with this id not found", HttpStatus.NOT_FOUND);
    }

    for (const p of order.products) {
      p.returnedQuantity = p.quantity;
      await p.save();
    }
    order.returned = order.cash + order.card;
    await order.save();
    await this.sendToTg(id, request, false);
    return order;
  }

  async sendToTg(id, request, created) {
    const orderWithProducts = await this.getOne(id, request);
    try {
      const superadmin = await this.userService.getOne(1);

      if (superadmin.telegram_id) {
        await this.botService.sendOrder(superadmin.telegram_id, orderWithProducts, created);
      }
    } catch (e) {
      console.log(e);
      await sessions.saveSession(`${e.on.payload.chat_id}:${e.on.payload.chat_id}`, {});

    }

    try {
      const cashier = await this.userService.getOne(orderWithProducts.user.id);

      if (cashier.telegram_id) {
        await this.botService.sendOrder(cashier.telegram_id, orderWithProducts, created);
      }
    } catch (e) {
      console.log(e);
      await sessions.saveSession(`${e.on.payload.chat_id}:${e.on.payload.chat_id}`, {});
    }

    return orderWithProducts;
  }

}
