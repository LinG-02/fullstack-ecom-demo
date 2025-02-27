package com.fullstack.ecommerce.dao;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fullstack.ecommerce.entity.Customer;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
	
	Customer findByEmail(String theEmail);

}
