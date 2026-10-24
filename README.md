#  ClimateLens — Verifiable Climate Intelligence Platform

**Turning climate data into trustworthy, understandable, and verifiable environmental evidence.**

ClimateLens is an AI-powered climate intelligence platform that combines environmental data, cryptographic integrity verification, and blockchain-ready evidence anchoring to help people explore climate information and understand whether recorded evidence has been altered.

Instead of simply displaying climate data, ClimateLens helps users examine its integrity, explore environmental indicators, understand climate information in plain language, and record community-reported climate actions.

> **Hackathon:** IEEE ClimateChain Global Hackathon 2026  
> **Track:** Track 4 — Climate Data & Environmental Monitoring

---

##  1. The Problem

Climate information is essential for environmental monitoring, research, and decision-making. However, collecting environmental data is only part of the challenge. People also need ways to understand where information comes from, identify changes to recorded evidence, and establish whether a record matches its original state.

Many climate dashboards focus primarily on displaying measurements and visualizations. Data provenance, integrity verification, and accessible explanations may be less visible to everyday users.

ClimateLens addresses this challenge by bringing climate data exploration, cryptographic integrity checks, AI-assisted explanations, and blockchain verification workflows into one platform.

### Our goals

- Make climate information easier to explore and understand.
- Help users detect changes to recorded climate evidence.
- Make data-integrity checks visible and understandable.
- Provide a pathway for blockchain-based evidence verification.
- Connect environmental awareness with community-reported climate action.

---

##  2. Our Solution

ClimateLens transforms environmental information into evidence that users can inspect and verify.

The platform combines environmental data workflows, cryptographic hashing, AI-powered explanations, and blockchain-ready verification in an interactive application.

Its central idea is simple:

**Climate data should not only be accessible. Its integrity should also be testable.**

ClimateLens demonstrates how environmental observations can be associated with cryptographic fingerprints, how changes to evidence can be detected, and how records can be prepared for blockchain anchoring.

---

##  3. Key Features

###  Climate Data Exploration

ClimateLens integrates environmental data workflows involving Open-Meteo and Copernicus ERA5-related data.

Users can explore climate information and associated environmental indicators through an interactive interface.

Data-quality and freshness checks help communicate the condition of available data instead of treating every record as automatically reliable.

###  Cryptographic Climate Evidence

ClimateLens uses cryptographic hashing to create a fingerprint of a canonicalized evidence record.

The implementation uses:

- **RFC 8785 JSON Canonicalization Scheme (JCS)** to normalize JSON representation.
- **SHA-256** to calculate a cryptographic digest.
- Data-quality and completeness checks to help assess evidence records.

Canonicalization helps ensure that equivalent JSON representations produce a consistent input for hashing.

A changed record can produce a different digest, providing a way to detect modifications relative to the original evidence.

**Important distinction:** A matching digest supports an integrity check against a known reference. By itself, a hash does not establish that the original environmental measurement was accurate or independently verified.

###  Interactive Tampering Laboratory

The Tampering Laboratory provides a practical demonstration of data integrity.

Users can experiment with a sandboxed evidence record, modify a value, and observe how its cryptographic digest changes.

The application can then demonstrate the mismatch between the modified record and the original evidence fingerprint.

This makes an otherwise abstract cryptographic concept easier to understand.

The experiment is designed to leave the original evidence record unchanged.

###  ClimateProof Verify

ClimateProof Verify provides an interface for checking climate evidence using a snapshot ID or an uploaded JSON record.

The verification workflow is designed to help users inspect evidence and understand its integrity status.

ClimateLens distinguishes between simulated verification and actual blockchain anchoring.

When real blockchain credentials are not configured, the application identifies the relevant result as simulated or unsubmitted rather than presenting it as a completed on-chain transaction.

###  Blockchain-Ready Evidence Anchoring

ClimateLens includes a Solidity smart contract for anchoring climate evidence and an EVM-compatible transaction workflow.

