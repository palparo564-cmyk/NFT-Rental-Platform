"use client";

import { useState, useCallback } from "react";
import {
  listNFT,
  rentNFT,
  returnNFT,
  getNFTStatus,
  CONTRACT_ADDRESS,
} from "@/hooks/contract";
import { AnimatedCard } from "@/components/ui/animated-card";
import { Spotlight } from "@/components/ui/spotlight";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ── Icons ────────────────────────────────────────────────────

function SpinnerIcon() {
  return (
    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function TagIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
      <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

// ── Styled Input ─────────────────────────────────────────────

function Input({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-2">
      <label className="block text-[11px] font-medium uppercase tracking-wider text-white/30">
        {label}
      </label>
      <div className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-px transition-all focus-within:border-[#7c6cf0]/30 focus-within:shadow-[0_0_20px_rgba(124,108,240,0.08)]">
        <input
          {...props}
          className="w-full rounded-[11px] bg-transparent px-4 py-3 font-mono text-sm text-white/90 placeholder:text-white/15 outline-none"
        />
      </div>
    </div>
  );
}

// ── Method Signature ─────────────────────────────────────────

function MethodSignature({
  name,
  params,
  returns,
  color,
}: {
  name: string;
  params: string;
  returns?: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/[0.04] bg-white/[0.02] px-4 py-3 font-mono text-sm">
      <span style={{ color }} className="font-semibold">fn</span>
      <span className="text-white/70">{name}</span>
      <span className="text-white/20 text-xs">{params}</span>
      {returns && (
        <span className="ml-auto text-white/15 text-[10px]">{returns}</span>
      )}
    </div>
  );
}

// ── Status Config ────────────────────────────────────────────

const RENTAL_STATUS = {
  available: { color: "text-[#34d399]", bg: "bg-[#34d399]/10", border: "border-[#34d399]/20", dot: "bg-[#34d399]", variant: "success" as const },
  rented: { color: "text-[#f87171]", bg: "bg-[#f87171]/10", border: "border-[#f87171]/20", dot: "bg-[#f87171]", variant: "warning" as const },
};

// ── Main Component ─────────────────────────────────────────

type Tab = "list" | "rent" | "return" | "status";

interface ContractUIProps {
  walletAddress: string | null;
  onConnect: () => void;
  isConnecting: boolean;
}

export default function ContractUI({ walletAddress, onConnect, isConnecting }: ContractUIProps) {
  const [activeTab, setActiveTab] = useState<Tab>("status");
  const [error, setError] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<string | null>(null);

  // List NFT state
  const [listNftId, setListNftId] = useState("");
  const [listPrice, setListPrice] = useState("");
  const [isListing, setIsListing] = useState(false);

  // Rent NFT state
  const [rentNftId, setRentNftId] = useState("");
  const [rentDays, setRentDays] = useState("");
  const [isRenting, setIsRenting] = useState(false);

  // Return NFT state
  const [returnNftId, setReturnNftId] = useState("");
  const [isReturning, setIsReturning] = useState(false);

  // Status state
  const [statusNftId, setStatusNftId] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [nftStatus, setNftStatus] = useState<{ owner: string; price: string; isRented: boolean } | null>(null);

  const truncate = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const handleListNFT = useCallback(async () => {
    if (!walletAddress) return setError("Connect wallet first");
    if (!listNftId.trim() || !listPrice.trim()) return setError("Fill in all fields");
    setError(null);
    setIsListing(true);
    setTxStatus("Awaiting signature...");
    try {
      await listNFT(walletAddress, listNftId.trim(), BigInt(listPrice.trim()));
      setTxStatus("NFT listed for rent!");
      setListNftId("");
      setListPrice("");
      setTimeout(() => setTxStatus(null), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Transaction failed");
      setTxStatus(null);
    } finally {
      setIsListing(false);
    }
  }, [walletAddress, listNftId, listPrice]);

  const handleRentNFT = useCallback(async () => {
    if (!walletAddress) return setError("Connect wallet first");
    if (!rentNftId.trim() || !rentDays.trim()) return setError("Fill in all fields");
    setError(null);
    setIsRenting(true);
    setTxStatus("Awaiting signature...");
    try {
      await rentNFT(walletAddress, rentNftId.trim(), BigInt(rentDays.trim()));
      setTxStatus("NFT rented successfully!");
      setRentNftId("");
      setRentDays("");
      setTimeout(() => setTxStatus(null), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Transaction failed");
      setTxStatus(null);
    } finally {
      setIsRenting(false);
    }
  }, [walletAddress, rentNftId, rentDays]);

  const handleReturnNFT = useCallback(async () => {
    if (!walletAddress) return setError("Connect wallet first");
    if (!returnNftId.trim()) return setError("Enter NFT ID");
    setError(null);
    setIsReturning(true);
    setTxStatus("Awaiting signature...");
    try {
      await returnNFT(walletAddress, returnNftId.trim());
      setTxStatus("NFT returned successfully!");
      setReturnNftId("");
      setTimeout(() => setTxStatus(null), 5000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Transaction failed");
      setTxStatus(null);
    } finally {
      setIsReturning(false);
    }
  }, [walletAddress, returnNftId]);

  const handleCheckStatus = useCallback(async () => {
    if (!statusNftId.trim()) return setError("Enter NFT ID");
    setError(null);
    setIsChecking(true);
    setNftStatus(null);
    try {
      const result = await getNFTStatus(statusNftId.trim(), walletAddress || undefined);
      if (result && Array.isArray(result) && result.length === 3) {
        setNftStatus({
          owner: String(result[0]),
          price: String(result[1]),
          isRented: Boolean(result[2]),
        });
      } else {
        setError("NFT not found");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Query failed");
    } finally {
      setIsChecking(false);
    }
  }, [statusNftId, walletAddress]);

  const tabs: { key: Tab; label: string; icon: React.ReactNode; color: string }[] = [
    { key: "status", label: "Check", icon: <SearchIcon />, color: "#4fc3f7" },
    { key: "list", label: "List", icon: <TagIcon />, color: "#7c6cf0" },
    { key: "rent", label: "Rent", icon: <KeyIcon />, color: "#34d399" },
    { key: "return", label: "Return", icon: <RefreshIcon />, color: "#fbbf24" },
  ];

  return (
    <div className="w-full max-w-2xl animate-fade-in-up-delayed">
      {/* Toasts */}
      {error && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-[#f87171]/15 bg-[#f87171]/[0.05] px-4 py-3 backdrop-blur-sm animate-slide-down">
          <span className="mt-0.5 text-[#f87171]"><AlertIcon /></span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-[#f87171]/90">Error</p>
            <p className="text-xs text-[#f87171]/50 mt-0.5 break-all">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="shrink-0 text-[#f87171]/30 hover:text-[#f87171]/70 text-lg leading-none">&times;</button>
        </div>
      )}

      {txStatus && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-[#34d399]/15 bg-[#34d399]/[0.05] px-4 py-3 backdrop-blur-sm shadow-[0_0_30px_rgba(52,211,153,0.05)] animate-slide-down">
          <span className="text-[#34d399]">
            {txStatus.includes("success") || txStatus.includes("!") ? <CheckIcon /> : <SpinnerIcon />}
          </span>
          <span className="text-sm text-[#34d399]/90">{txStatus}</span>
        </div>
      )}

      {/* Main Card */}
      <Spotlight className="rounded-2xl">
        <AnimatedCard className="p-0" containerClassName="rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#7c6cf0]/20 to-[#4fc3f7]/20 border border-white/[0.06]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#7c6cf0]">
                  <path d="m21.21 15.89-.8-.79a2 2 0 0 0-2.82 0l-.79.8a2 2 0 0 1-2.82 0l-.79-.8a2 2 0 0 0-2.82 0l-.8.79a2 2 0 0 1-2.82 0l-.79-.8a2 2 0 0 0-2.82 0l-.8.79a2 2 0 0 1-2.82 0l1.77-1.77a10 10 0 0 0 14.08 0l1.77 1.77a2 2 0 0 1 0 2.82Z" />
                  <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7Z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white/90">NFT Rental Platform</h3>
                <p className="text-[10px] text-white/25 font-mono mt-0.5">{truncate(CONTRACT_ADDRESS)}</p>
              </div>
            </div>
            <Badge variant="info" className="text-[10px]">Soroban</Badge>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/[0.06] px-2">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => { setActiveTab(t.key); setError(null); setNftStatus(null); }}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-3.5 text-sm font-medium transition-all",
                  activeTab === t.key ? "text-white/90" : "text-white/35 hover:text-white/55"
                )}
              >
                <span style={activeTab === t.key ? { color: t.color } : undefined}>{t.icon}</span>
                {t.label}
                {activeTab === t.key && (
                  <span
                    className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full transition-all"
                    style={{ background: `linear-gradient(to right, ${t.color}, ${t.color}66)` }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Status */}
            {activeTab === "status" && (
              <div className="space-y-5">
                <MethodSignature name="get_status" params="(nft_id: Symbol)" returns="-> (Address, i128, bool)" color="#4fc3f7" />
                <Input label="NFT ID" value={statusNftId} onChange={(e) => setStatusNftId(e.target.value)} placeholder="e.g. NFT001" />
                <ShimmerButton onClick={handleCheckStatus} disabled={isChecking} shimmerColor="#4fc3f7" className="w-full">
                  {isChecking ? <><SpinnerIcon /> Querying...</> : <><SearchIcon /> Check Status</>}
                </ShimmerButton>

                {nftStatus && (
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden animate-fade-in-up">
                    <div className="border-b border-white/[0.06] px-4 py-3 flex items-center justify-between">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-white/25">Rental Status</span>
                      <Badge variant={nftStatus.isRented ? "warning" : "success"}>
                        <span className={cn("h-1.5 w-1.5 rounded-full mr-1.5", nftStatus.isRented ? RENTAL_STATUS.rented.dot : RENTAL_STATUS.available.dot)} />
                        {nftStatus.isRented ? "Rented" : "Available"}
                      </Badge>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/35">Owner</span>
                        <span className="font-mono text-sm text-white/80">{truncate(nftStatus.owner)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-white/35">Price/Day</span>
                        <span className="font-mono text-sm text-white/80">{nftStatus.price} XLM</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* List */}
            {activeTab === "list" && (
              <div className="space-y-5">
                <MethodSignature name="list_nft" params="(owner: Address, nft_id: Symbol, price: i128)" color="#7c6cf0" />
                <Input label="NFT ID" value={listNftId} onChange={(e) => setListNftId(e.target.value)} placeholder="e.g. NFT001" />
                <Input label="Price per Day (XLM)" type="number" value={listPrice} onChange={(e) => setListPrice(e.target.value)} placeholder="e.g. 10" />
                {walletAddress ? (
                  <ShimmerButton onClick={handleListNFT} disabled={isListing} shimmerColor="#7c6cf0" className="w-full">
                    {isListing ? <><SpinnerIcon /> Listing...</> : <><TagIcon /> List NFT for Rent</>}
                  </ShimmerButton>
                ) : (
                  <button
                    onClick={onConnect}
                    disabled={isConnecting}
                    className="w-full rounded-xl border border-dashed border-[#7c6cf0]/20 bg-[#7c6cf0]/[0.03] py-4 text-sm text-[#7c6cf0]/60 hover:border-[#7c6cf0]/30 hover:text-[#7c6cf0]/80 active:scale-[0.99] transition-all disabled:opacity-50"
                  >
                    Connect wallet to list NFTs
                  </button>
                )}
              </div>
            )}

            {/* Rent */}
            {activeTab === "rent" && (
              <div className="space-y-5">
                <MethodSignature name="rent_nft" params="(renter: Address, nft_id: Symbol, days: i128)" color="#34d399" />
                <Input label="NFT ID" value={rentNftId} onChange={(e) => setRentNftId(e.target.value)} placeholder="e.g. NFT001" />
                <Input label="Days to Rent" type="number" value={rentDays} onChange={(e) => setRentDays(e.target.value)} placeholder="e.g. 7" />
                {walletAddress ? (
                  <ShimmerButton onClick={handleRentNFT} disabled={isRenting} shimmerColor="#34d399" className="w-full">
                    {isRenting ? <><SpinnerIcon /> Renting...</> : <><KeyIcon /> Rent NFT</>}
                  </ShimmerButton>
                ) : (
                  <button
                    onClick={onConnect}
                    disabled={isConnecting}
                    className="w-full rounded-xl border border-dashed border-[#34d399]/20 bg-[#34d399]/[0.03] py-4 text-sm text-[#34d399]/60 hover:border-[#34d399]/30 hover:text-[#34d399]/80 active:scale-[0.99] transition-all disabled:opacity-50"
                  >
                    Connect wallet to rent NFTs
                  </button>
                )}
              </div>
            )}

            {/* Return */}
            {activeTab === "return" && (
              <div className="space-y-5">
                <MethodSignature name="return_nft" params="(nft_id: Symbol)" color="#fbbf24" />
                <Input label="NFT ID" value={returnNftId} onChange={(e) => setReturnNftId(e.target.value)} placeholder="e.g. NFT001" />
                {walletAddress ? (
                  <ShimmerButton onClick={handleReturnNFT} disabled={isReturning} shimmerColor="#fbbf24" className="w-full">
                    {isReturning ? <><SpinnerIcon /> Returning...</> : <><RefreshIcon /> Return NFT</>}
                  </ShimmerButton>
                ) : (
                  <button
                    onClick={onConnect}
                    disabled={isConnecting}
                    className="w-full rounded-xl border border-dashed border-[#fbbf24]/20 bg-[#fbbf24]/[0.03] py-4 text-sm text-[#fbbf24]/60 hover:border-[#fbbf24]/30 hover:text-[#fbbf24]/80 active:scale-[0.99] transition-all disabled:opacity-50"
                  >
                    Connect wallet to return NFTs
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-white/[0.04] px-6 py-3 flex items-center justify-between">
            <p className="text-[10px] text-white/15">NFT Rental Platform &middot; Soroban</p>
            <div className="flex items-center gap-2">
              {["Available", "Rented"].map((s, i) => (
                <span key={s} className="flex items-center gap-1.5">
                  <span className={cn("h-1 w-1 rounded-full", i === 0 ? RENTAL_STATUS.available.dot : RENTAL_STATUS.rented.dot)} />
                  <span className="font-mono text-[9px] text-white/15">{s}</span>
                  {i < 1 && <span className="text-white/10 text-[8px]">&rarr;</span>}
                </span>
              ))}
            </div>
          </div>
        </AnimatedCard>
      </Spotlight>
    </div>
  );
}
