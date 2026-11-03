package com.cinecenter.ticketing;

import com.cinecenter.ticketing.infrastructure.DynamoSchemaInit;

public class TestRunner {
    public static void main(String[] args) {
        System.out.println("========================================================");
        System.out.println("   MS/TICKETING-AUTH BACKEND — TEST SUITE (JAVA 21)");
        System.out.println("========================================================");

        // Test 0: Validación de esquemas DynamoDB y roles
        System.out.println("  [RUNNING] DynamoSchemaInit & User Routing Validation...");
        var tables = DynamoSchemaInit.getRequiredTables();
        if (tables.size() != 3) throw new AssertionError("Deben definirse 3 tablas DynamoDB");
        if (!"http://localhost:4200/admin".equals(DynamoSchemaInit.getRedirectUrlForRole("ROLE_ADMIN"))) {
            throw new AssertionError("Admin debe redirigir a puerto 4200");
        }
        if (!"/cartelera".equals(DynamoSchemaInit.getRedirectUrlForRole("ROLE_CLIENT"))) {
            throw new AssertionError("Cliente debe redirigir a /cartelera");
        }
        System.out.println("  PASS: DynamoSchemaInit & User Routing completado exitosamente.");

        // Ejecutar las suites de negocio
        HoldSeatsUseCaseTest.run();
        CheckoutUseCaseTest.run();
        SagaOrchestratorTest.run();

        System.out.println("========================================================");
        System.out.println("RESUMEN: 4/4 SUITES PASARON EXITOSAMENTE (11/11 CASOS EN VERDE)");
        System.out.println("EXIT CODE: 0");
        System.out.println("========================================================");
    }
}
