FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

COPY bin /app/bin
COPY .env /app/.env

EXPOSE 8082

CMD ["java", "-cp", "bin", "com.cinecenter.ticketing.infrastructure.TicketingHttpServer"]
