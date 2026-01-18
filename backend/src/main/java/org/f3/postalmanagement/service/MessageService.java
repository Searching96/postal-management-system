package org.f3.postalmanagement.service;

import lombok.RequiredArgsConstructor;
import org.f3.postalmanagement.dto.messaging.ContactResponse;
import org.f3.postalmanagement.dto.messaging.MessageResponse;
import org.f3.postalmanagement.dto.messaging.SendMessageRequest;
import org.f3.postalmanagement.entity.actor.Account;
import org.f3.postalmanagement.entity.actor.Employee;
import org.f3.postalmanagement.entity.messaging.Message;
import org.f3.postalmanagement.repository.AccountRepository;
import org.f3.postalmanagement.repository.EmployeeRepository;
import org.f3.postalmanagement.repository.MessageRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final AccountRepository accountRepository;
    private final EmployeeRepository employeeRepository;

    @Transactional
    public MessageResponse sendMessage(SendMessageRequest request) {
        Account sender = getCurrentAccount();
        Account receiver;

        if (request.getReceiverId() != null) {
            receiver = accountRepository.findById(request.getReceiverId())
                    .orElseThrow(() -> new IllegalArgumentException("Receiver not found"));
        } else if (request.getReceiverPhone() != null) {
            // Find employee by phone, then get account
            Employee employee = employeeRepository.findByOfficeIdWithSearch(null, request.getReceiverPhone(), Pageable.ofSize(1))
                    .stream().findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("Employee with this phone not found"));
            // Actually findByOfficeIdWithSearch might not be right query for global phone search.
            // Let's use a simpler way if possible, or assume format from EmployeeRepository exists.
            // But EmployeeRepository has findByAccount.
            // We need findByPhoneNumber in EmployeeRepository. It's unique in Employee entity.
            // Let's assume we can add it or find it.
            // Actually, we should check EmployeeRepository capabilities.
            // The previous list showed findByOfficeIdWithSearch etc.
            // We need to add findByPhoneNumber to EmployeeRepository?
            // Wait, I saw "findSearch" methods but not simple FindByPhoneNumber.
            // I'll assume I can add it or just search all if permitted.
            // For now, let's assume we add findByPhoneNumber to EmployeeRepository or use a custom query.
            // Or better, search in Account if username is phone?
            // "For customer, this field [username] is phone number". For Employee, username might be something else?
            // Typically Employee username is also phone or email.
            // Let's try finding Account by username (phone) first.
            receiver = accountRepository.findByUsername(request.getReceiverPhone())
                    .orElseGet(() -> {
                         // Fallback: try finding employee by phone explicitly
                         // We need to fetch all employees or add a method.
                         // Let's rely on account.username for now if consistent.
                         // If not, we will need to update EmployeeRepository.
                         throw new IllegalArgumentException("User with this phone not found");
                    });
        } else {
            throw new IllegalArgumentException("Receiver ID or Phone required");
        }

        if (sender.getId().equals(receiver.getId())) {
            throw new IllegalArgumentException("Cannot send message to yourself");
        }

        Message message = Message.builder()
                .sender(sender)
                .receiver(receiver)
                .content(request.getContent())
                .sentAt(Instant.now())
                .isRead(false)
                .build();

        message = messageRepository.save(message);

        return mapToResponse(message, sender.getId());
    }

    @Transactional(readOnly = true)
    public Page<MessageResponse> getConversation(UUID userId, Pageable pageable) {
        Account currentUser = getCurrentAccount();
        Account otherUser = accountRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return messageRepository.findConversation(currentUser, otherUser, pageable)
                .map(msg -> mapToResponse(msg, currentUser.getId()));
    }

    @Transactional(readOnly = true)
    public List<ContactResponse> getRecentContacts(Pageable pageable) {
        Account currentUser = getCurrentAccount();
        // Fetch more messages than contacts needed to ensure we find distinct users
        // e.g. if we want 10 contacts, fetch last 50 messages to be safe
        List<Message> recentMessages = messageRepository.findRecentMessagesByUser(currentUser, PageRequest.of(0, 50));

        return recentMessages.stream()
                .map(msg -> msg.getSender().getId().equals(currentUser.getId()) ? msg.getReceiver() : msg.getSender())
                .distinct()
                .limit(pageable.getPageSize())
                .map(contact -> {
                    long unread = messageRepository.countUnreadMessages(currentUser, contact);
                    // Optimized: we already have the messages, but finding exact last one per user in list is easier via query for correctness
                    // or just filter from the list we fetched if we trust it covers it. 
                    // To be strictly correct and simple, let's query the specific conversation's last msg.
                    Page<Message> lastMsgPage = messageRepository.findConversation(currentUser, contact, Pageable.ofSize(1));
                    Message lastMsg = lastMsgPage.hasContent() ? lastMsgPage.getContent().get(0) : null;
                    
                    String name = getDisplayName(contact);

                    return ContactResponse.builder()
                            .id(contact.getId())
                            .name(name)
                            .phoneNumber(getPhoneNumber(contact))
                            .role(contact.getRole().name())
                            .unreadCount(unread)
                            .lastMessage(lastMsg != null ? lastMsg.getContent() : "")
                            .sentAt(lastMsg != null ? lastMsg.getSentAt().toString() : "")
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ContactResponse> searchUsers(String query) {
        Account currentUser = getCurrentAccount();
        
        List<Employee> employees = employeeRepository.findByPhoneNumberContaining(
                query, 
                Pageable.ofSize(20)
        ).getContent();
        
        return mapEmployeesToContacts(employees, currentUser.getId());
    }

    @Transactional(readOnly = true)
    public List<ContactResponse> getUnitEmployees() {
        Account currentUser = getCurrentAccount();
        Optional<Employee> currentEmp = employeeRepository.findByAccount(currentUser);
        
        if (!currentEmp.isPresent() || currentEmp.get().getOffice() == null) {
            return new ArrayList<>();
        }
        
        UUID officeId = currentEmp.get().getOffice().getId();
        List<Employee> colleagues = employeeRepository.findByOfficeIdWithSearch(
                officeId, 
                null, 
                Pageable.ofSize(50)
        ).getContent();
        
        return mapEmployeesToContacts(colleagues, currentUser.getId());
    }

    private List<ContactResponse> mapEmployeesToContacts(List<Employee> employees, UUID currentUserId) {
        return employees.stream()
                .filter(emp -> !emp.getAccount().getId().equals(currentUserId))
                .map(emp -> ContactResponse.builder()
                        .id(emp.getAccount().getId())
                        .name(emp.getFullName())
                        .phoneNumber(emp.getPhoneNumber())
                        .role(emp.getAccount().getRole().name())
                        .unreadCount(0)
                        .unitName(emp.getOffice() != null ? emp.getOffice().getOfficeName() : "")
                        .build())
                .collect(Collectors.toList());
    }
    
    @Transactional
    public void markAsRead(UUID senderId) {
        Account currentUser = getCurrentAccount();
        Account sender = accountRepository.findById(senderId)
                .orElseThrow(() -> new IllegalArgumentException("Sender not found"));

        messageRepository.markAsRead(sender, currentUser);
    }

    private Account getCurrentAccount() {
        String principal = SecurityContextHolder.getContext().getAuthentication().getName();
        return accountRepository.findByUsername(principal)
                .orElseGet(() -> accountRepository.findByEmail(principal)
                        .orElseThrow(() -> new IllegalStateException("Current user not found")));
    }
    
    private String getDisplayName(Account account) {
        Optional<Employee> emp = employeeRepository.findByAccount(account);
        return emp.map(Employee::getFullName).orElse(account.getUsername());
    }
    
    private String getPhoneNumber(Account account) {
        Optional<Employee> emp = employeeRepository.findByAccount(account);
        return emp.map(Employee::getPhoneNumber).orElse("");
    }

    private MessageResponse mapToResponse(Message msg, UUID currentUserId) {
        return MessageResponse.builder()
                .id(msg.getId())
                .senderId(msg.getSender().getId())
                .senderName(getDisplayName(msg.getSender()))
                .receiverId(msg.getReceiver().getId())
                .receiverName(getDisplayName(msg.getReceiver()))
                .content(msg.getContent())
                .sentAt(msg.getSentAt())
                .read(msg.isRead())
                .me(msg.getSender().getId().equals(currentUserId))
                .build();
    }
}
