# ---------- Build stage ----------
FROM maven:3.9.12-eclipse-temurin-17 AS build
WORKDIR /app

# 1. Copy maven wrapper + pom trước để cache dependencies
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

RUN chmod +x mvnw && sed -i 's/\r$//' mvnw

# 2. Download dependencies (cached)
RUN ./mvnw dependency:go-offline

# 3. Copy source code
COPY src ./src

# 4. Build app
RUN ./mvnw clean package -DskipTests


# ---------- Runtime stage ----------
FROM eclipse-temurin:17-jre
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
