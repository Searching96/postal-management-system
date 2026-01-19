# CHƯƠNG 4: CÔNG NGHỆ SỬ DỤNG

## 4.1. Công nghệ Backend

### 4.1.1. Java & Spring Boot

- **Java 17+**: Ngôn ngữ lập trình hướng đối tượng, mạnh mẽ và bảo mật cao, phù hợp cho các hệ thống enterprise.
- **Spring Boot 3.x**: Framework phát triển ứng dụng web nhanh chóng với cấu hình tự động (auto-configuration), tích hợp sẵn embedded server (Tomcat), và hỗ trợ RESTful API.
- **Spring Security**: Module bảo mật cung cấp xác thực (authentication) và phân quyền (authorization) với JWT token.
- **Spring Data JPA**: ORM framework giúp thao tác database thông qua các repository interface.
- **Spring WebSocket**: Hỗ trợ giao tiếp real-time cho tính năng theo dõi vị trí shipper.

### 4.1.2. Database

- **MySQL/PostgreSQL**: Hệ quản trị cơ sở dữ liệu quan hệ (RDBMS) lưu trữ dữ liệu đơn hàng, lô hàng, nhân viên, bưu cục.
- **Flyway/Liquibase**: Công cụ quản lý database migration, đảm bảo tính nhất quán schema giữa các môi trường.

### 4.1.3. DevOps & Deployment

- **Docker**: Container hóa ứng dụng, đảm bảo môi trường chạy đồng nhất từ development đến production.
- **Docker Compose**: Quản lý multi-container (backend, database, frontend) trong một file cấu hình duy nhất.
- **Maven**: Build tool quản lý dependencies và lifecycle của dự án Java.

---

## 4.2. Công nghệ Frontend

### 4.2.1. React & TypeScript

- **React 18+**: Thư viện JavaScript xây dựng giao diện người dùng theo component-based architecture, hỗ trợ Virtual DOM tối ưu hiệu năng render.
- **TypeScript**: Superset của JavaScript với static typing, giúp phát hiện lỗi sớm và tăng khả năng bảo trì code.
- **React Router**: Thư viện định tuyến cho Single Page Application (SPA), hỗ trợ protected routes theo role.

### 4.2.2. State Management & API

- **React Context API**: Quản lý global state (authentication, user info) không cần thư viện bên ngoài.
- **Axios**: HTTP client xử lý request/response với backend API, hỗ trợ interceptors cho JWT token.
- **React Query** _(optional)_: Caching và synchronization dữ liệu từ server.

### 4.2.3. UI/UX Framework

- **Tailwind CSS**: Utility-first CSS framework cho phép styling nhanh chóng với các class tiện ích.
- **Vite**: Build tool thế hệ mới với Hot Module Replacement (HMR) cực nhanh, thay thế Create React App.
- **Leaflet / Google Maps API**: Thư viện bản đồ hiển thị vị trí bưu cục và theo dõi shipper real-time.

### 4.2.4. Real-time Features

- **WebSocket (SockJS + STOMP)**: Giao thức giao tiếp hai chiều real-time cho tính năng tracking vị trí shipper.
- **Geolocation API**: API trình duyệt lấy tọa độ GPS của shipper trong quá trình giao hàng.

---

## 4.3. Công nghệ AI/ML - ABSA (Aspect-Based Sentiment Analysis)

### 4.3.1. Giới thiệu ABSA

**Aspect-Based Sentiment Analysis (ABSA)** là kỹ thuật phân tích cảm xúc nâng cao, không chỉ xác định cảm xúc tổng thể của văn bản mà còn nhận diện cảm xúc đối với từng **khía cạnh (aspect)** cụ thể được đề cập.

**Ví dụ trong hệ thống bưu chính:**

> _"Giao hàng nhanh nhưng thái độ shipper không tốt, đóng gói cẩn thận."_

| Aspect          | Sentiment  |
| --------------- | ---------- |
| Giao hàng       | Positive ✓ |
| Thái độ shipper | Negative ✗ |
| Đóng gói        | Positive ✓ |

### 4.3.2. Ứng dụng ABSA trong đồ án

- **Phân tích đánh giá khách hàng**: Tự động phân loại feedback theo các khía cạnh (tốc độ giao hàng, thái độ nhân viên, chất lượng đóng gói, giá cước).
- **Cải thiện dịch vụ**: Xác định điểm yếu cụ thể cần cải thiện dựa trên phân tích aspect.
- **Dashboard thống kê**: Hiển thị biểu đồ sentiment theo từng aspect theo thời gian.

### 4.3.3. Công nghệ triển khai ABSA

- **Python**: Ngôn ngữ chính cho xử lý NLP và ML.
- **Transformers (Hugging Face)**: Thư viện pre-trained models cho NLP tasks.
- **PhoBERT**: Mô hình BERT được pre-train trên tiếng Việt, phù hợp cho ABSA tiếng Việt.
- **PyTorch/TensorFlow**: Framework deep learning huấn luyện và inference model.
- **FastAPI**: Framework Python xây dựng API cho ABSA service, tích hợp với backend Spring Boot.
