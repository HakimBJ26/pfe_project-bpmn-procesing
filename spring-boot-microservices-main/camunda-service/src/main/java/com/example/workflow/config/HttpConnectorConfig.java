package com.example.workflow.config;
import org.camunda.connect.Connectors;
import org.camunda.connect.httpclient.HttpConnector;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;



@Configuration
public class HttpConnectorConfig {

    @Bean
    public HttpConnector httpConnector() {
        return Connectors.getConnector(HttpConnector.ID);
    }
}