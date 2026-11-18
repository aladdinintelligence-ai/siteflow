# DJ Civil SiteFlow — Clickable Sales Prototype

> A shared construction operations platform connecting DJ Civil purchase orders, material suppliers, haulage drivers, site entry totems, designated offload zones, delivery verification, and gate exit reconciliation — replacing paper tickets and manual gate ledgers with a single traceable chain of custody.

Built as a high-fidelity sales prototype for the client pitch to **DJ Civil Engineering Ltd**.

---

## Tech Stack & Architecture

- **Framework**: Next.js 16 (App Router) + TypeScript
- **Styling**: Tailwind CSS + custom design tokens (`#F7F7F5` warm off-white surface, `#14171A` ink, `#F5B301` hi-vis amber accent)
- **Icons**: Lucide React
- **Charts**: Recharts (Executive spend by contractor, turnaround duration histogram, discrepancy frequency)
- **State & Cross-Role Sync**: Central Zustand store persisted to `localStorage` (`dj_siteflow_storage`). An action taken in any role instantly updates all other roles in real time.
- **Strict Role Scoping**: Data selectors strictly filter information by role. **Zero pricing or commercial data** ever reaches driver handset components.

---

## Quick Start & Running the Prototype

```bash
# 1. Navigate to the project directory
cd siteflow

# 2. Install dependencies (if not already installed)
npm install

# 3. Start development server
npm run dev

# 4. Open in browser
http://localhost:3000
```

### Production Build
```bash
npm run build
```

---

## 5-Minute Client Pitch Walkthrough Script

Use this exact 7-step sequence during your demonstration to prove that SiteFlow solves DJ Civil's operational pain points from procurement to gate exit.

### Step 1: Procurement & Order Creation (`/ordering`)
- **Persona**: DJ Civil Commercial Ordering Team (Desktop)
- **Action**: Click **"New order"** in the top right. Select **CEMEX UK Materials Ltd**, choose **"C35/45 Ready-Mix Concrete"**, quantity `20 m³`, select destination **"Turbine Hall Basement - Pour Pit A"**, and submit.
- **Talking Point**: *"Instead of disconnected purchase orders in ERP and messy email chains, the ordering team creates a single digital record with designated site offload zones and commercial rates."*
- **Notice**: Toast notification fires immediately: *"Order created & sent to CEMEX UK"*.

### Step 2: Supplier Fulfilment & Driver Dispatch (`/supplier`)
- **Persona**: CEMEX UK Logistics Coordinator (Desktop + Mobile)
- **Action**: Use the role switcher to jump to **Supplier / Contractor (`/supplier`)**. Open the **"Incoming Orders"** tab to see the order just created. Click **"Accept & Assign Driver"**, select **Dave Jenkins**, confirm vehicle reg (`LK21 WZP`), and click confirm.
- **Talking Point**: *"The supplier receives the digital request in their portal, accepts it, and binds an authorized driver and vehicle registration. No phone calls or unconfirmed arrivals."*
- **Notice**: Order transitions to **Active Dispatches** with real-time telematics ETA.

### Step 3: Driver Handset Job Briefing (`/driver`)
- **Persona**: Dave Jenkins (Concrete Drum Driver - Mobile Frame)
- **Action**: Switch role to **Driver / Worker (`/driver`)**. Dave sees his assigned run, site delivery address, destination laydown instructions, and required PPE.
- **Talking Point**: *"The driver sees only what they need to navigate safely: destination zone, hazard warnings, and site time slot. **Zero pricing is visible—commercial margins remain strictly confidential.**"*

### Step 4: Contactless Gate Entry & Security Clearance (`/marshal`)
- **Persona**: Dave Jenkins arriving at Gate 1 & Traffic Marshal on Gatehouse Tablet
- **Action**: 
  - On the driver screen, click **"Scan site gate QR"** to simulate pointing the phone camera at the gate totem QR code.
  - Switch to **Traffic Marshal (`/marshal`)**. Notice the vehicle `LK21 WZP` is immediately verified, moving from *Expected Arrivals* to *Currently On Site*.
