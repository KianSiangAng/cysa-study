# CySA+ (CS0-004) Study Notebook

## How to use this

After each video, drop me a quick message — the title/topic and whatever stuck with you, even messy. I'll:

1. Ask a couple of quick questions to check it actually landed
2. Add a clean entry to the **Video Log** below
3. Fold the key facts into the right **Domain Notes** section, and add new terms to the **Glossary**

You don't have to write anything yourself — just talk, and the notebook builds itself. Since you're already 15 videos in, tell me (even roughly) what those covered and we'll backfill them together.

Every entry is tagged with its **CS0-004 objective ID** (e.g. 1.1, 2.4) from CompTIA's official exam objectives. The study site uses these tags to generate questions and track weak areas.

## Video Log

| # | Topic | Objective |
| --- | --- | --- |
| 1 | Welcome and Course Overview | — |
| 2 | The Cybersecurity Analyst Role | — |
| 3 | CySA+ CS0-004 Exam Structure and Domains | — |
| 4 | Your Course Roadmap: How to Maximize Your Results | — |
| 5 | Download your free study guide | — |
| 6 | Introduction to Security Operations Centers (SOC) | 1.5 |
| 7 | SOC Roles and Responsibilities | 1.5 |
| 8 | Security Operations Workflows and Processes | 1.5 |
| 9 | Continuous Monitoring Concepts | 1.5 |
| 10 | Shift Operations and Handover Procedures | 4.2 |
| — | Quiz 1: Checkpoint — Foundational Security Operations | 1.5 |
| 11 | Understanding Risk in Cybersecurity | 2.4 |
| 12 | Risk Concepts: Appetite, Residual, and Inherent Risk | 2.4 |
| 13 | Risk Management Strategies (Accept, Transfer, Avoid, Mitigate) | 2.4 |
| 14 | Security Control Types | 2.4 |
| 15 | Security Control Functions | 2.4 |
| 16 | Policies, Governance, and Service-Level Objectives (SLOs) | 2.4 |
| 17 | Aligning Controls with Business Risk | 2.4 |
| 18 | Infrastructure and System Architecture Overview | 1.1 |
| 19 | Cloud Native Architecture | 1.1 |
| 20 | Virtualization Technologies and Security | 1.1 |
| 21 | Containerization Concepts (Docker, Kubernetes) | 1.1 |
| 22 | Application Programming Interfaces (API) Concepts | 1.1 |
| 23 | Demo: Detecting API Enumeration Through Log Analysis (Ubuntu + Kali lab) | 1.2 |
| 24 | Device Management Concepts | 1.1 |

## Domain Notes

### Domain 1.0: Security Operations (34%)

**SOC basics (vids 6–9 · obj 1.5)**

- A SOC's job: centralize detection, triage, and response so threats get caught and handled before they cause damage.
- Typical tiering: Tier 1 (triage/alert monitoring) → Tier 2 (deeper investigation) → Tier 3 (threat hunting, advanced analysis) → SOC Manager (oversight, metrics, escalation ownership).
- Core workflow: alert generated → triage (real or noise?) → investigation → escalation if needed → containment/remediation → documentation/closure.
- **Continuous monitoring**: ongoing collection and analysis of security data (logs, network traffic, endpoint activity) so issues are caught in near-real-time rather than during periodic audits — feeds SIEM/alerting pipelines.

**Infrastructure and System Architecture Overview (vid 18 · obj 1.1)**

