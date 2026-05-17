import type { IDataOverviewService } from "../Interfaces/IDataOverviewService";

const { DataOverviewRepository } = require("../../DAL/Repositories/DataOverviewRepository");

export class DataOverviewService implements IDataOverviewService {
  private dataOverviewRepository: any;

  constructor() {
    this.dataOverviewRepository = new DataOverviewRepository();
  }

  async getDataOverview(): Promise<any> {
    return this.dataOverviewRepository.getOverview();
  }
}

module.exports = { DataOverviewService };

