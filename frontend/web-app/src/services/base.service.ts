/**
 * Base Service Class
 * Provides common functionality for all service classes
 * - Simulates network delay
 * - Provides CRUD template methods
 * - Error handling
 */

export abstract class BaseService<T> {
  protected readonly MIN_DELAY = 300; // Minimum delay in ms
  protected readonly MAX_DELAY = 800; // Maximum delay in ms

  /**
   * Simulates API network delay
   */
  protected async simulateDelay(): Promise<void> {
    const delay =
      Math.random() * (this.MAX_DELAY - this.MIN_DELAY) + this.MIN_DELAY;
    return new Promise((resolve) => setTimeout(resolve, delay));
  }

  /**
   * Simulates successful API response
   */
  protected async mockSuccess<R>(data: R): Promise<R> {
    await this.simulateDelay();
    return data;
  }

  /**
   * Simulates API error response
   */
  protected async mockError(message: string): Promise<never> {
    await this.simulateDelay();
    throw new Error(message);
  }

  /**
   * Generate random ID (for mock data)
   */
  protected generateId(): number {
    return Math.floor(Math.random() * 1000000) + 1;
  }

  /**
   * Generate timestamp
   */
  protected now(): Date {
    return new Date();
  }

  /**
   * Format tracking number: VN + YYYYMMDD + 6-digit sequence + VN
   */
  protected generateTrackingNumber(): string {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
    const sequence = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, "0");
    return `VN${dateStr}${sequence}VN`;
  }

  /**
   * Generate code with prefix
   */
  protected generateCode(prefix: string): string {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
    const sequence = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    return `${prefix}${dateStr}${sequence}`;
  }

  /**
   * Get date N days from now
   */
  protected addDays(days: number): Date {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
  }

  /**
   * Abstract CRUD methods (to be implemented by subclasses)
   */
  abstract getAll(): Promise<T[]>;
  abstract getById(id: number): Promise<T | null>;
  abstract create(data: Partial<T>): Promise<T>;
  abstract update(id: number, data: Partial<T>): Promise<T>;
  abstract delete(id: number): Promise<boolean>;
}
