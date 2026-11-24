package com.glowgenie.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name="shop_orders")
public class ShopOrder {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String customerEmail;
    @Column(length=4000) private String items;
    private String address;
    private String paymentMethod;
    private double total;
    private String status = "Placed";
    private LocalDateTime createdAt = LocalDateTime.now();
    public ShopOrder() {}
    public Long getId(){return id;} public void setId(Long id){this.id=id;}
    public String getCustomerEmail(){return customerEmail;} public void setCustomerEmail(String v){customerEmail=v;}
    public String getItems(){return items;} public void setItems(String v){items=v;}
    public String getAddress(){return address;} public void setAddress(String v){address=v;}
    public String getPaymentMethod(){return paymentMethod;} public void setPaymentMethod(String v){paymentMethod=v;}
    public double getTotal(){return total;} public void setTotal(double v){total=v;}
    public String getStatus(){return status;} public void setStatus(String v){status=v;}
    public LocalDateTime getCreatedAt(){return createdAt;} public void setCreatedAt(LocalDateTime v){createdAt=v;}
}
