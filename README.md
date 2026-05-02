# Ghostwriter Mesh Swarm

Ghostwriter Mesh Swarm is a decentralized, peer-to-peer AI agent network powered by the **Gensyn AXL protocol** (an overlay networking layer built on Yggdrasil). 

Instead of relying on centralized messaging buses (like Kafka, RabbitMQ, or Redis queues), this project demonstrates how AI agents can communicate, coordinate, and reach consensus completely over a local peer-to-peer mesh network.

<img width="2674" height="1648" alt="image" src="https://github.com/user-attachments/assets/32415de4-305d-4cd3-9379-2c099d3ff6cb" />


## What It Solves

In traditional multi-agent systems, agents require a centralized orchestrator or message broker to pass state back and forth. This introduces single points of failure, scaling bottlenecks, and requires complex infrastructure setup.

**Ghostwriter Mesh** circumvents this by giving every AI Agent its own dedicated Yggdrasil IPv6 address and AXL Node. The agents communicate directly with each other by sending raw byte payloads over the mesh to specific public keys. 

## The Agent Pipeline

This project simulates an autonomous editorial room with three specialized agents:

1. **Writer Agent (`api_writer.py`)**: Hosts the FastAPI frontend bridge. It receives a topic from the user, drafts an initial blog post, and dispatches it over the mesh to the Checker.
2. **Checker Agent (`agent_checker.py`)**: Polls its AXL node queue. When a draft arrives, it critiques and fact-checks the text, then routes the critique to the Editor.
3. **Editor Agent (`agent_editor.py`)**: Receives the critique, polishes the final text, and sends the finalized post back to the Writer node, which returns it to the user.

## ⚙️ Local Setup Guide

### 1. Install Dependencies
Ensure you have Python 3.9+ installed. Set up your virtual environment and install the required packages:

```bash
python -m venv venv
source venv/bin/activate
pip install fastapi uvicorn google-generativeai python-dotenv requests
```

### 2. Configure Environment Variables
Copy the provided `.env.example` file to create your own local `.env` file:

```bash
cp .env.example .env
```

Open `.env` and add your **Gemini API Key** from Google AI Studio.
*(You will add the Mesh Public Keys in step 4).* 

### 3. Start the AXL Nodes
The mesh requires three local Yggdrasil overlay nodes to handle the peer-to-peer routing. You will need three separate terminal tabs.

**Terminal 1 (Writer Node):**
```bash
./axl/node -config configs/writer-config.json
```

**Terminal 2 (Checker Node):**
```bash
./axl/node -config configs/checker-config.json
```

**Terminal 3 (Editor Node):**
```bash
./axl/node -config configs/editor-config.json
```

### 4. Register the Mesh Public Keys
When the AXL nodes boot up, they will print their generated Public Keys to the terminal (e.g., `[node] Our Public Key: a6d702...`).

Because the nodes generate new identities on startup, you must copy these keys into your `.env` file so the Python agents know where to route their messages:

- Copy the Public Key from **Terminal 1** into `WRITER_PUB_KEY` in your `.env`.
- Copy the Public Key from **Terminal 2** into `CHECKER_PUB_KEY` in your `.env`.
- Copy the Public Key from **Terminal 3** into `EDITOR_PUB_KEY` in your `.env`.

### 5. Start the AI Agents
Open three more terminal tabs (ensure your virtual environment is activated in each) to run the AI agents.

**Terminal 4 (Writer Server):**
```bash
uvicorn backend.api_writer:app --reload --port 8000
```

**Terminal 5 (Checker Agent):**
```bash
python agents/agent_checker.py
```

**Terminal 6 (Editor Agent):**
```bash
python agents/agent_editor.py
```

## Running the UI & Pipeline

Once all 6 terminals are running smoothly, you can interact with the agent swarm via the luxury frontend.

1. Open your web browser.
2. Navigate to the local file path of the frontend: `file:///path/to/ghostwriter-mesh/frontend/index.html` (or simply drag and drop the `index.html` file into your browser).
3. Enter a topic in the luxury input bar and click **Generate**.

You will see the Writer draft the post, route it over the mesh to the Checker, which forwards it to the Editor. Finally, the beautifully formatted, polished article will render seamlessly on your screen!

*(Note: Initial routing over the Yggdrasil DHT may take ~10-15 seconds per hop, so please be patient while the AI agents securely transmit data across the mesh!)*

___

## Beyond the Hackathon: Real-World Applications

### 1. Web3 & Decentralized Intelligence
* **Autonomous Trading Reports:** Feed raw tournament data to the mesh to verify risk metrics and generate polished, automated weekly recaps for algorithmic trading fleets.
* **Smart Contract Auditing Mesh:** Reconfigure the pipeline to `Code Reader → Vulnerability Checker → Exploit Explainer` for rigorous, multi-step security reviews.
* **Historical Data Consensus:** Independent agents fetch off-chain events, cross-reference findings, and reach consensus on factual truth before pushing data onchain.

### 2. Enterprise Privacy
* **Secure Corporate Knowledge:** Because AXL uses end-to-end encryption locally, law firms or trading desks can deploy "Researcher" and "Reviewer" agents that query highly confidential, NDA-protected documents without ever sending data to a centralized cloud.
* **Automated Compliance:** Outbound communications can be auto-routed through a localized Compliance Agent to flag regulatory or internal policy violations before leaving the network.

### 3. High-Fidelity Content Automation
* **Technical Documentation:** A DevRel pipeline where an agent drafts a tutorial, routes it to a second agent equipped with the raw SDK source code for strict technical verification, and a third polishes it for publication. 
* **Decentralized News Desks:** Autonomous newsrooms that scrape events, rigorously fact-check against multiple sources, and publish with zero centralized editorial bottlenecks.
___

Built by [**ODbeke**](https://x.com/lamide_nova) for the Gensyn AXL Hackathon (OpenAgents 2026)
