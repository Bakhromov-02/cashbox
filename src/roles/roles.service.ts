import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Roles } from "./roles.model";
import { CreateRoleDto } from "./dto/create-role.dto";

@Injectable()
export class RolesService {
  constructor(@InjectModel(Roles) private rolesRepository: typeof Roles) {
  }

  async getAll() {
    //{ where: { value: ["CASHIER", "ACCOUNTANT"] } }
    return this.rolesRepository.findAll();
  }

  async getById(id: number) {
    return this.rolesRepository.findByPk(id);
  }

  async create(dto: CreateRoleDto) {
    const candidate = await this.rolesRepository.findOne({ where: { value: dto.value } });
    if (candidate) {
      throw new HttpException("Role with this value exists", HttpStatus.BAD_REQUEST);
    }

    return await this.rolesRepository.create(dto);
  }
}
