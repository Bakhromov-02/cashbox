import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Category } from "./categories.model";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { ProductsService } from "../products/products.service";
import { UpdateCategoryDto } from "./dto/update-category.dto";
import { Product } from "../products/products.model";
import { Sequelize } from "sequelize-typescript";
import { IsAvailableDto } from "../query-dtos/is-available.dto";
import { RolesEnum } from "../constants/roles.enum";

@Injectable()
export class CategoriesService {
  constructor(@InjectModel(Category) private categoryRepository: typeof Category, @Inject(forwardRef(() => ProductsService)) private productService: ProductsService) {
  }

  async create(dto: CreateCategoryDto) {
    const category = await this.categoryRepository.findOne({ where: { name: dto.name } });
    if (category) {
      throw new HttpException("Category with this name exists", HttpStatus.BAD_REQUEST);
    }
    return await this.categoryRepository.create(dto);
  }

  // fn("COUNT", Sequelize.col("products.id"))
  async getAll(query: IsAvailableDto, request) {
    const isAvailable = query.isAvailable;

    console.log(request.user, request.user.role);
    if (request.user.role === RolesEnum.cashier) {
      return await this.categoryRepository.findAll({
        where: { isAvailable },
        order: [["createdAt", "ASC"]],
        attributes: [
          "id",
          "name",
          "isAvailable",
          [Sequelize.literal(
            `(select COUNT("products"."id") from products where "products"."isAvailable" = true and products."categoryId" = "Category"."id")`),
            "totalProducts"
          ]],
        include: [
          {
            as: "products",
            model: Product,
            attributes: []
          }
        ],
        group: ["Category.id"]
      });
    } else {
      return await this.categoryRepository.findAll({
        where: { isAvailable },
        order: [["createdAt", "ASC"]],
        attributes: [
          "id",
          "name",
          "isAvailable",
          [Sequelize.fn("COUNT", Sequelize.col("products.id")), "totalProducts"]],
        include: [
          {
            as: "products",
            model: Product,
            attributes: []
          }
        ],
        group: ["Category.id"]
      });
    }
  }

  async update(id: number, dto: UpdateCategoryDto) {
    const category = await this.categoryRepository.findByPk(id);
    if (!category) {
      throw new HttpException("Category with this id not found", HttpStatus.NOT_FOUND);
    }
    if (dto.name) {
      const categoryExists = await this.categoryRepository.findOne({ where: { name: dto.name } });
      if (categoryExists && (category.id !== categoryExists.id)) {
        throw new HttpException("Category with this name exists", HttpStatus.BAD_REQUEST);
      }
    }

    return await this.categoryRepository.update({ ...dto }, { where: { id }, returning: true });
  }

  async delete(id: number) {
    const category = await this.categoryRepository.findByPk(id);
    if (!category) {
      throw new HttpException("Category with this id not found", HttpStatus.NOT_FOUND);
    }
    // const products = category.toJSON().products;
    // products.map(async product => {
    //   let id = product.id;
    //   product.categoryId = null;
    //   await this.productService.update(id, product);
    // });
    await category.destroy();
    return category;
  }

  async findCategory(categoryId: number) {
    const category = await this.categoryRepository.findByPk(categoryId, { include: Product });

    if (!category) {
      throw new HttpException("Category with this id not found", HttpStatus.NOT_FOUND);
    }

    return category;
  }

  async findById(categoryId: number, query) {
    try {
      const page = +query.page || 1;
      const limit = +query.limit || 30;
      const offset = (page - 1) * limit;
      const category = await this.categoryRepository.findByPk(categoryId);

      if (!category) {
        throw new HttpException("Category with this id not found", HttpStatus.NOT_FOUND);
      }

      return await this.productService.findProducts(categoryId, limit, offset, query.isAvailable);
    } catch (e) {
      throw new HttpException(e.message, e.status);
    }
  }
}