- **Talking Point**: *"Drivers scan the gatehouse totem QR code upon arrival. SiteFlow instantly matches the vehicle against today's purchase order, verifies induction status, and auto-authorises entry without the marshal re-typing registration numbers."*

### Step 5: Site Haul Road Navigation (`/driver`)
- **Persona**: Dave Jenkins (Mobile)
- **Action**: Back on the driver screen, the view has transitioned into **"On-Site Navigation"**. Dave views the interactive SVG site plan displaying the approved one-way haul route from Gate 1 directly to Turbine Hall Basement Bay 4, complete with the site speed limit (10 km/h) and hazard warnings.
- **Talking Point**: *"Eliminates lost delivery drivers wandering across active construction zones. Drivers follow a geofenced, approved site route directly to their designated offload pit."*

### Step 6: Receiving Physical Verification & Shortage Flagging (`/supervisor`)
- **Persona**: Gary Nolan (DJ Civil Receiving Supervisor - Tablet)
- **Action**: Switch to **Receiving Supervisor (`/supervisor`)**. In the **"Awaiting Inspection"** queue, click **"Verify Delivery"** on Dave's delivery. Click the demo button **"-1.5 m³ Shortage"** (adjusting received quantity to `18.5 m³`), select reason code **"Delivery Shortage"**, and click **"Confirm Verification & Sign Off"**.
- **Talking Point**: *"The receiving officer verifies the physical load against weighbridge tickets. When a shortage occurs, it is signed off digitally at the discharge point with photographic proof notes. No disputed paper delivery notes 30 days later."*
- **Notice**: The quantity reconciliation widget records a `-1.5 m³` variance, triggering an automatic credit note adjustment for commercial settlement.

### Step 7: Gate Exit & Lifecycle Governance (`/driver` & `/director`)
- **Persona**: Dave Jenkins exiting gate & DJ Civil Project Director (Executive Desktop)
- **Action**:
  - On the driver view, tap **"Scan out at gate"**.
  - Switch to **Director / PM (`/director`)**.
- **Talking Point**: *"The driver scans out at the exit gate. The platform calculates exact site turnaround duration (e.g., 32 mins). The Director dashboard immediately reconciles committed PO spend vs verified invoiced spend, accounts for the 1.5 m³ credit note, and updates contractor SLA scores across all active projects."*

---

## All 7 Core Roles & Supported Views

| Role | Route | Device Focus | Purpose |
|---|---|---|---|
| **Director / PM** | `/director` | Desktop | Project spend commitment vs invoiced spend, contractor volume, live site headcount, and full lifecycle order audit trail. |
| **Ordering Team** | `/ordering` | Desktop | Material/service PO creation, site destination zone assignment, supplier coordination, and ledger filters. |
| **Supplier / Contractor** | `/supplier` | Desktop / Mobile | Order acceptance/decline, driver and vehicle fleet allocation, and delivery reconciliation with credit notes. |
| **Driver / Worker** | `/driver` | Mobile (phone frame) | Operational job brief (zero pricing), simulated gate QR scanner, approved SVG haul route navigation, and gate scan-out. |
| **Traffic Marshal** | `/marshal` | Tablet / Mobile | Expected deliveries queue, live gate events, automated QR clearances, and security exception holds. |
| **Receiving Supervisor** | `/supervisor` | Tablet / Mobile | Discharge bay inspection queue, ordered vs received quantity verification, shortage logging, and quality sign-off. |
| **Data Analyst** | `/analyst` | Desktop | Turnaround duration histograms, contractor punctuality SLAs, waste by trade category, and carbon savings. |

---

## Demo Controls & Helpful Shortcuts

- **Reset Demo Data**: Click the **"Reset"** button with circular arrow in the top navigation bar at any time to instantly restore all 25 realistic UK construction orders, visits, and supplier seed records to a fresh starting state.
- **Guided Demo Bar**: Toggle the guided demo bar on/off with the top-bar button. Step controls allow skipping or jumping directly to any step (1 to 7).
- **Client Kickoff Questions**: Navigate to `/discovery` to view the 5 critical commercial and operational questions for the DJ Civil discovery workshop.
