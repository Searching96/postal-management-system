ABSA API Service for Spring Boot Integration (Redis – Flask – PhoBERT)



Hệ thống API xử lý phân tích cảm xúc theo chủ đề (Aspect-Based Sentiment Analysis – ABSA) dành riêng cho tích hợp với Spring Boot backend. Sử dụng Redis làm buffer để batch processing, Flask API nhận comments từ Spring Boot, và PhoBERT model để phân tích cảm xúc cho 4 aspects (time, staff, quality, price).



Hướng dẫn chạy hệ thống:



1\. Giải nén file project (airflow.zip) vào bất kỳ vị trí nào trên máy (ví dụ D:\\BigData\\airflow\\).



2\. Mở PowerShell và chuyển vào thư mục project:

cd D:\\BigData\\airflow



3\. Build lại toàn bộ image (làm lần đầu):

docker compose build --no-cache



4\. Khởi động toàn bộ hệ thống:

docker compose up -d



5\. Kiểm tra các service:

\- Comment API: truy cập http://localhost:5000/health

&nbsp; Service nhận comments từ Spring Boot và lưu vào Redis buffer

&nbsp; 

\- Redis: port 6380 (mapped từ 6379)

&nbsp; Buffer cho batch processing và cache kết quả ABSA

&nbsp;

\- ABSA Consumer: xem logs

&nbsp; docker logs postal-absa-consumer

&nbsp; Monitor buffer mỗi 60s và trigger inference khi đủ 128 comments hoặc timeout 3 giờ



6\. Dừng hệ thống:

docker compose down



Lưu ý:

\- Không đổi tên hoặc di chuyển file docker-compose.yaml ra khỏi thư mục gốc.

\- Không cần tải hoặc import file .tar image. Hệ thống sẽ tự build từ Dockerfile.

\- Lần chạy đầu tiên có thể mất 10-20 phút do Docker tải thư viện.

\- Sau khi khởi động thành công, các container sẽ được lưu trong Docker Desktop.

\- Những lần sau, chỉ cần chạy:

docker compose up -d



Cấu trúc thư mục chính:

D:\\airflow

│

├── models\\ ← PhoBERT ABSA model (phobert_absa_final)

├── projects\\absa\_streaming\\ 

│ &nbsp; ├── api\\comment\_api.py ← Flask API nhận comments

│ &nbsp; ├── scripts\\absa\_consumer\_standalone.py ← Consumer xử lý batch inference

│ &nbsp; └── requirements.txt

├── docker-compose.yaml ← Redis, Comment API, ABSA Consumer

├── Dockerfile

└── README.md



Học phần: SE363 – Phát triển ứng dụng trên nền tảng dữ liệu lớn  

Ngành Kỹ thuật phần mềm – Trường Đại học Công nghệ Thông tin, ĐHQG-HCM  

Thực hiện bởi: HopDT – Faculty of Software Engineering, University of Information Technology (FSE-UIT)

