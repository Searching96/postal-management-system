package org.f3.postalmanagement.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Enables scheduled task execution for automatic batch processing.
 */
@Configuration
@EnableScheduling
public class SchedulingConfig {
}
