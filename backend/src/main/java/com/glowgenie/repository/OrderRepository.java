package com.glowgenie.repository;
import com.glowgenie.model.ShopOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface OrderRepository extends JpaRepository<ShopOrder,Long> {
    List<ShopOrder> findByCustomerEmailOrderByCreatedAtDesc(String email);
}
