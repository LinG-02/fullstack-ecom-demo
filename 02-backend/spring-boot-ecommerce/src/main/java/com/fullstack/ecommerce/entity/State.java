package com.fullstack.ecommerce.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name="state")
@Data
@Getter
@Setter

public class State {
	
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
	private int id;
	
    @Column(name="name")
	private String name;
	
    @ManyToOne
    @JoinColumn(name="country_id")
	private Country country;

}
