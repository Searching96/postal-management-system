package org.f3.postalmanagement.service;

import java.util.Optional;

/**
 * Service for geocoding addresses to coordinates.
 */
public interface IGeocodingService {

    /**
     * Geocode an address to latitude/longitude coordinates.
     * Results are cached to avoid repeated API calls.
     *
     * @param address the full address string
     * @return coordinates as [latitude, longitude] or empty if geocoding failed
     */
    Optional<double[]> geocodeAddress(String address);

    /**
     * Clear the geocoding cache.
     */
    void clearCache();
}
