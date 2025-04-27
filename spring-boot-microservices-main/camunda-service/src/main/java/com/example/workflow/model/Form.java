package com.example.workflow.model;

import lombok.*;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.TypeDef;
import com.vladmihalcea.hibernate.type.json.JsonType;

import javax.persistence.*;
import java.util.Map;

@Entity(name = "forms")
@NoArgsConstructor
@Getter
@Setter
@TypeDef(name = "json", typeClass = JsonType.class) // Register the JSON type
public class Form extends BaseEntity {
    @Column(name = "title", unique = true, nullable = false)
    private String title;
    
    @Column(name = "form_key", unique = true, nullable = false)
    private String formKey; // Use camelCase for field names

    @Type(type = "json")
    @Column(columnDefinition = "json", nullable = false)
    private Map<String, Object> content; // Use Map<String, Object> for JSON data
}