package com.safalifter.jobservice;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test") // Utiliser le profil test avec la configuration H2
class JobServiceApplicationTests {

	@Test
	void contextLoads() {
	}

}
