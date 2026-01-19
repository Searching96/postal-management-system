package org.f3.postalmanagement.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.f3.postalmanagement.entity.actor.Account;
import org.f3.postalmanagement.entity.actor.Customer;
import org.f3.postalmanagement.entity.actor.Employee;
import org.f3.postalmanagement.entity.administrative.Ward;
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

/**
 * Operational Data Seeder - Seeds Orders, Customers, Shippers, and Batches.
 * This runs AFTER the base DataInitializer that creates regions/offices.
 */
@Component
@org.springframework.core.annotation.Order(2) // Run after base DataInitializer
@RequiredArgsConstructor
@Slf4j
public class OperationalDataSeeder implements CommandLineRunner {

    // Repositories
    private final AccountRepository accountRepository;
    private final EmployeeRepository employeeRepository;
    private final CustomerRepository customerRepository;
    private final OfficeRepository officeRepository;
    private final OrderRepository orderRepository;
    private final OrderStatusHistoryRepository orderStatusHistoryRepository;
    private final BatchPackageRepository batchPackageRepository;
    private final WardRepository wardRepository;
    
    private final PasswordEncoder passwordEncoder;

    // Configuration constants
    private static final String DEFAULT_PASSWORD = "Password123!";
    private static final int SHIPPERS_PER_OFFICE = 3;
    private static final int CUSTOMERS_COUNT = 50;
    private static final int ORDERS_TO_CREATE = 300;  // Increased for better density

    private final Random random = new Random(42); // Deterministic seeding for reproducibility

    @Override
    @Transactional
    public void run(String... args) {
        log.info("=== Starting Operational Data Seeding ===");
        
        long currentOrderCount = orderRepository.count();
        // Check if sufficiently seeded. If only a few orders exist (partial/failed run), we continue.
        if (currentOrderCount >= ORDERS_TO_CREATE * 0.8) {
            log.info("Operational data already sufficiently seeded ({} orders). Skipping...", currentOrderCount);
            return;
        }

        try {
            // Load existing infrastructure
            List<Office> postOffices = officeRepository.findAllByOfficeType(OfficeType.PROVINCE_POST);
            List<Office> hubs = officeRepository.findAllByOfficeType(OfficeType.HUB);
            
            if (postOffices.isEmpty() || hubs.isEmpty()) {
                log.warn("No post offices or hubs found. Please run base DataInitializer first.");
                return;
            }

            // Step 1: Create Shippers
            initShippers(postOffices);
            
            // Step 2: Create Customers
            List<Customer> customers = initCustomers();
            
            // Step 3: Create Orders
            List<Order> orders = initOrders(customers, postOffices);
            
            // Step 4: Create Tracking History
            initOrderHistory(orders, hubs);
            
            // Step 5: Create Batches
            initBatches(orders, hubs);
            
            log.info("=== Operational Data Seeding Complete ===");
            
        } catch (Exception e) {
            log.error("Error during operational data seeding", e);
            throw new RuntimeException("Failed to seed operational data", e);
        }
    }

    // ==================== STEP 1: CREATE SHIPPERS ====================
    
    private void initShippers(List<Office> postOffices) {
        log.info("Creating shippers for {} post offices...", postOffices.size());
        
        int officeIndex = 0;
        for (Office office : postOffices) {
            officeIndex++;
            for (int i = 1; i <= SHIPPERS_PER_OFFICE; i++) {
                String provinceCode = office.getProvince().getCode().toLowerCase();
                String phone = "094" + String.format("%02d", officeIndex) + String.format("%05d", i);
                String email = "shipper." + provinceCode + "." + String.format("%02d", i) + "@f3postal.com";

                // Check if shipper already exists by phone (which is the username)
                if (accountRepository.findByUsername(phone).isPresent()) {
                    continue;
                }

                // Create Account
                Account account = new Account();
                account.setUsername(phone);
                account.setPassword(passwordEncoder.encode("123456"));
                account.setRole(Role.SHIPPER);
                account.setEmail(email);
                account.setActive(true);
                account = accountRepository.save(account);
                
                // Create Employee
                Employee shipper = new Employee();
                shipper.setAccount(account);
                shipper.setFullName("Shipper " + office.getOfficeName() + " #" + i);
                shipper.setPhoneNumber(phone);
                shipper.setOffice(office);
                
                employeeRepository.save(shipper);
            }
        }
        log.info("Shippers created.");
    }

