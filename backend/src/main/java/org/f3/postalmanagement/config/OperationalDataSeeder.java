package org.f3.postalmanagement.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.f3.postalmanagement.entity.actor.Account;
import org.f3.postalmanagement.entity.actor.Customer;
import org.f3.postalmanagement.entity.actor.Employee;
import org.f3.postalmanagement.entity.order.BatchPackage;
import org.f3.postalmanagement.entity.order.Order;
import org.f3.postalmanagement.entity.order.OrderStatusHistory;
import org.f3.postalmanagement.entity.unit.Office;
import org.f3.postalmanagement.enums.*;
import org.f3.postalmanagement.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Component
@org.springframework.core.annotation.Order(2)
@RequiredArgsConstructor
@Slf4j
public class OperationalDataSeeder implements CommandLineRunner {

    private final AccountRepository accountRepository;
    private final EmployeeRepository employeeRepository;
    private final CustomerRepository customerRepository;
    private final OfficeRepository officeRepository;
    private final OrderRepository orderRepository;
    private final OrderStatusHistoryRepository orderStatusHistoryRepository;
    private final BatchPackageRepository batchPackageRepository;
    private final PasswordEncoder passwordEncoder;

    private static final int SHIPPERS_PER_OFFICE = 3;
    private static final int CUSTOMERS_COUNT = 50;
    private static final int ORDERS_TO_CREATE = 300;

    private final Random random = new Random(42);

    @Override
    @Transactional
    public void run(String... args) {
        log.info("=== Starting Operational Data Seeding ===");
        
        long currentOrderCount = orderRepository.count();
        if (currentOrderCount >= ORDERS_TO_CREATE * 0.8) {
            log.info("Operational data already seeded. Skipping...");
            return;
        }

        try {
            List<Office> postOffices = officeRepository.findAllByOfficeType(OfficeType.PROVINCE_POST);
            List<Office> hubs = officeRepository.findAllByOfficeType(OfficeType.HUB);
            
            if (postOffices.isEmpty() || hubs.isEmpty()) return;

            initShippers(postOffices);
            List<Customer> customers = initCustomers();
            List<Order> orders = initOrders(customers, postOffices);
            initOrderHistory(orders, hubs);
            initBatches(orders, hubs);
            
            log.info("=== Operational Data Seeding Complete ===");
        } catch (Exception e) {
            log.error("Error during operational data seeding", e);
        }
    }

    private void initShippers(List<Office> postOffices) {
        log.info("Creating shippers...");
        int officeIndex = 0;
        for (Office office : postOffices) {
            officeIndex++;
            for (int i = 1; i <= SHIPPERS_PER_OFFICE; i++) {
                String provinceCode = (office.getWard() != null && office.getWard().getProvince() != null) 
                        ? office.getWard().getProvince().getCode().toLowerCase() : "xx";
                String phone = "094" + String.format("%02d", officeIndex) + String.format("%05d", i);
                
                if (accountRepository.findByUsername(phone).isPresent()) continue;

                Account account = new Account();
                account.setUsername(phone);
                account.setPassword(passwordEncoder.encode("123456"));
                account.setRole(Role.SHIPPER);
                account.setEmail("ship." + provinceCode + i + "@f3.com");
                account.setActive(true);
                account = accountRepository.save(account);
                
                Employee shipper = new Employee();
                shipper.setAccount(account);
                shipper.setFullName("Shipper " + office.getOfficeName());
                shipper.setPhoneNumber(phone);
                shipper.setOffice(office);
                employeeRepository.save(shipper);
            }
        }
    }

    private List<Customer> initCustomers() {
        if (customerRepository.count() >= CUSTOMERS_COUNT) return customerRepository.findAll();
        List<Customer> customers = new ArrayList<>();
        for (int i = 0; i < CUSTOMERS_COUNT; i++) {
            String phone = "095" + String.format("%07d", i + 1);
            if (accountRepository.existsByUsername(phone)) continue;

            Account account = new Account();
            account.setUsername(phone);
            account.setPassword(passwordEncoder.encode("123456"));
            account.setRole(Role.CUSTOMER);
            account.setEmail("cust" + (i + 1) + "@example.com");
            account.setActive(true);
            account = accountRepository.save(account);
            
            Customer customer = new Customer();
            customer.setAccount(account);
            customer.setFullName("Customer " + (i+1));
            customer.setPhoneNumber(phone);
            customer.setAddressLine1("123 Street " + i);
            customers.add(customerRepository.save(customer));
        }
        return customers;
    }