- **On-premises**: full control and full visibility, but also full responsibility for security.
- **Cloud**: shifts physical infrastructure responsibility to the provider — but workloads, data, and IAM remain the customer's responsibility under the **shared responsibility model**.
- **Hybrid** is the real-world norm — analysts must monitor and correlate events across both on-prem and cloud environments simultaneously.
- **SDN (Software-Defined Networking)** separates the control plane from the data plane, giving centralized policy control and faster response. Know all 3 planes: **control, data, management**.
- **IAM is the perimeter** in cloud/hybrid environments — a compromised identity is as dangerous as a compromised endpoint.
- **Cloud Native Architecture (vid 19 · obj 1.1)**
  - Built on microservices, serverless functions, containers, and APIs — each component is small, fast-moving, and potentially ephemeral. The **distributed attack surface** is the core challenge.
  - Shared responsibility model still applies: users are responsible for securing workloads and configurations even in a fully cloud-native environment.
  - **IaC (Infrastructure as Code) misconfigurations** are a top cloud attack vector — treat infra templates as code needing security review. Tools: Checkov, Prisma Cloud (catch issues pre-deployment).
  - Cloud-native monitoring needs cloud-native tools — know the platform-specific log sources: **AWS** = CloudTrail, VPC Flow Logs, GuardDuty; **Azure** = Sentinel, Defender for Cloud.
  - **MITRE ATT&CK Cloud Matrix** is the tactical reference for mapping cloud incidents to adversary behavior.
- **Virtualization Technologies and Security (vid 20 · obj 1.1)**
  - **Type 1 hypervisors**: run on bare metal, used in enterprise/cloud environments. **Type 2 hypervisors**: run on a host OS, used in lab/desktop environments.
  - **VM escape** = the highest-severity virtualization-specific attack — bypasses VM isolation, can expose all VMs on the same host. Mitigation: keep hypervisors patched.
  - **VM sprawl**: forgotten, unpatched VMs become easy targets. Mitigation: inventory VMs regularly, cross-reference against an active asset list.
  - **Snapshots** can expose sensitive data and persist malware states — monitor snapshot creation events as part of investigations.
  - **East-west traffic** between VMs doesn't cross the perimeter firewall — visibility at the virtual network layer needs micro-segmentation tools like VMware NSX.
- **Containerization Concepts — Docker, Kubernetes (vid 21 · obj 1.1)**
  - Containers share the host OS kernel — that shared kernel is the core security risk: a **container escape** can give an attacker access to the host and all other containers.
  - **Docker** manages individual containers. Image security is critical — scan images before deployment (Trivy, Prisma Cloud); never blindly pull from public registries.
  - **Kubernetes** orchestrates containers at scale. Top attack vectors: RBAC misconfigurations, exposed API servers, plaintext secrets.
  - **Falco** = runtime security monitoring for containers. **Kubernetes audit log** = API-level visibility into cluster activity. The two primary analyst tools in a containerized environment.
  - Never run containers as root in production — apply least privilege at the container level, same as any other system.
- **API Concepts (vid 22 · obj 1.1)**
  - APIs are the communication layer for modern apps. REST APIs over HTTP look like normal web traffic — makes API attacks hard to detect with traditional tools.
  - **OWASP API Security Top 10** is the reference for the most common/dangerous API vulns. Top issues: Broken Object Level Authorization (BOLA), Broken Authentication, lack of rate limiting.
  - **API keys and OAuth tokens** are the primary auth mechanisms. Key leakage and token theft are major attack vectors — monitor for API keys used from unexpected locations.
  - **API gateways** are the primary monitoring/control point for API activity — log everything, watch for auth failures, high request rates, and sequential enumeration patterns.
- **Device Management Concepts (vid 24 · obj 1.1)**
  - **MDM** (Mobile Device Management) manages full corporate devices — the primary control for mobile security. **MAM** (Mobile Application Management) manages only corporate apps and data — the right choice for **BYOD** scenarios.
  - **EDR** gives deep endpoint visibility, but only on managed, enrolled devices. Unmanaged devices are monitoring blind spots — a security risk and an exam topic.
  - **Zero trust conditional access** continuously verifies device posture before granting access to resources. Monitor conditional access logs for compliance failures and *unexpected successes*.
  - **IoT devices** are high risk and typically unmanageable with standard security tools — segment them away from corporate systems on a dedicated VLAN/network segment.
  - **UEM** (Unified Endpoint Management) is the modern platform for managing the full device fleet from a single console — the starting point for device inventory and compliance verification during investigations.

*Still to come in this domain: logging, OS concepts, IAM/PAM, encryption, OT/ICS (1.1); indicators of malicious activity (1.2); analysis tools (1.3); threat intel and hunting (1.4); AI in security operations (1.6).*

