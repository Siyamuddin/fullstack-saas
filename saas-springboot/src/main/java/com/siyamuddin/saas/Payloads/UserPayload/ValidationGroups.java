package com.siyamuddin.saas.Payloads.UserPayload;

import jakarta.validation.groups.Default;

/**
 * Validation groups for different scenarios
 */
public interface ValidationGroups {
    interface Create extends Default {}
    interface Update extends Default {}
}

