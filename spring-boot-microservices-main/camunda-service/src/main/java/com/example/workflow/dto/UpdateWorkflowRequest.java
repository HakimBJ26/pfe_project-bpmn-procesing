package com.example.workflow.dto;

import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateWorkflowRequest {
    private String title;

    private String content;

    private List<ConfigItem> config;

    public enum ElementType {
        TASK,
        USER_TASK,
        SERVICE_TASK,
        SCRIPT_TASK,
        BUSINESS_RULE_TASK,
        SEND_TASK,
        RECEIVE_TASK,
        MANUAL_TASK,
        SEQUENCE_FLOW,
        EXCLUSIVE_GATEWAY,
        PARALLEL_GATEWAY,
        INCLUSIVE_GATEWAY
    }

    public enum AttributeType {
        NAME,
        FORM_KEY,
        DELEGATE_EXPRESSION,
        DMN_IMPLEMENTATION,
        FLOW_EXPRESSION,
    }

    @Getter
    @Setter
    public static class ConfigItem {
        private String id;
        private String attributeValue;
        private AttributeType attribute;
        private ElementType type;
        private String resultVariable;
    }
}
