---
domain: salesforce
type: standard
topics: [apex, bulkification, soql, dml, testing, solid, security, governor-limits, error-handling]
summary: Comprehensive Apex development standards covering security, performance, SOLID principles, bulkification, and testing.
audience: [developer, architect]
---

# Apex Well-Architected Framework

Robust, scalable, maintainable Apex. Production-ready, performant, best-practice-aligned.

## Core Principles

### Security First
- Always `with sharing` or explicit sharing · validate all inputs · bind variables only (never string concat for SOQL) · respect FLS/OLS · never log sensitive info

### Performance & Scalability
- **Never DML/SOQL in loops** · always bulkify · test with realistic volumes
- Minimize SOQL — use relationship queries · be mindful of CPU time

| Limit | Sync | Async | Strategy |
|-------|------|-------|----------|
| SOQL | 100 | 200 | Relationship queries, maps, Selector pattern, cache |
| DML | 150 | 150 | Bulk lists, `Database` methods `allOrNone=false` |
| CPU | 10s | 60s | Move to async, optimize loops |
| Heap | 6MB | 12MB | Chunks, batch, clear large variables |

### Reliability & Error Handling
- Try-catch with Nebula Logger · savepoints/rollback · idempotent operations · partial failures: `Database.update(records, false)`

```apex
try {
    List<Database.SaveResult> results = Database.update(accounts, false);
    for (Integer i = 0; i < results.size(); i++) {
        if (!results[i].isSuccess())
            Logger.error('Failed', accounts[i].Id, results[i].getErrors()[0]);
    }
} catch (Exception e) {
    Logger.error('Unexpected error', accounts[0].Id, e);
    throw new AccountServiceException('Failed to process', e);
}
```

### Maintainability (SOLID)
- **SRP** — `AccountValidator` vs `AccountService` · **OCP** — abstract base + subclasses · **LSP** — subtypes substitutable · **ISP** — minimal interfaces · **DIP** — inject `IEmailService`, not concrete
- Proven patterns: Factory, Strategy, Facade · descriptive naming · logical separation

### Testability
- Business logic separate from DML · dependency injection · centralized `TestDataFactory` · mocking externals · meaningful coverage (not just 75%)

## Architecture Patterns

**Trigger → Handler → Service:** See [trigger-actions-framework-standards.md] for metadata-driven framework.

**Service Layer** — business logic: rule enforcement, cross-object coordination, validation, calculations.

**Selector Pattern** — centralizes SOQL per object:
```apex
public class AccountSelector {
    public static List<Account> selectByIds(Set<Id> accountIds) {
        return [SELECT Id, Name, Industry FROM Account WHERE Id IN :accountIds];
    }
}
```

**Domain Layer** — object-specific logic, validation, business events. Extends `fflib_SObjectDomain`.

## Bulkification

```apex
// BAD: DML in loop                     // GOOD: collect then bulk DML
for (Account acc : accounts) {          List<Contact> toInsert = new List<Contact>();
    insert new Contact(                 for (Account acc : accounts) {
        AccountId = acc.Id);                toInsert.add(new Contact(AccountId = acc.Id));
}                                       }
                                        if (!toInsert.isEmpty()) insert toInsert;
```

Relationship queries replace N queries: `SELECT Id, Account.Industry FROM Opportunity WHERE Id IN :oppIds`

## Testing

`@testSetup` → Arrange/Act/Assert → positive, negative, bulk (200+).

```apex
@isTest
private class AccountServiceTest {
    @testSetup static void setup() { TestDataFactory.createAccounts(10); }
    @isTest static void testProcess_Positive() {
        List<Account> accs = TestDataFactory.createAccounts(5);
        Test.startTest();
        AccountService.processNewAccounts(accs);
        Test.stopTest();
        System.assertEquals(5, [SELECT Id FROM Account WHERE Id IN :accs].size());
    }
    @isTest static void testProcess_Negative() { /* error scenarios */ }
    @isTest static void testProcess_Bulk() { /* 200+ records */ }
}
```

**Rules:** all code paths · bulk 200+ · governor limits · sharing contexts · exception handling · independent · meaningful assertions

## Code Organization

Naming conventions are defined in `metadata-naming-conventions.md`.

## Anti-Patterns

| Bad | Good |
|-----|------|
| Hard-coded IDs `'001...'` | `RecordType.DeveloperName == 'Customer'` |
| String SOQL concat | Bind variables `:val` |
| `accounts[0]` without check | `if (!accounts.isEmpty())` |
| DML/SOQL in loops | Collect then bulk |
| Silent error swallowing | `Logger.error()` + throw |
| Complex nested ternary | Clear if-else / switch |

→ Feature flags: [feature-flags-standards.md] · Logging: [nebula-logger-standards.md] · Async: [async-processing-standards.md] · Triggers: [trigger-actions-framework-standards.md]
