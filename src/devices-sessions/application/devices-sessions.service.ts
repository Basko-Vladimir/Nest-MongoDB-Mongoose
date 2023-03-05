import { Types } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { DevicesSessionsRepository } from '../infrastructure/devices-sessions.repository';
import { UpdateOrFilterModel } from '../../common/types';
import { DeviceSessionOutputModel } from '../api/dto/devices-sessions-output-models.dto';
import {
  DeviceSession,
  DeviceSessionDocument,
  DeviceSessionModelType,
} from '../schemas/device-session.schema';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class DevicesSessionsService {
  constructor(
    protected devicesSessionsRepository: DevicesSessionsRepository,
    @InjectModel(DeviceSession.name)
    protected DeviceSessionModel: DeviceSessionModelType,
  ) {}

  async getAllActiveDevicesSessions(
    filter: UpdateOrFilterModel,
  ): Promise<DeviceSessionOutputModel[]> {
    return this.devicesSessionsRepository.getAllActiveDevicesSessions(filter);
  }

  async createDeviceSession(
    deviceSessionData: Partial<DeviceSession>,
  ): Promise<void> {
    const createdDeviceSession =
      this.DeviceSessionModel.createDeviceSessionEntity(
        deviceSessionData,
        this.DeviceSessionModel,
      );

    await this.devicesSessionsRepository.saveDeviceSession(
      createdDeviceSession,
    );
  }

  async deleteAllDevicesSessionsExceptCurrent(
    deviceSessionId: Types.ObjectId,
  ): Promise<void> {
    return this.devicesSessionsRepository.deleteAllDevicesSessionsExceptCurrent(
      deviceSessionId,
    );
  }

  async deleteDeviceSessionById(deviceSessionId: string): Promise<void> {
    return this.devicesSessionsRepository.deleteDeviceSessionById(
      deviceSessionId,
    );
  }

  async findDeviceSessionByFilter(
    filter: UpdateOrFilterModel,
  ): Promise<DeviceSessionDocument | null> {
    return this.devicesSessionsRepository.findDeviceSessionByFilter(filter);
  }

  async updateDeviceSessionData(
    session: DeviceSessionDocument,
    issuedAt: number,
  ): Promise<void> {
    const updatedDeviceSession = await session.updateDeviceSessionData(
      issuedAt,
      session,
    );

    await this.devicesSessionsRepository.saveDeviceSession(
      updatedDeviceSession,
    );
  }
}