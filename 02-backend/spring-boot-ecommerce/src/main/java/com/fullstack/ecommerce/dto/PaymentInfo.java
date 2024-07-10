package com.fullstack.ecommerce.dto;

import lombok.Data;

@Data
public class PaymentInfo {
	
	
	private int amount;
	private String currency;
    // email for develop mode - delete this part for formal use
	private String receiptEmail;


}
