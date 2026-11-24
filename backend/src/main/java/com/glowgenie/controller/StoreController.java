package com.glowgenie.controller;

import com.glowgenie.model.*;
import com.glowgenie.repository.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class StoreController {
    private final ProductRepository products;
    private final CustomerRepository customers;
    private final OrderRepository orders;

    public StoreController(ProductRepository products, CustomerRepository customers, OrderRepository orders) {
        this.products=products; this.customers=customers; this.orders=orders;
    }

    @GetMapping("/products")
    public List<Product> allProducts() { return products.findAll(); }

    @PostMapping("/products")
    public Product addProduct(@RequestBody Product product) { return products.save(product); }

    @PostMapping("/auth/register")
    public ResponseEntity<?> register(@RequestBody Map<String,String> body) {
        String email=body.getOrDefault("email","").trim().toLowerCase();
        if(email.isBlank() || body.getOrDefault("password","").isBlank())
            return ResponseEntity.badRequest().body(Map.of("message","Name, email and password are required"));
        if(customers.findByEmail(email).isPresent())
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message","Email already registered"));
        Customer c=customers.save(new Customer(body.getOrDefault("name","Customer"),email,body.get("password")));
        return ResponseEntity.ok(Map.of("name",c.getName(),"email",c.getEmail()));
    }

    @PostMapping("/auth/login")
    public ResponseEntity<?> login(@RequestBody Map<String,String> body) {
        String email=body.getOrDefault("email","").trim().toLowerCase();
        Optional<Customer> found=customers.findByEmail(email);
        if(found.isEmpty() || !found.get().getPassword().equals(body.get("password")))
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message","Invalid email or password"));
        return ResponseEntity.ok(Map.of("name",found.get().getName(),"email",found.get().getEmail()));
    }

    @PostMapping("/orders")
    public ShopOrder placeOrder(@RequestBody ShopOrder order) {
        order.setStatus("Placed");
        return orders.save(order);
    }

    @GetMapping("/orders/{email}")
    public List<ShopOrder> customerOrders(@PathVariable String email) {
        return orders.findByCustomerEmailOrderByCreatedAtDesc(email);
    }

    @PostMapping("/seed")
    public Map<String,String> seed() {
        if(products.count()==0) {
            products.saveAll(List.of(
                new Product("Hydrating Face Moisturizer","Glow Recipe","Skincare","Daily lightweight hydration",899,"https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=700"),
                new Product("Vitamin C Brightening Serum","Minimalist","Skincare","Brightening serum for daily routine",699,"https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=700"),
                new Product("Gentle Foaming Cleanser","Cetaphil","Skincare","Gentle everyday face cleanser",549,"https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?w=700"),
                new Product("Matte Lipstick","Maybelline","Makeup","Comfortable matte colour",499,"https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=700"),
                new Product("Everyday Foundation","L'Oreal Paris","Makeup","Natural-looking foundation",799,"https://images.unsplash.com/photo-1631214540242-6cb7b3c6b6b4?w=700"),
                new Product("Daily Sunscreen SPF 50","Aqualogica","Skincare","Lightweight daily sun protection",599,"https://images.unsplash.com/photo-1556228720-195a672e8a03?w=700")
            ));
        }
        return Map.of("message","Product catalogue is ready");
    }
}