    // ==================== STEP 2: CREATE CUSTOMERS ====================
    
    private List<Customer> initCustomers() {
        if (customerRepository.count() >= CUSTOMERS_COUNT) {
            return customerRepository.findAll();
        }
        log.info("Creating {} customers...", CUSTOMERS_COUNT);
        List<Customer> customers = new ArrayList<>();

        String[] firstNames = {"Nguyen Van", "Tran Thi", "Le Van", "Pham Thi", "Hoang Van",
                               "Vu Thi", "Dang Van", "Bui Thi", "Do Van", "Ngo Thi"};
        String[] lastNames = {"An", "Binh", "Cuong", "Dung", "Hoa", "Khanh", "Linh",
                             "Minh", "Nam", "Phong", "Quang", "Tam", "Tuan", "Vinh"};
        
        for (int i = 0; i < CUSTOMERS_COUNT; i++) {
            String firstName = firstNames[random.nextInt(firstNames.length)];
            String lastName = lastNames[random.nextInt(lastNames.length)];
            String email = "customer" + (i + 1) + "@example.com";
            
            // Create Account for customer (optional but good for login)
            Account account = new Account();
            String phone = "095" + String.format("%07d", i + 1);
            account.setUsername(phone);
            account.setPassword(passwordEncoder.encode("123456"));
            account.setRole(Role.CUSTOMER);
            account.setEmail(email);
            account.setActive(true);
            account = accountRepository.save(account);
            
            // Create Customer
            Customer customer = new Customer();
            customer.setAccount(account);
            customer.setFullName(firstName + " " + lastName);
            customer.setPhoneNumber(phone);
            customer.setAddressLine1(generateAddress(i));
            customer.setSubscriptionPlan(SubscriptionPlan.BASIC);
            
            customers.add(customerRepository.save(customer));
        }
        
        log.info("Created {} customers", customers.size());
        return customers;
    }
    
    private String generateAddress(int index) {
        String[] streets = {"Nguyen Trai", "Le Loi", "Tran Hung Dao", "Hai Ba Trung", 
                           "Vo Van Kiet", "Nguyen Hue", "Phan Chu Trinh"};
        String street = streets[index % streets.length];
        int number = 10 + (index * 7) % 990;
        return number + " " + street;
    }

    // ==================== STEP 3: CREATE ORDERS ====================
    