When configured with the required network and contract credentials, the application can submit an anchoring transaction and inspect its receipt and `EvidenceAnchored` event.

The implementation is designed to support verification of evidence through a blockchain transaction.

However, **a blockchain-ready workflow is not the same as a completed blockchain transaction**. Actual on-chain verification requires a successfully submitted transaction and a verifiable receipt.

ClimateLens does not invent transaction hashes or block numbers when a real transaction has not occurred.

###  Bilingual AI Climate Copilot

The Climate Copilot helps users understand climate information through conversational explanations in English and Tamil.

It integrates Gemini for AI-assisted responses and provides a deterministic fallback when the AI service is unavailable.

The aim is to make climate information more accessible to users who may not have a technical or scientific background.

AI-generated explanations should be treated as informational assistance rather than a replacement for authoritative environmental data or official emergency guidance.

###  Community Climate Action Ledger

ClimateLens includes a community-oriented climate action ledger and climate challenges.

Users can record reported climate actions and receive cryptographic action receipts.

The application labels these entries as **User-Reported Completion**.

This distinction is important: a cryptographic receipt can help preserve the integrity of a submitted record, but it does not independently prove that the reported real-world activity occurred.

---

##  4. What Makes ClimateLens Different?

ClimateLens brings several complementary capabilities together in one platform.

| Capability | What it contributes |
|---|---|
| Environmental data workflows | Access to climate-related information |
| Data-quality checks | Visibility into completeness and freshness |
| Cryptographic hashing | A fingerprint for checking record integrity |
| Tampering Laboratory | An interactive demonstration of modification detection |
| ClimateProof Verify | An interface for examining climate evidence |
| Blockchain integration | A workflow for anchoring evidence on an EVM-compatible network |
| Bilingual AI Copilot | More accessible climate explanations in English and Tamil |
| Community Action Ledger | A structured way to record reported environmental actions |

The key differentiator is the combination of **climate intelligence, visible integrity checks, and transparent verification status**.

Rather than treating blockchain as a label, ClimateLens distinguishes the cryptographic evidence workflow from the separate process of submitting a real transaction.

---

##  5. Technology Stack

ClimateLens uses the following technologies and services in its implementation.

| Technology | Purpose |
|---|---|
| React | Interactive user interface |
| TypeScript | Type-safe application development |
| Vite | Development and build tooling |
| Gemini | AI-assisted climate explanations |
| Open-Meteo | Environmental data workflows |
| Copernicus ERA5 | Climate-data workflows |
| SHA-256 | Cryptographic evidence fingerprints |
| RFC 8785 JCS | Canonical JSON representation |
| Solidity | Smart contract implementation |
| ethers.js | EVM-compatible blockchain interaction |
| EVM-compatible network | Evidence anchoring when properly configured |

---

##  6. How It Works

ClimateLens follows a workflow that connects environmental information with integrity checks and optional blockchain anchoring.

### Step 1 — Explore climate information

The application works with environmental data from its configured data sources.

### Step 2 — Prepare the evidence

The evidence record is processed into a canonical representation so that its JSON structure can be hashed consistently.

### Step 3 — Generate the fingerprint

ClimateLens calculates a SHA-256 digest for the canonicalized evidence.

### Step 4 — Test integrity

The verification workflow compares the evidence against its expected reference. The Tampering Laboratory demonstrates how modifying a record can change its digest.

### Step 5 — Verify or anchor evidence

Users can inspect evidence through ClimateProof Verify. When blockchain configuration is available, the anchoring workflow can submit a transaction and check its receipt and emitted event.

If real blockchain submission is unavailable, the application must communicate that limitation rather than imply that the evidence has been anchored.

### Step 6 — Understand and act

Users can explore AI-assisted climate explanations and record community-reported environmental actions.

---

##  7. Testing and Verification

ClimateLens includes a project test suite covering application functionality and relevant integrity workflows.

### Run the tests

From the project directory, use:

```bash
npx tsx tests/climatelens.test.ts
```

The recorded test results should be reported exactly as shown in the actual terminal output.

**Reported test-suite result:** 121 passed, 0 failed.

This figure should be retained only if it matches the terminal output for the current project version.

### Additional verification

The project's validation workflow also includes:

- TypeScript type checking.
- Production build verification.
- Evidence-integrity and tampering checks.
- Verification-status handling.
- Blockchain workflow checks.

A passing test suite demonstrates that the tested scenarios passed. It does not, by itself, prove that every external service, production deployment, or live blockchain transaction has been independently verified.

For blockchain demonstrations, distinguish mocked or simulated tests from transactions confirmed on a real network.

---

##  8. Getting Started

### Prerequisites

Install:

- Node.js and npm.
- Git, if you intend to clone the repository.
- A code editor such as Visual Studio Code.

### Installation

Clone the actual project repository:

```bash
git clone https://github.com/e23cs249-sketch/ClimateLens.git
cd climatelens
npm install
```

Replace `https://github.com/e23cs249-sketch/ClimateLens.git` with the real repository URL before sharing these instructions.

### Run the application

Use the development command defined in the project's `package.json`.

For a project configured with the standard Vite development script:

```bash
npm run dev
```

Open the local address printed in the terminal.

If the project uses a different script or port, follow the actual configuration rather than assuming a particular address.

### Deploy to Vercel

The root `vercel.json` builds the Vite frontend into `dist` and rewrites `/api/*` requests to the Node.js function in `api/index.ts`, which serves the existing Express API routes. The API uses the same-origin `/api/v1` paths locally and in production.

Vite 8 requires Node.js `^20.19.0` or `>=22.12.0`. Weather data comes from Open-Meteo and does not require an API key. `GEMINI_API_KEY` is optional for AI explanations; without it, the application uses its deterministic explanation fallback.

The JSON data file is used as the Vercel function's seed data. Runtime writes go to `/tmp`, which is temporary and is not durable across cold starts or separate function instances. Use a persistent external database before relying on production evidence, action, or challenge updates as durable records.

### Optional blockchain configuration

The blockchain anchoring workflow uses the following configuration variables:

| Variable | Purpose |
|---|---|
| `EVM_RPC_URL` | RPC endpoint for the target EVM-compatible network |
| `EVM_CONTRACT_ADDRESS` | Deployed evidence-anchoring contract address |
| `EVM_PRIVATE_KEY` | Signing key used for transaction submission |
| `EVM_CHAIN_ID` | Target network's chain ID |

The documented configuration uses chain ID `80002` for Polygon Amoy.

These variables are required for the corresponding real blockchain submission workflow. A deployed contract and properly configured network access are also necessary.

**Security:** Never commit private keys, API keys, or other secrets to GitHub. Keep credentials in an appropriately configured local environment file or secret-management system, and ensure sensitive files are excluded from version control.

Without the required blockchain configuration, use the application's explicitly labelled simulated or unsubmitted workflow.

---

##  9. Suggested Demo Journey

The following sequence demonstrates ClimateLens's main ideas in a short hackathon presentation.

**1. Explore the climate dashboard**

Introduce the environmental information available in the application.

**2. Show the evidence record**

Explain how a climate-data record is associated with a canonical representation and cryptographic digest.

**3. Demonstrate tampering detection**

Change a value in the sandbox and show how the resulting digest differs from the original.

**4. Open ClimateProof Verify**

Demonstrate the available evidence-verification workflow and explain the displayed status.

**5. Explain blockchain anchoring**

Show the anchoring workflow. If a real transaction has been confirmed, display its actual transaction receipt or explorer record. Otherwise, clearly identify the demonstration as simulated or unsubmitted.

**6. Try the Climate Copilot**

Ask a climate-related question and demonstrate the available English and Tamil explanations.

**7. Finish with community action**

Show how the Community Climate Action Ledger records user-reported environmental activities.

