package org.f3.postalmanagement.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.f3.postalmanagement.service.IGeocodingService;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Geocoding service implementation using Nominatim API.
 * Complies with Nominatim usage policy: max 1 request/second, caching, proper User-Agent.
 */
@Service
@Slf4j
public class GeocodingServiceImpl implements IGeocodingService {

    private static final String NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
    private static final String USER_AGENT = "PostalManagementSystem/1.0 (Contact: admin@postalmanagement.vn)";
    private static final long MIN_REQUEST_INTERVAL_MS = 1000; // 1 second as per policy

    private final Map<String, double[]> geocodeCache = new ConcurrentHashMap<>();
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private long lastRequestTime = 0;

    @Override
    public Optional<double[]> geocodeAddress(String address) {
        if (address == null || address.trim().isEmpty()) {
            return Optional.empty();
        }

        // Check cache first
        String normalizedAddress = address.trim().toLowerCase();
        if (geocodeCache.containsKey(normalizedAddress)) {
            double[] cached = geocodeCache.get(normalizedAddress);
            return cached != null ? Optional.of(cached) : Optional.empty();
        }

        // Rate limiting: ensure at least 1 second between requests
        synchronized (this) {
            long now = System.currentTimeMillis();
            long timeSinceLastRequest = now - lastRequestTime;
            if (timeSinceLastRequest < MIN_REQUEST_INTERVAL_MS) {
                try {
                    Thread.sleep(MIN_REQUEST_INTERVAL_MS - timeSinceLastRequest);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    log.warn("Geocoding rate limiting interrupted", e);
                }
            }
            lastRequestTime = System.currentTimeMillis();
        }

        try {
            String encodedAddress = URLEncoder.encode(address, StandardCharsets.UTF_8);
            String url = String.format("%s?q=%s&format=json&limit=1&countrycodes=vn",
                    NOMINATIM_URL, encodedAddress);

            // Set proper User-Agent as required by Nominatim policy
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", USER_AGENT);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<String> responseEntity = restTemplate.exchange(url, HttpMethod.GET, entity, String.class);
            String response = responseEntity.getBody();
            JsonNode results = objectMapper.readTree(response);

            if (results.isArray() && results.size() > 0) {
                JsonNode firstResult = results.get(0);
                double lat = firstResult.get("lat").asDouble();
                double lon = firstResult.get("lon").asDouble();
                double[] coordinates = new double[]{lat, lon};

                // Cache the result
                geocodeCache.put(normalizedAddress, coordinates);
                log.info("Geocoded address '{}' to [{}, {}]", address, lat, lon);

                return Optional.of(coordinates);
            } else {
                // Cache null result to avoid repeated failed geocoding
                geocodeCache.put(normalizedAddress, null);
                log.warn("No geocoding results found for address: {}", address);
                return Optional.empty();
            }

        } catch (Exception e) {
            log.error("Geocoding failed for address: {}", address, e);
            // Cache null result to avoid repeated failures
            geocodeCache.put(normalizedAddress, null);
            return Optional.empty();
        }
    }

    @Override
    public void clearCache() {
        geocodeCache.clear();
        log.info("Geocoding cache cleared");
    }
}
