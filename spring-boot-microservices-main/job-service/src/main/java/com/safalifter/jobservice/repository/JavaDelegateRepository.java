package com.safalifter.jobservice.repository;

import com.safalifter.jobservice.model.JavaDelegate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface JavaDelegateRepository extends JpaRepository<JavaDelegate, Long> {
    Optional<JavaDelegate> findByClassName(String className);
    boolean existsByClassName(String className);
}
