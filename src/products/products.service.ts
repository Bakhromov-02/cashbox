import { forwardRef, HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Product } from "./products.model";
import { CreateProductDto } from "./dto/create-product.dto";
import { CategoriesService } from "../categories/categories.service";
import { UpdateProductDto } from "./dto/update-product.dto";
import { PriceHistory } from "./price-history.model";
import { IsAvailableDto } from "../query-dtos/is-available.dto";

@Injectable()
export class ProductsService {
  constructor(@InjectModel(Product) private productRepository: typeof Product, @InjectModel(PriceHistory) private priceHistoryRepository: typeof PriceHistory, @Inject(forwardRef(() => CategoriesService)) private categoriesService: CategoriesService) {
  }

  async getAll(query: IsAvailableDto) {
    return this.productRepository.findAll({ where: { isAvailable: query.isAvailable }, order: [["createdAt", "ASC"]] });
  }

  async create(dto: CreateProductDto) {
    if (dto.categoryId || dto.categoryId == 0)
      await this.categoriesService.findCategory(dto.categoryId);
    const product = await this.productRepository.findOne({ where: { name: dto.name }, paranoid: false });
    if (product?.deletedAt) {
      await product.restore();
      if (product.price !== dto.price) {
        product.price = dto.price;
        const historyDto = {
          price: product.price,
          productId: product.id,
          productVersion: product.version
        };
        await this.priceHistoryRepository.create(historyDto);
        product.version += 1;
      }

      // price history
      product.isAvailable = true;
      product.categoryId = dto.categoryId || null;
      return await product.save();
    }
    if (product) {
      throw new HttpException("Product with this name exists", HttpStatus.BAD_REQUEST);
    }
    return await this.productRepository.create({ ...dto });
  }

  async update(id: number, dto: UpdateProductDto) {
    if (dto.name) {
      throw new HttpException("Product name can not be changed", HttpStatus.BAD_REQUEST);
    }

    if (dto.version) {
      throw new HttpException("Product version can not be changed", HttpStatus.BAD_REQUEST);
    }

    const product = await this.getById(id);
    // if (query-dtos.name) {
    //   const p = await this.productRepository.findOne({ where: { name: query-dtos.name } });
    //   if (p && p.id !== id) {
    //     throw new HttpException("Product with this name exists", HttpStatus.BAD_REQUEST);
    //   }
    // }
    if (dto.categoryId || dto.categoryId == 0)
      await this.categoriesService.findCategory(dto.categoryId);

    if (dto.price && dto.price !== product.price) {
      const historyDto = {
        price: product.price,
        productId: product.id,
        productVersion: product.version
      };
      await this.priceHistoryRepository.create(historyDto);
      product.version += 1;
      await product.save();
    }

    return await this.productRepository.update({ ...dto }, {
      where: { id },
      returning: true
    });
  }

  async delete(id: number) {
    const product = await this.getById(id);
    await product.destroy();
    return product;
  }

  async getByVersion(productVersion: number, productId: number) {
    let product = await this.priceHistoryRepository.findOne({ where: { productVersion, productId } });
    if (!product) {
      throw new HttpException("Product with this id not found", HttpStatus.NOT_FOUND);
    }

    return product;
  }

  async getById(id: number) {
    let product = await this.productRepository.findByPk(id);
    if (!product) {
      throw new HttpException("Product with this id not found", HttpStatus.NOT_FOUND);
    }

    return product;
  }

  async findProducts(categoryId: number, limit: number, offset: number, isAvailable: boolean) {
    const p = await this.productRepository.findAndCountAll({ where: { categoryId, isAvailable }, limit, offset });

    const products = { pageCount: Math.ceil(p.count / limit), data: [] };

    products.data = p.rows;

    return products;
  }
}