### Domain 2.0: Vulnerability Management (26%)

**Risk fundamentals (vids 11–14 · obj 2.4)**

- Risk ≈ likelihood × impact of a threat exploiting a vulnerability.
- **Inherent risk** = risk before any controls are applied. **Residual risk** = risk left over after controls are applied. **Risk appetite** = how much risk an org is willing to accept overall (set by leadership).
- **Risk management strategies (the 4 T's, often taught as accept/transfer/avoid/mitigate)**:
  - *Accept* — acknowledge and do nothing further (risk is within appetite / cost of fixing > cost of impact)
  - *Transfer* — shift the risk elsewhere, e.g. cyber insurance, outsourcing
  - *Avoid* — eliminate the risk entirely, e.g. discontinue the risky activity/system
  - *Mitigate* — reduce likelihood or impact via controls
- **Security control types** — two overlapping ways to categorize:
  - By **category** (4 types, per the course): Managerial (policies, risk assessments, governance), Operational (day-to-day processes carried out by people, e.g. awareness training, incident handling), Technical (enforced by systems, e.g. firewalls, MFA, encryption), Physical (locks, badges, cameras, fencing). ⚠️ **Exam wording:** the official CS0-004 objectives (2.4) list only **3 control types — Administrative, Technical, Physical**. Administrative covers what the course splits into Managerial + Operational.
  - By **function** (per vid 15): Preventive, Detective, Responsive, Corrective — this matches the official CS0-004 list (2.4) exactly. *Compensating controls* appear separately in 2.3 as a mitigation strategy.
- **Policies, Governance, and SLOs (vid 16 · obj 2.4)**
  - **Governance** = the overall framework of rules, roles, and decision-making that directs how an org manages security (sets direction, assigns accountability).
  - **Policies** sit under governance — formal, high-level statements of intent (e.g. an Acceptable Use Policy, Password Policy). Policies are supported by standards (mandatory specifics), procedures (step-by-step how-to), and guidelines (recommended, not mandatory).
  - **SLO (Service-Level Objective)** = a specific, measurable target within a broader SLA (Service-Level Agreement) — e.g. "detect and triage critical alerts within 15 minutes." SLAs are the overall contract/commitment; SLOs are the individual measurable goals inside it.
- **Aligning Controls with Business Risk (vid 17 · obj 2.4)**
  - Starts with a **BIA (Business Impact Analysis)**: identifies which assets and functions are most critical to the org — the foundation for everything else.
  - Control selection driven by 3 questions: (1) does it address a real threat to a critical asset, (2) is it proportionate to the risk and asset value, (3) does it complement existing architecture.
  - **NIST CSF** gives the structural framework for a balanced program across 5 functions: Identify, Protect, Detect, Respond, Recover.
  - Control gaps must be handled deliberately — either escalate with a business case, or formally document a **risk acceptance** with accountability and a review date. Undocumented gaps = negligence, not strategy.
  - Communicating risk to leadership means translating technical findings into business impact language: revenue, reputation, regulatory exposure, customer trust — the terms that drive executive decisions.

*Still to come in this domain: scanning methods (2.1); assessment tool output, e.g. Nmap, Nessus, Burp (2.2); prioritisation with CVSS and EPSS (2.3); SAST/DAST, SBOM, third-party risk (2.4).*

### Domain 3.0: Incident Response and Management (24%)

*Notes will fill in here as we cover attack frameworks: Kill Chain, Diamond Model, ATT&CK (3.1); the IR process (3.2); and IR techniques, evidence handling and RCA (3.3).*

### Domain 4.0: Reporting and Communication (16%)

**Shift handover (vid 10 · obj 4.2)**

- **Shift handover**: documenting open incidents, active alerts, and pending actions at end of shift so the next analyst isn't starting blind — a weak handover is a common real-world gap that lets things slip through.

*Still to come in this domain: vulnerability management reporting, KPIs and SLAs (4.1); incident and SecOps reporting, communication plans, metrics like MTTD/MTTR (4.2).*

## Glossary

| Term | Meaning |
| --- | --- |
| *to be filled in* |  |
