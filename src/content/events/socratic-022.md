---
title: "Socratic Seminar 022"
date: 2026-09-30
venue: "PubKey DC, 410 7th St NW, Washington DC 20004"
rsvp: "https://luma.com/hlpzv0nh"
doors: "5:30pm"
seminar: "6:00pm"
depart: "8:30pm"
tags:
  - core
  - lightning
  - mining
  - policy
  - infosec
  - covenants
  - privacy
draft: false
---

## Ground rules

1. **No photos, videos, or recordings.**
2. [Chatham House Rule](https://en.wikipedia.org/wiki/Chatham_House_Rule): you may reiterate the contents of the meeting *without* attribution.

These rules exist so that BitDevs participants can speak freely within the event. Questions are encouraged, including basic ones!

Full chapter rules: [Ground rules](/rules). Suggest topics: [Suggest topics](/contribute).

## Location

[PubKey DC](https://www.pubkey.bar/dc/home), [410 7th St NW, Washington DC 20004](https://www.google.com/maps/search/?api=1&query=410+7th+St+NW+Washington+DC+20004).

Thank you to PubKey DC for hosting.

## Schedule

- **5:30pm – 6:00pm ET** — Doors open and social half hour
- **6:00pm – 8:30pm ET** — BitDevs Socratic Seminar
- **8:30pm ET** — Departure

## Parking / transport

- **Metro** — Gallery Place–Chinatown (Red, Green, Yellow), one block from the venue; or Metro Center (Silver, Orange, Blue), about a 10-minute walk
- **Parking** — multiple garages in Penn Quarter

## Technical / Protocol

### Bitcoin Core 31.1 + v32 Preview

**v31.1 (July 8, 2026)**

- [Announcement](https://bitcoincore.org/en/2026/07/08/release-31.1/)
- [Release notes](https://bitcoincore.org/en/releases/31.1/)
- [Binaries](https://bitcoincore.org/bin/bitcoin-core-31.1/)
- [Delving Bitcoin](https://delvingbitcoin.org/t/bitcoin-core-v31-1-released/2696)

**v32 — ConnectBlock / IBD**

- [PR #35295](https://github.com/bitcoin/bitcoin/pull/35295) — parallel prevout fetcher during ConnectBlock ([files](https://github.com/bitcoin/bitcoin/pull/35295/files))
- [PR #31132](https://github.com/bitcoin/bitcoin/pull/31132) — predecessor / same idea (stale-comment volume; #35295 continues it)
- [PR #36000](https://github.com/bitcoin/bitcoin/pull/36000) — prefetch later blocks from disk while connecting the current one
- [PR #32043](https://github.com/bitcoin/bitcoin/pull/32043) — IBD tracking PR
- [Issue #35122](https://github.com/bitcoin/bitcoin/issues/35122) — v32.0 release schedule

### Coldcard RNG Defect + HWI → Maintenance Mode

- [**Don't Trust, Verify** — postmortem (secsov.com)](https://secsov.com/articles/dont-trust-verify)
- [PDF](https://secsov.com/articles/dont-trust-verify/index.pdf) · [Markdown](https://secsov.com/articles/dont-trust-verify/index.md)
- [Bitcoin Optech #416](https://bitcoinops.org/en/newsletters/2026/07/31/)
- [TRM Labs analysis](https://www.trmlabs.com/resources/blog/the-largest-hardware-wallet-exploit-of-2026-inside-the-usd-116-million-coldcard-hack)
- [HWI maintenance mode — Optech #418](https://bitcoinops.org/en/newsletters/2026/08/14/)
- [Coinkite: Technical Deep Dive into the Entropy Issue](https://blog.coinkite.com/technical-deep-dive-into-the-entropy-issue/)

### Formal Verification of Bitcoin Consensus

Equal-weight reading on parallel efforts — none is the “official” approach:

- [btc-verified (ProofOfKeags)](https://github.com/ProofOfKeags/btc-verified) — Lean/Coq proofs of consensus rules ([Optech #414](https://bitcoinops.org/en/newsletters/2026/07/17/))
- [Hornet Node](https://hornetnode.org) — declarative semantic invariants in C++
- [Bitcoin Commons / BLVM formal verification](https://docs.thebitcoincommons.org/consensus/formal-verification.html) — numbered rules + Z3 spec-lock

### Covenants — CTV, OP_CAT, BIP 448

- [BIP 119 — OP_CTV](https://bips.dev/119/)
- [BIP 347 — OP_CAT](https://bips.dev/347/)
- [BIP 448 — Taproot-native Rebindable Transactions](https://bips.dev/448/) ([PR #1802](https://github.com/bitcoin/bips/pull/1802))
  - [BIP 446 — OP_TEMPLATEHASH](https://bips.dev/446/)
  - [BIP 348 — OP_CHECKSIGFROMSTACK](https://bips.dev/348/)
  - [BIP 349 — OP_INTERNALKEY](https://bips.dev/349/)
- [Saylor constitutional framing (July 28)](https://www.tftc.io/saylor-bitcoin-constitution-covenants-bip-110-governance) — consensus rules as a "constitution"; BIP-110, covenants, and bigger blocks labeled the same "constitutional offense"; near-unanimous buy-in or nothing

## Governance / Mining

### BIP-110 Failure, Ocean Split, Luke Dashjr Removed

- [CoinDesk: BIP-110 mines two blocks then stops](https://www.coindesk.com/tech/2026/08/09/controversial-bitcoin-fork-bip-110-mines-two-blocks-then-stops)
- [CoinDesk: miner rejects BIP-110 while mining through Ocean (DATUM)](https://www.coindesk.com/markets/2026/08/10/bitcoin-miner-rejects-bip-110-despite-mining-through-a-pool-that-supported-it)
- [CoinDesk: BIP-110 fork 300 blocks behind](https://www.coindesk.com/tech/2026/08/11/bitcoin-s-bip-110-fork-is-300-blocks-behind-btc-and-six-years-from-fixing-itself)
- [Decrypt: Luke Dashjr removed as BIP editor](https://decrypt.co/375310/luke-dashjr-removed-as-bip-editor-after-bip-110-bitcoin-fork-stalls)

### Mining — Stratum V2, Poolin Bankruptcy

- [Stratum V2: 75% hashrate commitment](https://www.coindesk.com/markets/2026/05/11/bitcoin-mining-pools-with-75-of-btc-hashrate-join-open-standard-for-block-construction)
- [Stratum V2 Working Group](https://stratumprotocol.org)
- [SV2 Job Declaration spec](https://github.com/stratum-mining/sv2-spec/blob/main/06-Job-Declaration-Protocol.md)
- [Poolin Chapter 11 / $52M asset sale](https://www.newsbtc.com/news/poolin-files-chapter-11-as-bitcoin-miner-moves-toward-52m-asset-sale/)

### Mining — GridPool vs Commons Pool

Speaking of pools that go out of business: the software layer is who builds the template and who holds the coinbase — not how many miners exist.

**Contrast (the prior attempts):**

- **P2Pool** — no operator; miners built templates and were paid from the coinbase. Died of a linear share-chain (orphans), coinbase bloat / Bitmain output caps, and dust. [p2pool.org](https://p2pool.org/)
- **DATUM** — miner-side templates via a local gateway (`getblocktemplate`); ASICs stay on Stratum V1. Ocean still requires pool-specified coinbase outputs. [Origins](https://ocean.xyz/docs/datum)
- **TIDES** — non-custodial *payout accounting* (8-block distinct share window), not a template protocol, and still run by a pool operator. [Spec](https://ocean.xyz/docs/tides)

**GridPool** ([gridpool.net](https://gridpool.net/)) — public beta / mainnet soft launch. Not a custodial wallet, not a share-chain, not a Stratum V1 pool endpoint. High-difficulty proofs enter a bounded Work Set; ordinary Bitcoin blocks snapshot the payout list; payout happens only when a GridPool miner finds a real block. Slot-0 is the finder; the rest of the coinbase is the snapshot; ranked by verified PoW, not identity. Preferred path is DATUM pointed at *your* GridPool node. Tradeoff: higher variance than FPPS/PPLNS; 300-slot coinbases reject some stock Bitmain firmware.

**Commons Pool** ([commonspool.org](https://commonspool.org/)) — BTCDecoded; same P2Pool goal (no custodian, no coordinator) without a parallel chain. Peers finalize a work snapshot at checkpoints; between checkpoints every coinbase is built from the last finalized set. Runs on Bitcoin Commons / Orange Paper, not Core. Signet only — **not live on mainnet**. Fee 1%; claimed coinbase / PPLNS.

## Lightning

### LND, Core Lightning embargo binary, Taproot Assets

- [Core Lightning 26.06.7 — binary-only security release](https://blog.blockstream.com/core-lightning-26-06-7/) (source embargoed 14 days)
- Embargo undermined quickly: release binaries retained **debug symbols**; reverse-engineering recovered the patch within hours ([Optech #420](https://bitcoinops.org/en/newsletters/2026/08/28/), [#420 Recap](https://bitcoinops.org/en/podcast/2026/09/01/) — maintainers confirmed)
- [Core Lightning 26.06 — quantum-resistant channels](https://blog.blockstream.com/core-lightning-26-06-quantum-resistant-lightning-channel/)
- [LND v0.21 release](https://lightning.engineering/posts/2026-06-11-lnd-0.21-launch/)
- [Taproot Assets v0.8 + Stablecoin SDK](https://lightning.engineering/posts/2026-06-23-tapd-0.8-launch/index.html)

## Policy / DC

### CLARITY Act — Cloture Failed (Sept 15, 2026)

Senate cloture on the motion to proceed to H.R. 3633 was **rejected 49–50** (60 needed). The bill never reached floor debate on substance.

**Suggested reading on why:** ethics provisions around officials’ crypto profits; illicit-finance / non-custodial developer liability; stablecoin yield vs banks; state AG preemption — not primarily the SEC/CFTC split.

- [Congress.gov (H.R. 3633)](https://www.congress.gov/bill/119th-congress/house-bill/3633)
- [Senate roll call vote 234](https://www.senate.gov/legislative/LIS/roll_call_votes/vote1192/vote_119_2_00234.htm)
- [Reuters: Senate fails to advance crypto bill](https://www.reuters.com/legal/government/us-senate-vote-advancing-landmark-crypto-bill-2026-09-15/)
- [DLA Piper: top points on the failure](https://www.dlapiper.com/en-us/insights/publications/2026/09/senate-fails-to-advance-the-clarity-act)
- [AMINA: why the vote failed & what regulates US crypto now](https://aminagroup.com/research/clarity-act-september-2026-why-the-senate-vote-failed-what-regulates-us-crypto-now/)

## Alternative Implementations

### Core derivatives

Same maintainer for the first two (Dimitri-H):

- [Knots Classic / Knots Legacy](https://bit-block.org/knots-legacy/) — maintenance-mode Bitcoin Knots from before the BIP-110/RDTS hard fork (legacy-chain line)
- [Bit-Block](https://bit-block.org) — his own node: Knots-derived, rebranded, hard anti-spam defaults (`datacarriersize=0`)
- [Knots Untangled](https://bitcoinuntangled.org) — separate project

### Longstanding alts

- [btcd](https://github.com/btcsuite/btcd) — Go; mostly Lightning / infrastructure today (caveat: not a competing full-node culture)
- [libbitcoin](https://github.com/libbitcoin/libbitcoin-system) — impressive IBD times recently; **no UTXO model**; still no node release

### Independent engines

- [Floresta](https://github.com/getfloresta/Floresta) — Rust, Utreexo (~800MB disk)
- [Hornet Node](https://hornetnode.org) — C++, declarative spec
- [Bitcoin Echo](https://bitcoinecho.org) — pure C, zero deps
- [rbitcoin](https://github.com/reardencode/rbitcoin) — Rust, AI-assisted; **no UTXO model**
- [satd](https://github.com/epochbtc/satd) — Rust, Silent Payments
- [Bitcoin Commons / BLVM](https://thebitcoincommons.org) — formal spec, 159 consensus rules, Z3 spec-lock

## Privacy

### Shielded Bitcoin — [[alloc] init], September 24, 2026 (critical reading)

Authors: Clara Shikhelman, Mikhail Komarov, Aleksei Moskvin.

**Claim:** Zcash-style private transfers on Bitcoin L1 with no soft fork — encrypted notes, nullifiers, ZK proofs published as Bitcoin carrier data; indexers deterministically replay state.

**Critical take:**

- The paper only specifies the *interior* transfer protocol. **Peg-in / peg-out are out of scope** — i.e. the bridge between real BTC and the shielded inventory is deferred to PIPEs v2 (experimental witness encryption / AADP). That is where custody, inflation, and liveness risk concentrate.
- **Bitcoin consensus does not validate** metaprotocol envelopes. Invalid blobs can confirm; “validity” is a software convention among wallets/indexers.
- Indexers **cannot steal keys** under the model, but can **censor, delay, or lie** to clients that do not self-replay. Most users will not run full local replay.
- Timing, fees, arity, and carrier metadata remain public; peg edges are the anonymity-set failure mode.
- “No soft fork” reframes enforcement into exotic cryptography rather than Script — it does not make the hard problem go away.

**Sources**

- [Paper (PDF)](https://allocinit.xyz/uploads/shielded-bitcoin.pdf)
- [Delving Bitcoin thread](https://delvingbitcoin.org/t/shielded-bitcoin-private-transfers-on-the-bitcoin-l1/2912)
- [PIPEs v2 (IACR)](https://eprint.iacr.org/2026/186)
- [Bitcoin Magazine writeup](https://bitcoinmagazine.com/?p=55175)

## Slides

Reading-room deck: [/presentations/socratic-022/](/presentations/socratic-022/)

## Suggest topics for the next meeting

Use [Suggest topics](/contribute) — submit a primary-source link via the form.
