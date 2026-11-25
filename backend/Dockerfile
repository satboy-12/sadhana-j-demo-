# Stage 1: Build Application
FROM maven:3.9.8-eclipse-temurin-21 AS builder
WORKDIR /workspace

COPY pom.xml .
RUN mvn dependency:go-offline -B

COPY src ./src
RUN mvn clean package -DskipTests -Pproduction

# Stage 2: Minimal Runtime Container
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

RUN groupadd -r herhealth && useradd -r -g herhealth herhealth
USER herhealth:herhealth

COPY --from=builder /workspace/target/backend-1.0.0.jar app.jar

ENV PORT=8080
EXPOSE ${PORT}

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-Dserver.port=${PORT}", "-jar", "app.jar"]