    private List<Order> initOrders(List<Customer> customers, List<Office> postOffices) {
        log.info("Creating orders...");
        List<Order> orders = new ArrayList<>();
        Employee defaultCreator = employeeRepository.findAll().stream().findFirst().orElse(null);
        long existingCount = orderRepository.count();

        for (int i = 0; i < ORDERS_TO_CREATE; i++) {
            Customer sender = customers.get(random.nextInt(customers.size()));
            Customer receiver = customers.get(random.nextInt(customers.size()));
            if (sender.getId().equals(receiver.getId())) continue;

            Office origin = postOffices.get(random.nextInt(postOffices.size()));
            Office dest = postOffices.get(random.nextInt(postOffices.size()));

            Order order = new Order();
            // Generating 13 char tracking number: VN + 11 digits
            order.setTrackingNumber("VN" + String.format("%011d", existingCount + i + 1));
            
            order.setSenderCustomer(sender);
            order.setSenderName(sender.getFullName());
            order.setSenderPhone(sender.getPhoneNumber());
            order.setSenderAddressLine1(sender.getAddressLine1());
            if(sender.getWard() != null) order.setSenderWard(sender.getWard());
            
            order.setReceiverCustomer(receiver);
            order.setReceiverName(receiver.getFullName());
            order.setReceiverPhone(receiver.getPhoneNumber());
            order.setReceiverAddressLine1(receiver.getAddressLine1());
            if(receiver.getWard() != null) order.setReceiverWard(receiver.getWard());
            
            order.setOriginOffice(origin);
            order.setDestinationOffice(dest);
            order.setCreatedByEmployee(defaultCreator);
            
            // MANDATORY FIELDS SETTING
            order.setPackageType(PackageType.BOX);
            order.setServiceType(ServiceType.STANDARD); 
            BigDecimal weight = BigDecimal.valueOf(1.0);
            order.setWeightKg(weight);
            order.setChargeableWeightKg(weight);
            
            order.setShippingFee(BigDecimal.valueOf(20000));
            order.setInsuranceFee(BigDecimal.ZERO);
            order.setCodAmount(BigDecimal.ZERO);
            order.setTotalAmount(BigDecimal.valueOf(20000));
            
            order.setStatus(OrderStatus.values()[random.nextInt(4)]); 
            order.setCurrentOffice(origin);
            
            orders.add(orderRepository.save(order));
        }
        return orders;
    }

    private void initOrderHistory(List<Order> orders, List<Office> hubs) {
        for (Order order : orders) {
            OrderStatusHistory history = new OrderStatusHistory();
            history.setOrder(order);
            history.setStatus(OrderStatus.CREATED);
            history.setOffice(order.getOriginOffice());
            history.setCreatedAt(LocalDateTime.now().minusDays(1));
            orderStatusHistoryRepository.save(history);
        }
    }

    // ==================== STEP 5: CREATE BATCHES ====================
    
    private void initBatches(List<Order> orders, List<Office> hubs) {
        log.info("Creating batches...");
        
        List<Order> transitOrders = orders.stream()
                .filter(o -> o.getStatus() == OrderStatus.IN_TRANSIT_TO_HUB)
                .collect(Collectors.toList());
        
        if (transitOrders.isEmpty()) return;
        
        int batchCount = 0;
        int batchSize = 5;
        
        for (int i = 0; i < transitOrders.size(); i += batchSize) {
            List<Order> batchOrders = transitOrders.subList(i, Math.min(i + batchSize, transitOrders.size()));
            if (batchOrders.isEmpty()) continue;
            
            Order first = batchOrders.get(0);
            Office origin = first.getOriginOffice();
            Office destHub = first.getOriginOffice().getParent();
            
            if (destHub == null) continue;
            
            BatchPackage batch = new BatchPackage();
            batch.setBatchCode("BATCH-" + System.currentTimeMillis() + "-" + batchCount++);
            batch.setOriginOffice(origin);
            batch.setDestinationOffice(destHub);
            batch.setStatus(BatchStatus.IN_TRANSIT);
            
            batch.setMaxWeightKg(new BigDecimal("500.00"));
            batch.setCurrentWeightKg(BigDecimal.ZERO); 
            batch.setCurrentOrderCount(batchOrders.size());
            
            batch = batchPackageRepository.save(batch);
            
            for (Order o : batchOrders) {
                o.setBatchPackage(batch);
                orderRepository.save(o);
            }
        }
        log.info("Created {} batches.", batchCount);
    }
}
