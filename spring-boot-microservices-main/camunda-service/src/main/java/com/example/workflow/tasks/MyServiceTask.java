package com.example.workflow.tasks;

import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.springframework.stereotype.Component;

@Component
public class MyServiceTask implements JavaDelegate {

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        // Business logic for the service task
        System.out.println("Service Task Executed!");
        // You can access process variables like this:
        String variable = (String) execution.getVariable("exampleVariable");
        System.out.println("Process variable 'exampleVariable': " + variable);
    }
}