package com.klef.soa.exam.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Medical Camp CRUD Service API")
                        .version("1.0")
                        .description("API for creating, displaying, updating, and deleting medical camps")
                        .contact(new Contact()
                                .name("KLUniversity")
                                .email("demo@kluniversity.in")));
    }
}