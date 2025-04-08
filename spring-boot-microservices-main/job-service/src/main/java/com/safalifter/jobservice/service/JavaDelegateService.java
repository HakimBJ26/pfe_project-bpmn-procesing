package com.safalifter.jobservice.service;

import com.safalifter.jobservice.dto.JavaDelegateDTO;
import com.safalifter.jobservice.dto.JavaDelegateRequest;
import com.safalifter.jobservice.model.JavaDelegate;
import com.safalifter.jobservice.repository.JavaDelegateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.tools.*;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class JavaDelegateService {

    private final JavaDelegateRepository javaDelegateRepository;

    /**
     * Récupère tous les JavaDelegates disponibles
     */
    public List<JavaDelegateDTO> getAllJavaDelegates() {
        return javaDelegateRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Récupère un JavaDelegate par son nom de classe
     */
    public JavaDelegateDTO getJavaDelegateByClassName(String className) {
        return javaDelegateRepository.findByClassName(className)
                .map(this::convertToDTO)
                .orElseThrow(() -> new NoSuchElementException("JavaDelegate not found: " + className));
    }

    /**
     * Crée un nouveau JavaDelegate
     */
    @Transactional
    public JavaDelegateDTO createJavaDelegate(JavaDelegateRequest request) {
        log.info("Création d'un nouveau JavaDelegate: {}", request.getName());
        
        if (javaDelegateRepository.existsByClassName(request.getName())) {
            throw new IllegalArgumentException("Un JavaDelegate avec ce nom existe déjà: " + request.getName());
        }
        
        // Extraire le nom de package du nom de classe complet
        String packageName = extractPackageName(request.getName());
        String simpleClassName = extractSimpleClassName(request.getName());
        
        // Valider le code source
        validateSourceCode(request.getSourceCode(), packageName, simpleClassName);
        
        // Créer l'entité
        JavaDelegate javaDelegate = JavaDelegate.builder()
                .className(request.getName())
                .sourceCode(request.getSourceCode())
                .description(request.getDescription())
                .packageName(packageName)
                .compiled(false) // La compilation sera effectuée par un processus séparé
                .build();
        
        // Sauvegarder dans la base de données
        JavaDelegate savedDelegate = javaDelegateRepository.save(javaDelegate);
        
        // Tenter de compiler le code source
        try {
            boolean compiled = compileJavaDelegate(savedDelegate);
            savedDelegate.setCompiled(compiled);
            
            if (compiled) {
                log.info("JavaDelegate compilé avec succès: {}", request.getName());
            } else {
                log.warn("Échec de compilation du JavaDelegate: {}", request.getName());
            }
            
            // Mettre à jour l'état de compilation
            savedDelegate = javaDelegateRepository.save(savedDelegate);
        } catch (Exception e) {
            log.error("Erreur lors de la compilation du JavaDelegate", e);
        }
        
        return convertToDTO(savedDelegate);
    }

    /**
     * Met à jour un JavaDelegate existant
     */
    @Transactional
    public JavaDelegateDTO updateJavaDelegate(String className, JavaDelegateRequest request) {
        log.info("Mise à jour du JavaDelegate: {}", className);
        
        JavaDelegate existingDelegate = javaDelegateRepository.findByClassName(className)
                .orElseThrow(() -> new NoSuchElementException("JavaDelegate not found: " + className));
        
        // Si le nom de classe a changé, vérifier qu'il n'y a pas de conflit
        if (!className.equals(request.getName()) && javaDelegateRepository.existsByClassName(request.getName())) {
            throw new IllegalArgumentException("Un JavaDelegate avec ce nom existe déjà: " + request.getName());
        }
        
        // Extraire le nom de package du nom de classe complet
        String packageName = extractPackageName(request.getName());
        String simpleClassName = extractSimpleClassName(request.getName());
        
        // Valider le code source
        validateSourceCode(request.getSourceCode(), packageName, simpleClassName);
        
        // Mettre à jour l'entité
        existingDelegate.setClassName(request.getName());
        existingDelegate.setSourceCode(request.getSourceCode());
        existingDelegate.setDescription(request.getDescription());
        existingDelegate.setPackageName(packageName);
        existingDelegate.setCompiled(false); // La compilation sera effectuée à nouveau
        
        // Sauvegarder les modifications
        JavaDelegate updatedDelegate = javaDelegateRepository.save(existingDelegate);
        
        // Tenter de compiler le code source
        try {
            boolean compiled = compileJavaDelegate(updatedDelegate);
            updatedDelegate.setCompiled(compiled);
            
            if (compiled) {
                log.info("JavaDelegate compilé avec succès: {}", request.getName());
            } else {
                log.warn("Échec de compilation du JavaDelegate: {}", request.getName());
            }
            
            // Mettre à jour l'état de compilation
            updatedDelegate = javaDelegateRepository.save(updatedDelegate);
        } catch (Exception e) {
            log.error("Erreur lors de la compilation du JavaDelegate", e);
        }
        
        return convertToDTO(updatedDelegate);
    }

    /**
     * Supprime un JavaDelegate
     */
    @Transactional
    public void deleteJavaDelegate(String className) {
        log.info("Suppression du JavaDelegate: {}", className);
        
        JavaDelegate delegate = javaDelegateRepository.findByClassName(className)
                .orElseThrow(() -> new NoSuchElementException("JavaDelegate not found: " + className));
        
        javaDelegateRepository.delete(delegate);
    }

    /**
     * Convertit une entité JavaDelegate en DTO
     */
    private JavaDelegateDTO convertToDTO(JavaDelegate delegate) {
        return JavaDelegateDTO.builder()
                .id(delegate.getId())
                .className(delegate.getClassName())
                .description(delegate.getDescription())
                .packageName(delegate.getPackageName())
                .compiled(delegate.isCompiled())
                .createdAt(delegate.getCreatedAt())
                .updatedAt(delegate.getUpdatedAt())
                .build();
    }

    /**
     * Extrait le nom de package du nom de classe complet
     */
    private String extractPackageName(String fullClassName) {
        int lastDotIndex = fullClassName.lastIndexOf('.');
        if (lastDotIndex == -1) {
            return ""; // Pas de package
        }
        return fullClassName.substring(0, lastDotIndex);
    }

    /**
     * Extrait le nom simple de la classe du nom complet
     */
    private String extractSimpleClassName(String fullClassName) {
        int lastDotIndex = fullClassName.lastIndexOf('.');
        if (lastDotIndex == -1) {
            return fullClassName; // Pas de package
        }
        return fullClassName.substring(lastDotIndex + 1);
    }

    /**
     * Valide le code source d'un JavaDelegate
     */
    private void validateSourceCode(String sourceCode, String packageName, String className) {
        if (sourceCode == null || sourceCode.trim().isEmpty()) {
            throw new IllegalArgumentException("Le code source ne peut pas être vide");
        }

        // Vérifier que le package déclaré correspond
        if (!packageName.isEmpty() && !sourceCode.contains("package " + packageName)) {
            throw new IllegalArgumentException("Le package déclaré dans le code source ne correspond pas au nom de classe");
        }

        // Vérifier que la classe est déclarée correctement
        if (!sourceCode.contains("class " + className)) {
            throw new IllegalArgumentException("La classe déclarée dans le code source ne correspond pas au nom de classe");
        }

        // Vérifier que la classe implémente org.camunda.bpm.engine.delegate.JavaDelegate
        if (!sourceCode.contains("implements org.camunda.bpm.engine.delegate.JavaDelegate")) {
            throw new IllegalArgumentException("La classe doit implémenter org.camunda.bpm.engine.delegate.JavaDelegate");
        }

        // Vérifier que la méthode execute est définie
        if (!sourceCode.contains("public void execute(") && !sourceCode.contains("public void execute (")) {
            throw new IllegalArgumentException("La classe doit définir la méthode 'execute' de l'interface JavaDelegate");
        }
    }

    /**
     * Tente de compiler le code source du JavaDelegate
     */
    private boolean compileJavaDelegate(JavaDelegate delegate) throws IOException {
        // Créer un dossier temporaire pour la compilation
        Path tempDir = Files.createTempDirectory("javadelegate-");
        
        // Créer les dossiers de package
        String packageDir = delegate.getPackageName().replace('.', File.separatorChar);
        Path sourcePath = Paths.get(tempDir.toString(), packageDir);
        Files.createDirectories(sourcePath);
        
        // Nom de classe simple
        String simpleClassName = extractSimpleClassName(delegate.getClassName());
        
        // Créer le fichier source
        File sourceFile = new File(sourcePath.toFile(), simpleClassName + ".java");
        try (FileWriter writer = new FileWriter(sourceFile)) {
            writer.write(delegate.getSourceCode());
        }
        
        // Compiler le fichier source
        JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();
        if (compiler == null) {
            log.error("Compilateur Java non disponible");
            return false;
        }
        
        DiagnosticCollector<JavaFileObject> diagnostics = new DiagnosticCollector<>();
        StandardJavaFileManager fileManager = compiler.getStandardFileManager(diagnostics, null, null);
        
        Iterable<? extends JavaFileObject> compilationUnits = fileManager.getJavaFileObjectsFromFiles(
                Collections.singletonList(sourceFile));
        
        // Options de compilation
        List<String> options = List.of("-classpath", System.getProperty("java.class.path"));
        
        JavaCompiler.CompilationTask task = compiler.getTask(
                null, fileManager, diagnostics, options, null, compilationUnits);
        
        boolean success = task.call();
        
        // Journaliser les diagnostics de compilation
        for (Diagnostic<? extends JavaFileObject> diagnostic : diagnostics.getDiagnostics()) {
            log.info("Diagnostic: {}", diagnostic.getMessage(Locale.getDefault()));
        }
        
        // Nettoyer les fichiers temporaires
        try {
            Files.walk(tempDir)
                    .sorted(Comparator.reverseOrder())
                    .map(Path::toFile)
                    .forEach(File::delete);
        } catch (Exception e) {
            log.warn("Impossible de supprimer les fichiers temporaires", e);
        }
        
        return success;
    }
}
