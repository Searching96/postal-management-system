package org.f3.postalmanagement.service;

import org.f3.postalmanagement.config.MinioProperties;
import io.minio.*;
import io.minio.http.Method;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Service for handling file uploads to MinIO object storage.
 * Simplified for postal management: returns URLs directly without separate Attachment entity.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class StorageService {

    private final MinioClient minioClient;
    private final MinioProperties minioProperties;

    /**
     * Initialize MinIO buckets on application startup
     */
    @jakarta.annotation.PostConstruct
    public void initializeBuckets() {
        try {
            String[] buckets = {
                minioProperties.getBucket().getAttachments(),
                minioProperties.getBucket().getAvatars(),
                minioProperties.getBucket().getEvidence()
            };

            for (String bucket : buckets) {
                if (bucket != null && !bucket.isBlank()) {
                    boolean exists = minioClient.bucketExists(
                        BucketExistsArgs.builder().bucket(bucket).build()
                    );
                    if (!exists) {
                        minioClient.makeBucket(
                            MakeBucketArgs.builder().bucket(bucket).build()
                        );
                        log.info("Created MinIO bucket: {}", bucket);
                    } else {
                        log.debug("MinIO bucket already exists: {}", bucket);
                    }
                }
            }
            log.info("MinIO buckets initialized successfully");
        } catch (Exception e) {
            log.error("Failed to initialize MinIO buckets: {}", e.getMessage(), e);
            // Don't fail startup - buckets may be created manually or MinIO might not be running
        }
    }

    /**
     * Upload an avatar image for a user/employee
     * @return The public URL of the uploaded avatar
     */
    public String uploadAvatar(UUID userId, MultipartFile file) throws Exception {
        log.info("Uploading avatar for user: {}", userId);
        validateFile(file);

        String fileKey = generateAvatarKey(userId, file.getOriginalFilename());
        String bucketName = minioProperties.getBucket().getAvatars();

        uploadToMinIO(bucketName, fileKey, file);

        String fileUrl = generateFileUrl(bucketName, fileKey);
        log.info("Avatar uploaded successfully for user: {}", userId);
        return fileUrl;
    }

    /**
     * Upload delivery/pickup evidence image
     * @return The public URL of the uploaded evidence image
     */
    public String uploadEvidence(UUID orderId, String evidenceType, MultipartFile file) throws Exception {
        log.info("Uploading {} evidence for order: {}", evidenceType, orderId);
        validateFile(file);

        String fileKey = generateEvidenceKey(orderId, evidenceType, file.getOriginalFilename());
        String bucketName = minioProperties.getBucket().getEvidence();

        uploadToMinIO(bucketName, fileKey, file);

        String fileUrl = generateFileUrl(bucketName, fileKey);
        log.info("Evidence uploaded successfully for order: {}", orderId);
        return fileUrl;
    }

    /**
     * Upload a general attachment
     * @return The public URL of the uploaded file
     */
    public String uploadAttachment(String category, MultipartFile file) throws Exception {
        log.info("Uploading attachment: {}", file.getOriginalFilename());
        validateFile(file);

        String fileKey = generateAttachmentKey(category, file.getOriginalFilename());
        String bucketName = minioProperties.getBucket().getAttachments();

        uploadToMinIO(bucketName, fileKey, file);

        String fileUrl = generateFileUrl(bucketName, fileKey);
        log.info("Attachment uploaded successfully: {}", file.getOriginalFilename());
        return fileUrl;
    }

    /**
     * Generate presigned URL for secure download
     */
    public String getPresignedDownloadUrl(String bucketName, String fileKey) throws Exception {
        return minioClient.getPresignedObjectUrl(
            GetPresignedObjectUrlArgs.builder()
                .method(Method.GET)
                .bucket(bucketName)
                .object(fileKey)
                .build()
        );
    }

    /**
     * Delete a file from MinIO
     */
    public void deleteFile(String bucketName, String fileKey) throws Exception {
        try {
            minioClient.removeObject(
                RemoveObjectArgs.builder()
                    .bucket(bucketName)
                    .object(fileKey)
                    .build()
            );
            log.info("File deleted from MinIO: {}/{}", bucketName, fileKey);
        } catch (Exception e) {
            log.error("Failed to delete file from MinIO: {}/{}", bucketName, fileKey, e);
            throw e;
        }
    }

    // ==================== PRIVATE HELPERS ====================

    private void uploadToMinIO(String bucketName, String fileKey, MultipartFile file) throws Exception {
        try (InputStream inputStream = file.getInputStream()) {
            minioClient.putObject(
                PutObjectArgs.builder()
                    .bucket(bucketName)
                    .object(fileKey)
                    .stream(inputStream, file.getSize(), -1)
                    .contentType(file.getContentType())
                    .build()
            );
        }
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        // Check file size
        long maxSize = parseFileSize(minioProperties.getMaxFileSize());
        if (file.getSize() > maxSize) {
            throw new IllegalArgumentException("File size exceeds maximum allowed: " + minioProperties.getMaxFileSize());
        }

        // Check file extension
        String fileName = file.getOriginalFilename();
        if (fileName == null) {
            throw new IllegalArgumentException("Invalid file name");
        }

        String extension = getFileExtension(fileName).toLowerCase();
        if (!minioProperties.getAllowedExtensions().contains(extension)) {
            throw new IllegalArgumentException("File type not allowed: " + extension);
        }
    }

    private String generateAvatarKey(UUID userId, String originalFileName) {
        String extension = getFileExtension(originalFileName);
        return String.format("avatars/%s.%s", userId, extension);
    }

    private String generateEvidenceKey(UUID orderId, String evidenceType, String originalFileName) {
        String timestamp = LocalDateTime.now().toString().replace(":", "-");
        String extension = getFileExtension(originalFileName);
        return String.format("evidence/%s/%s_%s.%s", orderId, evidenceType, timestamp, extension);
    }

    private String generateAttachmentKey(String category, String originalFileName) {
        String timestamp = LocalDateTime.now().toString().replace(":", "-");
        String uniqueId = UUID.randomUUID().toString();
        String extension = getFileExtension(originalFileName);
        return String.format("%s/%s_%s.%s", category, timestamp, uniqueId, extension);
    }

    private String generateFileUrl(String bucket, String fileKey) {
        return minioProperties.getPublicUrl().replaceAll("/$", "") + "/" + bucket + "/" + fileKey;
    }

    private String getFileExtension(String fileName) {
        int lastDot = fileName.lastIndexOf('.');
        return lastDot > 0 ? fileName.substring(lastDot + 1) : "";
    }

    private long parseFileSize(String sizeStr) {
        if (sizeStr == null || sizeStr.isBlank()) {
            return 10 * 1024 * 1024; // Default 10MB
        }

        String normalized = sizeStr.toUpperCase().trim();
        StringBuilder numberPart = new StringBuilder();
        StringBuilder unitPart = new StringBuilder();

        for (char c : normalized.toCharArray()) {
            if (Character.isDigit(c)) {
                numberPart.append(c);
            } else {
                unitPart.append(c);
            }
        }

        if (numberPart.length() == 0) return 10 * 1024 * 1024;

        long size = Long.parseLong(numberPart.toString());
        String unit = unitPart.toString().trim();

        if (unit.startsWith("G")) return size * 1024 * 1024 * 1024;
        if (unit.startsWith("M")) return size * 1024 * 1024;
        if (unit.startsWith("K")) return size * 1024;

        return size;
    }
}
