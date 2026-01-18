# Spring Boot Integration Guide

## Tổng quan
Hệ thống ABSA (Aspect-Based Sentiment Analysis) phân tích comment bưu điện theo 4 khía cạnh: **time**, **staff**, **quality**, **price**.

## Kiến trúc
```
Spring Boot → Flask API → Redis Buffer → Consumer (monitor Redis) → PhoBERT Model → Callback
```

**Lưu ý:** Không dùng Kafka. Consumer chỉ monitor Redis buffer mỗi 60s.

## Bước 1: Thêm Dependencies (pom.xml)
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</artifactId>
    <artifactId>spring-boot-starter-webflux</artifactId>
</dependency>
```

## Bước 2: Tạo DTO Classes

### Request DTO
```java
// OrderCommentDTO.java
public class OrderCommentDTO {
    private Long id;
    private String commentText;
    private String callbackUrl; // Optional
}
```

### Response DTO
```java
// ABSAResultDTO.java
public class ABSAResultDTO {
    private Long orderCommentId;
    private Map<String, String> aspects; // {time: positive, staff: neutral, ...}
    private String status; // success/error
}
```

## Bước 3: Tạo Service gửi comment

```java
@Service
public class ABSAService {
    
    private final WebClient webClient;
    
    public ABSAService() {
        this.webClient = WebClient.builder()
            .baseUrl("http://localhost:5000") // Flask API URL
            .build();
    }
    
    public Mono<String> sendCommentForAnalysis(OrderComment comment) {
        Map<String, Object> request = Map.of(
            "id", comment.getId(),
            "comment_text", comment.getCommentText(),
            "callback_url", "http://host.docker.internal:8080/api/absa/callback"
        );
        
        return webClient.post()
            .uri("/api/comments")
            .bodyValue(request)
            .retrieve()
            .bodyToMono(String.class);
    }
}
```

## Bước 4: Tạo Controller nhận callback

```java
@RestController
@RequestMapping("/api/absa")
public class ABSAController {
    
    @Autowired
    private OrderCommentService orderCommentService;
    
    // Endpoint nhận kết quả từ Python consumer
    @PostMapping("/callback")
    public ResponseEntity<String> receiveABSAResult(@RequestBody Map<String, Object> result) {
        Long commentId = Long.parseLong(result.get("order_comment_id").toString());
        Map<String, String> aspects = (Map<String, String>) result.get("aspects");
        
        // Lưu kết quả vào database
        orderCommentService.updateABSAResult(commentId, aspects);
        
        return ResponseEntity.ok("Received");
    }
    
    // Endpoint trigger batch analysis nếu cần
    @PostMapping("/trigger-batch")
    public ResponseEntity<String> triggerBatch() {
        // Gọi Flask API để force fill buffer
        WebClient.create("http://localhost:5000")
            .post()
            .uri("/api/batch/fill")
            .header("Content-Type", "application/json")
            .bodyValue("{}")
            .retrieve()
            .bodyToMono(String.class)
            .block();
        
        return ResponseEntity.ok("Batch triggered");
    }
}
```

## Bước 5: Application Properties

```properties
# application.properties
absa.api.url=http://localhost:5000
absa.callback.url=http://host.docker.internal:8080/api/absa/callback
```

## Format kết quả callback
```json
{
  "order_comment_id": "123",
  "status": "success",
  "aspects": {
    "time": "positive",      // -1:not_mentioned, 0:negative, 1:neutral, 2:positive
    "staff": "neutral",
    "quality": "positive",
    "price": "not_mentioned"
  },
  "timestamp": "2026-01-18T01:10:35"
}
```

## Xử lý Batch
- **Tự động**: Mỗi 128 comments hoặc sau 3 giờ → inference tự động
- **Thủ công**: POST `/api/batch/fill` để force trigger ngay

## Docker Network
Nếu Spring Boot chạy trong Docker:
```yaml
services:
  springboot:
    networks:
      - postal-network
    environment:
      ABSA_API_URL: http://postal-comment-api:5000
      CALLBACK_URL: http://springboot:8080/api/absa/callback

networks:
  postal-network:
    external: true
```

## API Endpoints Flask
- `POST /api/comments` - Gửi 1 comment
- `POST /api/comments/batch` - Gửi nhiều comments
- `GET /api/batch/status` - Xem trạng thái buffer (x/128)
- `POST /api/batch/fill` - Force trigger inference
- `GET /api/results/{id}` - Lấy kết quả (nếu không dùng callback)

## Testing
```bash
# Start Docker containers
docker-compose up -d

# Test send comment
curl -X POST http://localhost:5000/api/comments \
  -H "Content-Type: application/json" \
  -d '{
    "id": 1,
    "comment_text": "Dịch vụ bưu điện nhanh chóng, nhân viên nhiệt tình",
    "callback_url": "http://host.docker.internal:8080/api/absa/callback"
  }'

# Check batch status
curl http://localhost:5000/api/batch/status
```

## Error Handling
- **Timeout**: Callback có retry 3 lần
- **Model error**: Status = "error" trong callback
- **No callback URL**: Kết quả lưu Redis 1h, GET `/api/results/{id}`

## Notes
- Callback URL phải accessible từ Docker container
- Dùng `host.docker.internal` nếu Spring Boot chạy local
- Buffer threshold: 128 comments (có thể config qua env `BATCH_SIZE`)
- Timeout: 3 giờ (config qua env `BATCH_TIMEOUT_HOURS`)
