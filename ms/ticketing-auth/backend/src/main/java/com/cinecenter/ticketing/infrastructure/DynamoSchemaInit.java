package com.cinecenter.ticketing.infrastructure;

import java.util.*;

/**
 * Inicializador y verificador de esquemas DynamoDB y seeder demostrativo (PLAN-10, PLAN-19).
 */
public class DynamoSchemaInit {

    public static class TableDefinition {
        public final String tableName;
        public final String partitionKey;
        public final String sortKey;
        public final String ttlAttribute;

        public TableDefinition(String tableName, String partitionKey, String sortKey, String ttlAttribute) {
            this.tableName = tableName;
            this.partitionKey = partitionKey;
            this.sortKey = sortKey;
            this.ttlAttribute = ttlAttribute;
        }
    }

    public static List<TableDefinition> getRequiredTables() {
        return List.of(
                new TableDefinition("seat_holds", "showtimeId", "seatCode", "ttlEpochSeconds"),
                new TableDefinition("checkout_orders", "orderId", "idempotencyKey", null),
                new TableDefinition("client_users", "userId", "email", null)
        );
    }

    public static Map<String, String> getDemoUsers() {
        Map<String, String> users = new HashMap<>();
        users.put("admin@cinecenter.com", "ROLE_ADMIN");
        users.put("cajero@cinecenter.com", "ROLE_CASHIER");
        users.put("cliente@cinecenter.com", "ROLE_CLIENT");
        return users;
    }

    public static String getRedirectUrlForRole(String role) {
        return switch (role) {
            case "ROLE_ADMIN" -> "http://localhost:4200/admin";
            case "ROLE_CASHIER" -> "http://localhost:8080/pos/candy-scan";
            case "ROLE_CLIENT" -> "/cartelera";
            default -> "/";
        };
    }
}
