package com.flashsale.loadtest;

import static io.gatling.javaapi.core.CoreDsl.*;
import static io.gatling.javaapi.http.HttpDsl.*;

import io.gatling.javaapi.core.*;
import io.gatling.javaapi.http.*;

import java.util.UUID;
import java.time.Duration;

public class FlashSaleSimulation extends Simulation {

    HttpProtocolBuilder httpProtocol = http
        .baseUrl("http://localhost:8080")
        .acceptHeader("application/json")
        .contentTypeHeader("application/json");

    ScenarioBuilder scn = scenario("Flash Sale Load Test")
        .exec(
            http("Register User")
                .post("/api/v1/auth/register")
                .body(StringBody(session -> 
                    "{\"email\": \"loaduser_" + UUID.randomUUID().toString() + "@example.com\", \"password\": \"password123\"}"
                )).asJson()
                .check(jsonPath("$.token").saveAs("authToken"))
        )
        .pause(1)
        .exec(
            http("Get Products")
                .get("/api/v1/products")
                .header("Authorization", session -> "Bearer " + session.getString("authToken"))
                .check(jsonPath("$.content[0].id").saveAs("productId"))
        )
        .pause(1)
        .exec(
            http("Create Order")
                .post("/api/v1/orders")
                .header("Authorization", session -> "Bearer " + session.getString("authToken"))
                .header("Idempotency-Key", session -> UUID.randomUUID().toString())
                .body(StringBody(session -> 
                    "{\n" +
                    "  \"items\": [\n" +
                    "    {\n" +
                    "      \"productId\": \"" + session.getString("productId") + "\",\n" +
                    "      \"quantity\": 1\n" +
                    "    }\n" +
                    "  ],\n" +
                    "  \"shippingAddress\": \"123 LoadTest St\",\n" +
                    "  \"paymentMethod\": \"CREDIT_CARD\"\n" +
                    "}"
                )).asJson()
                .check(status().in(201, 400, 409, 429)) // Could fail due to no stock or lock timeout which is fine under load
        );

    {
        setUp(
            scn.injectOpen(
                rampUsers(1000).during(Duration.ofSeconds(10)),
                constantUsersPerSec(100).during(Duration.ofSeconds(20))
            )
        ).protocols(httpProtocol);
    }
}
