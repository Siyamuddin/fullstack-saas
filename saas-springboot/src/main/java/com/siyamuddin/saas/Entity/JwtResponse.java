package com.siyamuddin.saas.Entity;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@ToString
public class JwtResponse {
    private String jwtToken;
    private String refreshToken;
    private String username;
    @Builder.Default
    private String tokenType = "Bearer";
}
