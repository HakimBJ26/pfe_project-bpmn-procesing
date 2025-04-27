// package com.example.workflow.delegate;

// import org.apache.kafka.clients.admin.NewTopic;
// import org.camunda.bpm.engine.delegate.DelegateExecution;
// import org.camunda.bpm.engine.delegate.JavaDelegate;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.kafka.core.KafkaTemplate;
// import org.springframework.stereotype.Component;
// import org.springframework.web.client.RestTemplate;

// import com.example.workflow.request.notification.SendNotificationRequest;

// @Component
// public class NotificationTask implements JavaDelegate {

//     @Autowired
//     private KafkaTemplate<String, SendNotificationRequest> kafkaTemplate;

//     @Autowired
//     private NewTopic topic;

//     @Override
//     public void execute(DelegateExecution execution) throws Exception {
//         SendNotificationRequest notification = SendNotificationRequest.builder()
//                 .message("Notification message")
//                 .userId((String) execution.getVariable("userId"))
//                 .taskId((String) execution.getVariable("taskId"))
//                 .build();

//         kafkaTemplate.send(topic.name(), notification);
//     }
// }


package com.example.workflow.delegate;

import org.camunda.bpm.engine.delegate.DelegateExecution;
import org.camunda.bpm.engine.delegate.JavaDelegate;
import org.springframework.stereotype.Component;

@Component
public class NotificationTask implements JavaDelegate {

    @Override
    public void execute(DelegateExecution execution) throws Exception {
        // get title and message from execution variables
        Object title = execution.getVariable("title");
        Object message = execution.getVariable("message");
        //log title and message
        System.out.println("Title: " + title);
        System.out.println("Message: " + message);
    }
}