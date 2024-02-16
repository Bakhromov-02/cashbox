import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { InjectModel } from "@nestjs/sequelize";
import { User } from "./users.model";
import { RolesService } from "../roles/roles.service";
import { UpdateUserDto } from "./dto/update-user.dto";
import * as bcrypt from "bcryptjs";
import { Roles } from "../roles/roles.model";
import { RolesEnum } from "../constants/roles.enum";
import { IsAvailableDto } from "../query-dtos/is-available.dto";
import { Op, Sequelize } from "sequelize";
import { URLSearchParams } from "url";

@Injectable()
export class UsersService {
  constructor(@InjectModel(User) private userRepository: typeof User, private roleService: RolesService) {
  }

  async getAll(query: IsAvailableDto) {
    let isAvailable: string = String(query.isAvailable);
    if (isAvailable === "true") {
      return await this.userRepository.findAll({ attributes: { exclude: ["password"] } });
    } else {
      return await this.userRepository.findAll({
        where: { deletedAt: { [Op.not]: null } },
        attributes: { exclude: ["password"] },
        paranoid: false
      });
    }
  }

  async getOne(id: number) {
    const user = await this.userRepository.findByPk(id, { attributes: { exclude: ["password"] }, include: Roles });

    if (!user) {
      throw new HttpException("User with this id not found", HttpStatus.NOT_FOUND);
    }

    return user;
  }

  async create(dto: CreateUserDto) {
    const [isValidRole] = await Promise.all([this.roleService.getById(dto.roleId)]);

    if (!isValidRole) {
      throw new HttpException("Role with this id not found", HttpStatus.NOT_FOUND);
    }
    if (isValidRole.value === RolesEnum.superAdmin) {
      throw new HttpException("You can't have another admin", HttpStatus.BAD_REQUEST);
    }

    const hashPassword = await bcrypt.hash(dto.password, 5);

    const candidate = await this.userRepository.findOne({ where: { username: dto.username }, paranoid: false });
    if (candidate?.deletedAt) {
      await candidate.restore();
      candidate.roleId = dto.roleId;
      candidate.password = hashPassword;
      return await candidate.save();
    }
    if (candidate) {
      throw new HttpException("User with this username exists", HttpStatus.BAD_REQUEST);
    }

    const user = await this.userRepository.create({
      ...dto,
      password: hashPassword
    });

    delete user["password"];
    return user;
  }

  async update(id: number, dto: UpdateUserDto, request) {
    await this.getOne(id);

    if (dto.roleId && (request.user.role !== RolesEnum.superAdmin)) {
      throw new HttpException("Unauthorized", HttpStatus.FORBIDDEN);
    }

    if (dto.username) {
      const user = await this.userRepository.findOne({ where: { username: dto.username } });
      if (user && user.id !== id) {
        throw new HttpException("Username already exists", HttpStatus.BAD_REQUEST);
      }
    }
    if (dto.roleId || dto.roleId == 0) {
      const role = await this.roleService.getById(dto.roleId);
      if (!role) {
        throw new HttpException("Role with this id not found", HttpStatus.NOT_FOUND);
      }
    }

    if (dto.password) {
      const hashPassword = await bcrypt.hash(dto.password, 5);

      return await this.userRepository.update({ ...dto, password: hashPassword }, { where: { id }, returning: true });
    }

    return await this.userRepository.update({ ...dto }, { where: { id }, returning: true });
  }

  async delete(id: number) {
    const user = await this.getOne(id);
    if (user.role.value === RolesEnum.superAdmin) {
      throw new HttpException("Super admin cannot be deleted", HttpStatus.BAD_REQUEST);
    }

    user.telegram_id = null;
    await user.destroy();
    return user;
  }

  async getByUsername(username: string) {
    const user = await this.userRepository.findOne({
      where: { username },
      include: Roles
      // attributes: { exclude: ["password"] }
    });

    if (!user) {
      throw new HttpException("User with this id not found", HttpStatus.NOT_FOUND);
    }

    return user;
  }

  async getByUsernameForTG(username: string) {
    return await this.userRepository.findOne({
      where: { username },
      include: Roles,
      attributes: { exclude: ["password"] }
    });
  }
}
