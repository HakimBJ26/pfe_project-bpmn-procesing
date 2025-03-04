package com.safalifter.jobservice.config;

import org.camunda.bpm.engine.spring.SpringProcessEngineConfiguration;
import org.camunda.bpm.spring.boot.starter.configuration.impl.DefaultProcessEngineConfiguration;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.annotation.EnableTransactionManagement;

@Configuration
@EnableTransactionManagement
public class CamundaConfig extends DefaultProcessEngineConfiguration {

    @Override
    public void postInit(SpringProcessEngineConfiguration configuration) {
        configuration.setDatabaseSchemaUpdate("true");
        configuration.setHistory("audit");
        configuration.setJobExecutorActivate(true);
        configuration.setAuthorizationEnabled(true);

        // Configuration MySQL
        configuration.setJdbcDriver("com.mysql.cj.jdbc.Driver");
        configuration.setDatabaseType("mysql");
    }
}