package com.careonix.profile.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddressDto {
    private String houseNo;
    private String street;
    private String city;
    private String state;
    private int pincode;
}