The central message for judges is that ClimateLens connects environmental information with inspectable evidence and transparent integrity checks.

---

##  10. Impact and Potential

ClimateLens explores how trustworthy climate-data workflows can support environmental awareness and responsible information sharing.

Potential applications include:

- Climate-data education and public awareness.
- Environmental monitoring demonstrations.
- Integrity checks for climate-related records.
- Research and prototype evidence workflows.
- Community climate-action reporting.
- Future integrations with environmental monitoring systems.

The platform is a prototype for climate evidence and information integrity. Its usefulness in operational monitoring or formal decision-making would depend on further validation, data-source suitability, deployment reliability, and independent verification.

ClimateLens is intended for informational and educational use. It is not a substitute for official weather alerts, emergency instructions, or professional environmental assessments.

---

##  11. Challenges and Learnings

Building ClimateLens brings together multiple technical disciplines that have different requirements.

### Making climate evidence understandable

Cryptographic concepts can be difficult for non-technical users. The interactive Tampering Laboratory helps make integrity checking visible rather than leaving it as an abstract technical claim.

### Separating integrity from truth

A record's hash can help detect changes, but it cannot independently establish whether the original observation was correct. This distinction is central to designing a responsible climate-evidence platform.

### Distinguishing simulation from real blockchain activity

A local test, simulated response, or generated digest must not be confused with a confirmed on-chain transaction. ClimateLens makes this distinction explicit in its verification approach.

### Improving accessibility

The bilingual Climate Copilot and interactive interface aim to make climate information easier to explore for a wider audience.

These design considerations help keep the platform focused on transparent evidence, understandable interactions, and accurate communication of its capabilities.

---

##  12. What's Next for ClimateLens?

Future development could focus on:

- Deploying and validating the application in a publicly accessible environment.
- Demonstrating confirmed evidence-anchoring transactions on a test network.
- Expanding climate-data source coverage and provenance information.
- Improving data-quality indicators and evidence-verification explanations.
- Conducting usability testing with non-technical users.
- Improving accessibility and bilingual climate education.
- Exploring integrations with additional environmental monitoring systems.

These are future directions rather than claims that all capabilities are already deployed.

---

##  13. Contributing

ClimateLens is a climate-technology prototype intended to explore transparent environmental data workflows.

Potential contributions include improvements to the user experience, data provenance, evidence verification, accessibility, testing, and documentation.

Before accepting changes, verify that technical claims accurately reflect the implemented behavior.

Contribution instructions, licensing, and repository-specific policies should be added once those details have been established for the project.

---

##  14. Responsible Use and Transparency

ClimateLens is designed to make evidence-integrity workflows easier to understand.

A few principles guide its presentation:

- **Integrity is not truth:** A matching hash does not independently prove that an environmental measurement is accurate.
- **A hash is not a blockchain transaction:** Generating a digest does not mean that evidence has been anchored on-chain.
- **A simulation is not a live transaction:** Simulated and unsubmitted results must be labelled accurately.
- **A receipt is not independent proof of action:** A cryptographic receipt for a community entry does not establish that the reported activity occurred.
- **Climate information has limits:** Users should consult authoritative sources for operational decisions and emergency guidance.

These distinctions are important for building trust in climate-information tools.

---

##  Project Information

**Project:** ClimateLens — Verifiable Climate Intelligence Platform  
**Hackathon:** IEEE ClimateChain Global Hackathon 2026  
**Track:** Track 4 — Climate Data & Environmental Monitoring

**Repository:** https://github.com/e23cs249-sketch/ClimateLens.git

**Team:** SOLO - Rajalakshmi S

---

##  Our Vision

We envision a future in which climate information is not only available but also easier to inspect, understand, and verify.

ClimateLens is a step toward that vision: bringing environmental data, cryptographic integrity, AI-assisted explanations, and transparent evidence workflows together in one accessible platform.

**ClimateLens — Explore the climate. Inspect the evidence. Verify its integrity.**