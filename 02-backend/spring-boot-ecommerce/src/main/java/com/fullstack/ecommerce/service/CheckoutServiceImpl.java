package com.fullstack.ecommerce.service;

import com.fullstack.ecommerce.dao.CustomerRepository;
import com.fullstack.ecommerce.dto.PaymentInfo;
import com.fullstack.ecommerce.dto.Purchase;
import com.fullstack.ecommerce.dto.PurchaseResponse;
import com.fullstack.ecommerce.entity.Address;
import com.fullstack.ecommerce.entity.Customer;
import com.fullstack.ecommerce.entity.Order;
import com.fullstack.ecommerce.entity.OrderItem;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;

import jakarta.transaction.Transactional;

import java.util.*;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service

public class CheckoutServiceImpl implements CheckoutService {

    private CustomerRepository customerRepository;

    public CheckoutServiceImpl(
    		CustomerRepository customerRepository,
    		@Value("${stripe.key.secret}") String sectretKey
    		) {
        this.customerRepository = customerRepository;
        
        //initialize Stripe API with secret key
        Stripe.apiKey = sectretKey;
    }

    @Transactional
    @Override
    public PurchaseResponse placeOrder(Purchase purchase) {

        // retrieve the order info from dto
        Order order = purchase.getOrder();

        // generate tracking number
        String orderTrackingNumber = generateOrderTrackingNumber();
        order.setOrderTrackingNumber(orderTrackingNumber);

        // populate order with orderItems
        Set<OrderItem> orderItems = purchase.getOrderItems();
        orderItems.forEach(item -> order.add(item));

        // populate order with billingAddress and shippingAddress
        order.setBillingAddress(purchase.getBillingAddress());
        order.setShippingAddress(purchase.getShippingAddress());

        // populate customer with order
        Customer customer = purchase.getCustomer();
        
        // check if this is an existing customer
        String theEmail = customer.getEmail();
        Customer customerFromDB = customerRepository.findByEmail(theEmail);
        
        if (customerFromDB != null) {
        	//
        	customer = customerFromDB;
        }
        
        customer.add(order);

        // save to the database
        customerRepository.save(customer);

        // return a response
        return new PurchaseResponse(orderTrackingNumber);
    }
    
    @Override
    public PaymentIntent createPaymentIntent(PaymentInfo paymentInfo) throws StripeException {
    	
    	List<String> paymentMethodTypes = new ArrayList<>();
    	paymentMethodTypes.add("card");
    	
    	Map<String, Object> params = new HashMap<>();
    	params.put("amount", paymentInfo.getAmount());
    	params.put("currency", paymentInfo.getCurrency());
    	params.put("payment_method_types", paymentMethodTypes);
    	params.put("description", "ecom-fullstack demo test");
        // email for develop mode - delete this part for formal use
    	params.put("receipt_email", paymentInfo.getReceiptEmail());
    	
    	return PaymentIntent.create(params);
    }

    private String generateOrderTrackingNumber() {

        // generate a random UUID number (UUID version-4)
        // For details see: https://en.wikipedia.org/wiki/Universally_unique_identifier
        //
        return UUID.randomUUID().toString();
    }


	}







