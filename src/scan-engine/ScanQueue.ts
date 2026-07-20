import { logger } from "@/lib/logger";

type QueueTask = () => Promise<void>;

export class ScanQueue {
  private static queue: QueueTask[] = [];
  private static isProcessing = false;

  static addTask(task: QueueTask) {
    this.queue.push(task);
    logger.info(`[Queue] Task added. Current queue size: ${this.queue.length}`);
    this.processQueue();
  }

  private static async processQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.queue.length > 0) {
      const currentTask = this.queue.shift();
      if (currentTask) {
        try {
          logger.info("[Queue] Processing active scan worker job...");
          await currentTask();
          logger.info("[Queue] Worker job completed successfully.");
        } catch (error: any) {
          logger.error(`[Queue] Worker job failed: ${error.message}`);
        }
      }
    }

    this.isProcessing = false;
    logger.info("[Queue] All background worker tasks completed.");
  }
}
export const scanQueue = ScanQueue;