    private List<Order> initOrders(List<Customer> customers, List<Office> postOffices) {
        log.info("Creating {} orders...", ORDERS_TO_CREATE);
        List<Order> orders = new ArrayList<>();

        // We need a default employee to be the "creator"
        Employee defaultCreator = employeeRepository.findAll().stream().findFirst().orElse(null);
        if (defaultCreator == null) {
            log.warn("No employees found to set as creator. Skipping orders.");
            return orders;
        }

        // Cache existing order count for tracking number generation
        long existingOrderCount = orderRepository.count();

        int created = 0;
        int attempts = 0;
        int maxAttempts = ORDERS_TO_CREATE * 2; // Prevent infinite loop

        while (created < ORDERS_TO_CREATE && attempts < maxAttempts) {
            attempts++;
            int senderIdx = random.nextInt(customers.size());
            int receiverIdx = random.nextInt(customers.size());

            // Ensure distinct sender/receiver
            if (senderIdx == receiverIdx) {
                continue;
            }

            Customer sender = customers.get(senderIdx);
            Customer receiver = customers.get(receiverIdx);
            
            Office originOffice = postOffices.get(random.nextInt(postOffices.size()));
            Office destOffice = postOffices.get(random.nextInt(postOffices.size()));

            // Determine status - skew towards OUT_FOR_DELIVERY for updated user requirements
            OrderStatus status = determineOrderStatus(created);
            
            // Dates
            LocalDateTime createdAt = LocalDateTime.now()
                    .minusDays(random.nextInt(30))
                    .minusHours(random.nextInt(24));
            
            Order order = new Order();
            order.setTrackingNumber(generateTrackingNumber(existingOrderCount, created));
            order.setSenderCustomer(sender);
            order.setSenderName(sender.getFullName());
            order.setSenderPhone(sender.getPhoneNumber());
            order.setSenderAddressLine1(sender.getAddressLine1());
            
            order.setReceiverName(receiver.getFullName());
            order.setReceiverPhone(receiver.getPhoneNumber());
            order.setReceiverAddressLine1(receiver.getAddressLine1());
            order.setOriginOffice(originOffice);
            order.setDestinationOffice(destOffice);
            order.setCreatedByEmployee(defaultCreator);

            // Assign a Sender Ward within the origin province
            List<Ward> senderWards = wardRepository.findByProvince_Code(originOffice.getProvince().getCode());
            if (!senderWards.isEmpty()) {
                Ward senderWard = senderWards.get(random.nextInt(senderWards.size()));
                order.setSenderWard(senderWard);
            }

            // Assign a Destination Ward within the destination province
            List<Ward> provinceWards = wardRepository.findByProvince_Code(destOffice.getProvince().getCode());
            if (!provinceWards.isEmpty()) {
                Ward randomWard = provinceWards.get(random.nextInt(provinceWards.size()));
                order.setReceiverWard(randomWard);
                // Keep only street address - ward and province are derivable from wardCode
                String streetAddr = receiver.getAddressLine1().split(",")[0];
                if (streetAddr.contains("Phường") || streetAddr.contains("Xã")) {
                    streetAddr = generateAddress(created);
                }
                order.setReceiverAddressLine1(streetAddr);
            } else {
                // Fallback: use only the street portion without province name
                String streetAddr = receiver.getAddressLine1().split(",")[0];
                if (streetAddr.isBlank()) {
                    streetAddr = generateAddress(created);
                }
                order.setReceiverAddressLine1(streetAddr);
            }
            
            // Set current location based on status
            Office currentLoc = determineCurrentLocation(status, originOffice, destOffice);
            order.setCurrentOffice(currentLoc);

            order.setStatus(status);
            
            // Assign Shipper if OUT_FOR_DELIVERY
            if (status == OrderStatus.OUT_FOR_DELIVERY) {
                // Find a shipper at destination office
                List<Employee> shippers = employeeRepository.findByOfficeIdAndRoleWithSearch(
                        destOffice.getId(), Role.SHIPPER, "", org.springframework.data.domain.Pageable.unpaged()
                ).getContent();
                
                if (!shippers.isEmpty()) {
                    // REQUIRED: Deterministic assignment for testing.
                    // Assign to the FIRST shipper (shipper.XX.01) 50% of the time so user knows who to login as.
                    // Assign to others randomly.
                    if (random.nextDouble() < 0.5) {
                         // Find shipper with username ending in "01" (assumed from phone/email convention or just take index 0)
                         order.setAssignedShipper(shippers.get(0));
                    } else {
                        order.setAssignedShipper(shippers.get(random.nextInt(shippers.size())));
                    }
                }
            }
            
            // Package Details
            order.setPackageType(PackageType.BOX);
            order.setWeightKg(BigDecimal.valueOf(0.5 + random.nextDouble() * 5));
            order.setChargeableWeightKg(order.getWeightKg()); 
            order.setServiceType(random.nextBoolean() ? ServiceType.STANDARD : ServiceType.EXPRESS);
            
            // Pricing
            order.setShippingFee(BigDecimal.valueOf(20000 + random.nextInt(50000)));
            order.setTotalAmount(order.getShippingFee().add(BigDecimal.valueOf(1000))); 
            
            orders.add(orderRepository.save(order));
            created++;
        }

        log.info("Created {} orders", orders.size());
        return orders;
    }

