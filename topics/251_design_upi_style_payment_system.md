# Design UPI Style Payment System

> **Category:** E-Commerce and Payments

---

A Unified Payments Interface (UPI) system enables instant, real-time peer-to-peer (P2P) and peer-to-merchant (P2M) bank transfers directly between bank accounts using virtual payment addresses (VPA / UPI ID) without exposing bank account numbers.

### System Requirements
- **Functional Requirements**:
  - Resolve Virtual Payment Addresses (VPA) to bank account details instantly.
  - Execute 2-Factor authentication (Device binding + MPIN) for fund transfers.
  - Coordinate real-time Inter-Bank Settlement via NPCI Central Switch.
- **Non-Functional Requirements**:
  - High Availability: 99.999% uptime with sub-2 second end-to-end processing.
  - Scalability: Support 500,000+ transactions per second during peak hours.
  - Zero Double-Spend: Strict transaction isolation across remitter and beneficiary banks.

### System Architecture
```
[ Payer Mobile App ] ---> [ Payer PSP Service ] ---> [ NPCI Central Switch ]
                                                           |
                      +------------------------------------+------------------------------------+
                      |                                                                         |
                      v                                                                         v
           [ Remitter Bank (Debit) ]                                                [ Beneficiary Bank (Credit) ]
           (Auth & Account Balance)                                                 (Account Credit Engine)
```

### Transaction Flow & Settlement Machine
| Step | Phase | Action | Failure / Retry Handling |
|---|---|---|---|
| **1** | VPA Lookup | Resolve `user@upi` to Bank IFSC & Account Hash | Return 404 if VPA inactive. |
| **2** | Debit Auth | Remitter Bank authenticates MPIN & debits account | Reverse transaction if MPIN invalid or insufficient balance. |
| **3** | Central Routing | NPCI switch forwards credit advice to Beneficiary Bank | Queue in NPCI switch for async retry if Beneficiary PSP down. |
| **4** | Credit Posting | Beneficiary Bank credits account & returns confirmation | If credit fails after debit, trigger auto-reversal within SLA. |

### Key API Specifications
| Endpoint | Method | Description | Key Parameters |
|---|---|---|---|
| `/v1/upi/vpa/resolve` | POST | Resolve VPA to masked beneficiary name | `vpa_id` |
| `/v1/upi/pay` | POST | Initiate UPI debit-credit transfer | `payer_vpa`, `payee_vpa`, `amount`, `encrypted_mpin`, `txn_ref` |

### Key takeaway
UPI-style payment architectures connect mobile PSP apps to a central switch (NPCI) and core banking solutions, using 2-Factor device/MPIN authentication and asynchronous auto-reversals for instant inter-bank settlement.
