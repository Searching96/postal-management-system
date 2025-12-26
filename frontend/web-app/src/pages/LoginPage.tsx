import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store";
import { Button, Input } from "@/components";
import { Lock, User } from "lucide-react";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    try {
      await login(username, password);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng nhập thất bại");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-secondary-900 mb-2">Đăng nhập</h2>
      <p className="text-secondary-600 mb-6">
        Nhập thông tin đăng nhập để truy cập hệ thống
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <Input
          label="Tên đăng nhập"
          type="text"
          placeholder="Nhập tên đăng nhập"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          leftIcon={<User size={18} />}
          required
        />

        <Input
          label="Mật khẩu"
          type="password"
          placeholder="Nhập mật khẩu"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock size={18} />}
          required
        />

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center">
            <input type="checkbox" className="mr-2" />
            <span className="text-secondary-600">Ghi nhớ đăng nhập</span>
          </label>
          <a href="#" className="text-primary-600 hover:text-primary-700">
            Quên mật khẩu?
          </a>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          isLoading={isLoading}
        >
          Đăng nhập
        </Button>
      </form>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800 font-medium mb-2">
          Tài khoản demo:
        </p>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>
            • Quản trị viên:{" "}
            <code className="bg-blue-100 px-1 py-0.5 rounded">
              admin / password
            </code>
          </li>
          <li>
            • Quản lý bưu cục:{" "}
            <code className="bg-blue-100 px-1 py-0.5 rounded">
              manager01 / password
            </code>
          </li>
          <li>
            • Giao dịch viên:{" "}
            <code className="bg-blue-100 px-1 py-0.5 rounded">
              clerk01 / password
            </code>
          </li>
          <li>
            • Nhân viên kho:{" "}
            <code className="bg-blue-100 px-1 py-0.5 rounded">
              warehouse01 / password
            </code>
          </li>
          <li>
            • Điều phối viên:{" "}
            <code className="bg-blue-100 px-1 py-0.5 rounded">
              dispatcher01 / password
            </code>
          </li>
          <li>
            • Kế toán:{" "}
            <code className="bg-blue-100 px-1 py-0.5 rounded">
              accountant01 / password
            </code>
          </li>
          <li>
            • Bưu tá:{" "}
            <code className="bg-blue-100 px-1 py-0.5 rounded">
              courier01 / password
            </code>
          </li>
        </ul>
      </div>
    </div>
  );
};