    private String generateTrackingNumber(long existingCount, int index) {
        String year = String.valueOf(LocalDateTime.now().getYear()).substring(2);
        // Use existing order count as offset to ensure uniqueness across runs
        return "VN" + year + String.format("%09d", existingCount + index + 1);
    }
    
    private OrderStatus determineOrderStatus(int index) {
        double ratio = (double) index / ORDERS_TO_CREATE;
        if (ratio < 0.1) return OrderStatus.CREATED;
        if (ratio < 0.2) return OrderStatus.AT_ORIGIN_OFFICE;
        if (ratio < 0.4) return OrderStatus.IN_TRANSIT_TO_HUB;
        if (ratio < 0.5) return OrderStatus.AT_DESTINATION_OFFICE;
        // 40% OUT_FOR_DELIVERY for high visibility
        if (ratio < 0.9) return OrderStatus.OUT_FOR_DELIVERY;
        return OrderStatus.DELIVERED;
    }
    
    private Office determineCurrentLocation(OrderStatus status, Office origin, Office dest) {
        switch (status) {
            case CREATED:
            case AT_ORIGIN_OFFICE:
                return origin;
            case DELIVERED:
            case DELIVERY_FAILED:
            case OUT_FOR_DELIVERY:
            case AT_DESTINATION_OFFICE:
                return dest;
            default:
                return origin.getParent() != null ? origin.getParent() : origin;
        }
    }

    // ==================== STEP 4: CREATE ORDER HISTORY ====================
    
    private void initOrderHistory(List<Order> orders, List<Office> hubs) {
        log.info("Creating order history...");
        
        for (Order order : orders) {
            LocalDateTime timestamp = LocalDateTime.now().minusDays(1);
            
            // 1. Created
            createHistory(order, OrderStatus.CREATED, order.getOriginOffice(), timestamp, "Order created");
            
            // 2. Accepted
            if (order.getStatus().ordinal() >= OrderStatus.AT_ORIGIN_OFFICE.ordinal()) {
                timestamp = timestamp.plusHours(2);
                createHistory(order, OrderStatus.AT_ORIGIN_OFFICE, order.getOriginOffice(), timestamp, "Package accepted at post office");
            }
            
            // 3. In Transit
            if (order.getStatus().ordinal() >= OrderStatus.IN_TRANSIT_TO_HUB.ordinal()) {
                timestamp = timestamp.plusHours(5);
                Office hub = order.getOriginOffice().getParent();
                if (hub == null && !hubs.isEmpty()) hub = hubs.get(0);
                createHistory(order, OrderStatus.IN_TRANSIT_TO_HUB, hub, timestamp, "Arrived at Hub");
            }
            
            // 4. Dest Post
            if (order.getStatus().ordinal() >= OrderStatus.AT_DESTINATION_OFFICE.ordinal()) {
                timestamp = timestamp.plusHours(10);
                createHistory(order, OrderStatus.AT_DESTINATION_OFFICE, order.getDestinationOffice(), timestamp, "Arrived at destination post office");
            }
            
            // 5. Delivery
            if (order.getStatus() == OrderStatus.DELIVERED) {
                timestamp = timestamp.plusHours(4);
                createHistory(order, OrderStatus.DELIVERED, order.getDestinationOffice(), timestamp, "Delivered successfully");
            }
        }
    }
    
    private void createHistory(Order order, OrderStatus status, Office office, LocalDateTime timestamp, String description) {
        OrderStatusHistory history = new OrderStatusHistory();
        history.setOrder(order);
        history.setStatus(status);
        history.setOffice(office);
        history.setDescription(description);
        orderStatusHistoryRepository.save(history);
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
