import { User, UserRole, AuthResponse } from "../models";
import { BaseService } from "./base.service";

/**
 * Authentication Service
 * Handles login, logout, and session management
 */
class AuthServiceClass extends BaseService<User> {
  private currentUser: Omit<User, "passwordHash"> | null = null;

  private mockUsers: User[] = [
    {
      id: 1,
      organizationId: 1,
      username: "admin",
      email: "admin@postal.vn",
      passwordHash:
        "$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password
      fullName: "Quản Trị Viên Hệ Thống",
      phone: "0901234567",
      role: UserRole.ADMIN,
      isActive: true,
      lastLogin: new Date(),
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date(),
    },
    {
      id: 2,
      organizationId: 3,
      username: "clerk01",
      email: "clerk01@postal.vn",
      passwordHash:
        "$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
      fullName: "Nguyễn Văn An",
      phone: "0901234568",
      role: UserRole.CLERK,
      isActive: true,
      lastLogin: new Date(),
      createdAt: new Date("2024-02-01"),
      updatedAt: new Date(),
    },
    {
      id: 3,
      organizationId: 3,
      username: "courier01",
      email: "courier01@postal.vn",
      passwordHash:
        "$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
      fullName: "Trần Văn Bình",
      phone: "0901234569",
      role: UserRole.COURIER,
      isActive: true,
      lastLogin: new Date(),
      createdAt: new Date("2024-02-01"),
      updatedAt: new Date(),
    },
    {
      id: 4,
      organizationId: 2,
      username: "manager01",
      email: "manager01@postal.vn",
      passwordHash:
        "$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
      fullName: "Phạm Thị Cẩm",
      phone: "0901234570",
      role: UserRole.MANAGER,
      isActive: true,
      lastLogin: new Date(),
      createdAt: new Date("2024-01-15"),
      updatedAt: new Date(),
    },
    {
      id: 5,
      organizationId: 3,
      username: "warehouse01",
      email: "warehouse01@postal.vn",
      passwordHash:
        "$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
      fullName: "Lê Văn Dũng",
      phone: "0901234571",
      role: UserRole.WAREHOUSE,
      isActive: true,
      lastLogin: new Date(),
      createdAt: new Date("2024-02-15"),
      updatedAt: new Date(),
    },
    {
      id: 6,
      organizationId: 2,
      username: "dispatcher01",
      email: "dispatcher01@postal.vn",
      passwordHash:
        "$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
      fullName: "Hoàng Thị Lan",
      phone: "0901234572",
      role: UserRole.DISPATCHER,
      isActive: true,
      lastLogin: new Date(),
      createdAt: new Date("2024-03-01"),
      updatedAt: new Date(),
    },
    {
      id: 7,
      organizationId: 1,
      username: "accountant01",
      email: "accountant01@postal.vn",
      passwordHash:
        "$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
      fullName: "Vũ Minh Tuấn",
      phone: "0901234573",
      role: UserRole.ACCOUNTANT,
      isActive: true,
      lastLogin: new Date(),
      createdAt: new Date("2024-03-15"),
      updatedAt: new Date(),
    },
  ];

  async getAll(): Promise<User[]> {
    return this.mockSuccess([...this.mockData]);
  }

  get mockData(): User[] {
    return this.mockUsers;
  }

  async getById(id: number): Promise<User | null> {
    const user = this.mockUsers.find((u) => u.id === id);
    return this.mockSuccess(user || null);
  }

  async create(data: Partial<User>): Promise<User> {
    const newUser: User = {
      id: this.generateId(),
      organizationId: data.organizationId || 1,
      username: data.username || "",
      email: data.email || "",
      passwordHash:
        "$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi",
      fullName: data.fullName || "",
      phone: data.phone,
      role: data.role || UserRole.CLERK,
      isActive: data.isActive ?? true,
      lastLogin: undefined,
      createdAt: this.now(),
      updatedAt: this.now(),
    };

    this.mockUsers.push(newUser);
    return this.mockSuccess(newUser);
  }

  async update(id: number, data: Partial<User>): Promise<User> {
    const index = this.mockUsers.findIndex((u) => u.id === id);
    if (index === -1) {
      throw new Error(`User with id ${id} not found`);
    }

    this.mockUsers[index] = {
      ...this.mockUsers[index],
      ...data,
      updatedAt: this.now(),
    };

    return this.mockSuccess(this.mockUsers[index]);
  }

  async delete(id: number): Promise<boolean> {
    const index = this.mockUsers.findIndex((u) => u.id === id);
    if (index === -1) {
      return this.mockSuccess(false);
    }

    this.mockUsers.splice(index, 1);
    return this.mockSuccess(true);
  }

  /**
   * Login with username and password
   */
  async login(username: string, password: string): Promise<AuthResponse> {
    await this.simulateDelay();

    const user = this.mockUsers.find((u) => u.username === username);

    if (!user) {
      throw new Error("Tên đăng nhập hoặc mật khẩu không đúng");
    }

    if (!user.isActive) {
      throw new Error("Tài khoản đã bị vô hiệu hóa");
    }

    // In real app, verify password hash
    // For mock, accept any password

    // Update last login
    user.lastLogin = this.now();

    // Remove password from response
    const { passwordHash, ...userWithoutPassword } = user;
    this.currentUser = userWithoutPassword;

    // Generate mock JWT token
    const token = `mock_jwt_token_${user.id}_${Date.now()}`;
    const expiresAt = this.addDays(7); // 7 days

    return this.mockSuccess({
      user: userWithoutPassword,
      token,
      expiresAt,
    });
  }

  /**
   * Logout current user
   */
  async logout(): Promise<boolean> {
    await this.simulateDelay();
    this.currentUser = null;
    return true;
  }

  /**
   * Get current logged-in user
   */
  async getCurrentUser(): Promise<Omit<User, "passwordHash"> | null> {
    await this.simulateDelay();
    return this.currentUser;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  /**
   * Validate token (mock implementation)
   */
  async validateToken(token: string): Promise<boolean> {
    await this.simulateDelay();
    // Mock validation - always return true if user is logged in
    return this.currentUser !== null;
  }

  /**
   * Change password
   */
  async changePassword(
    userId: number,
    oldPassword: string,
    newPassword: string
  ): Promise<boolean> {
    await this.simulateDelay();

    const user = this.mockUsers.find((u) => u.id === userId);
    if (!user) {
      throw new Error("Người dùng không tồn tại");
    }

    // In real app, verify old password and hash new password
    // For mock, just return success
    user.passwordHash = "$2y$10$NEW_HASH";
    user.updatedAt = this.now();

    return true;
  }
}

export const AuthService = new AuthServiceClass();
