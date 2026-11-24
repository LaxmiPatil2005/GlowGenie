package com.glowgenie.model;

import jakarta.persistence.*;

@Entity
public class Product {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String brand;
    private String category;
    private String description;
    private double price;
    private String imageUrl;

    public Product() {}
    public Product(String name, String brand, String category, String description, double price, String imageUrl) {
        this.name=name; this.brand=brand; this.category=category; this.description=description; this.price=price; this.imageUrl=imageUrl;
    }
    public Long getId(){return id;} public void setId(Long id){this.id=id;}
    public String getName(){return name;} public void setName(String name){this.name=name;}
    public String getBrand(){return brand;} public void setBrand(String brand){this.brand=brand;}
    public String getCategory(){return category;} public void setCategory(String category){this.category=category;}
    public String getDescription(){return description;} public void setDescription(String description){this.description=description;}
    public double getPrice(){return price;} public void setPrice(double price){this.price=price;}
    public String getImageUrl(){return imageUrl;} public void setImageUrl(String imageUrl){this.imageUrl=imageUrl;}
}
