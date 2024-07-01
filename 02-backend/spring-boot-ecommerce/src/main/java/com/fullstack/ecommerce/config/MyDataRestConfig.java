package com.fullstack.ecommerce.config;

import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.rest.core.config.RepositoryRestConfiguration;
import org.springframework.data.rest.webmvc.config.RepositoryRestConfigurer;
import org.springframework.http.HttpMethod;
import org.springframework.web.servlet.config.annotation.CorsRegistry;

import com.fullstack.ecommerce.entity.Product;
import com.fullstack.ecommerce.entity.ProductCategory;
import com.fullstack.ecommerce.entity.Country;
import com.fullstack.ecommerce.entity.State;
import com.fullstack.ecommerce.entity.Order;


import jakarta.persistence.EntityManager;
import jakarta.persistence.metamodel.EntityType;
import java.util.*;



@Configuration
public class MyDataRestConfig implements RepositoryRestConfigurer{
	
	@Value("${allowed.origins}")
	private String[] theAllowedOrigins;
	
	private EntityManager entityManager;
	
	@Autowired
	public void MydataRestConfig(EntityManager theEntityManager) {
		entityManager = theEntityManager;
	}
	
	
	
	
	
	@Override 
	public void configureRepositoryRestConfiguration(RepositoryRestConfiguration config, CorsRegistry cors) {
		HttpMethod[] theUnsupportedActions =  {HttpMethod.PUT, HttpMethod.POST, HttpMethod.DELETE, HttpMethod.PATCH};
		
		// disable HTTP methods: PUT, POST, and DELETE for product, productCategory, country, and state
		// we disable these functions for 1.0 release, these functions will be able in later version
		disableHttpMethods(Product.class, config, theUnsupportedActions);
		disableHttpMethods(ProductCategory.class, config, theUnsupportedActions);
		disableHttpMethods(Country.class, config, theUnsupportedActions);
		disableHttpMethods(State.class, config, theUnsupportedActions);
		disableHttpMethods(Order.class, config, theUnsupportedActions);


		
		// call an internal helper method
		exposeIds(config);
		
		// configure cors mapping
		cors.addMapping(config.getBasePath() + "/**").allowedOrigins(theAllowedOrigins);
	}


	// disable HTTP methods
	private void disableHttpMethods(Class theClass, RepositoryRestConfiguration config, HttpMethod[] theUnsupportedActions) {
		// disable HTTP methods for product category version 1.0: PUT, POST, and DELETE
		config.getExposureConfiguration()
		.forDomainType(theClass)
		.withItemExposure((metdata, httpMethods) -> httpMethods.disable(theUnsupportedActions))
		.withCollectionExposure((metdata, httpMethods) -> httpMethods.disable(theUnsupportedActions));
	}
	
	private void exposeIds(RepositoryRestConfiguration config) {
		// expose entity ids
		
		
		// - get a list of all entity classes from the entity manager
		Set<EntityType<?>> entities = entityManager.getMetamodel().getEntities();
		
		// - create an array of the entity type
		List<Class> entityClasses = new ArrayList<>();
		
		// - get the entity types for the entities
		for (EntityType tempEntityType: entities) {
			entityClasses.add(tempEntityType.getJavaType());
		}
		
		// - expose the entity ids for the array of entity/domain types
		Class[] domainTypes = entityClasses.toArray(new Class[0]);
		config.exposeIdsFor(domainTypes);
		
		
	}
	
}
