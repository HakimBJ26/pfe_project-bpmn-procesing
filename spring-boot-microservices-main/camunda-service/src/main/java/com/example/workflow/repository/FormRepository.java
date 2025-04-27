package com.example.workflow.repository;

import com.example.workflow.model.Form;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FormRepository extends JpaRepository<Form, String> {
    // Return an Optional<Form> to handle cases where the form might not exist
    Optional<Form> findByFormKey(String formKey);

    // Find form by title
    Optional<Form> findByTitle(String title);

    // Custom query to delete a form by form_id
    void deleteByFormKey(String formKey);

    // Delete form by id
    void deleteById(String id);

    boolean existsByFormKey(String formKey);

    boolean existsByTitle(String title);

    boolean existsById(String id);
}