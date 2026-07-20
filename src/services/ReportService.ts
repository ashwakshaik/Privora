import { storage } from "@/lib/storage";

export class ReportService {
  static async getReports(userId: string) {
    return storage.getReports(userId);
  }

  static async createReport(userId: string, name: string, size: string) {
    return storage.createReport(userId, name, size);
  }
}
