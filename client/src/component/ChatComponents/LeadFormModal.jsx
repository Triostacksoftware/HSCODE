"use client";
import React, { useEffect, useState } from "react";

const LeadFormModal = ({
  isOpen,
  onClose,
  initial,
  onSubmit,
  sending,
}) => {
  const [leadType, setLeadType] = useState(initial?.type || "buy");
  const [hscode, setHscode] = useState(initial?.hscode || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [quantity, setQuantity] = useState(initial?.quantity || "");
  const [packing, setPacking] = useState(initial?.packing || "");
  const [targetPrice, setTargetPrice] = useState(initial?.targetPrice || "");
  const [negotiable, setNegotiable] = useState(Boolean(initial?.negotiable));
  const [buyerDeliveryAddress, setBuyerDeliveryAddress] = useState(initial?.buyerDeliveryLocation?.address || "");
  const [buyerLat, setBuyerLat] = useState(initial?.buyerDeliveryLocation?.geo?.coordinates?.[1] || "");
  const [buyerLng, setBuyerLng] = useState(initial?.buyerDeliveryLocation?.geo?.coordinates?.[0] || "");
  const [sellerPickupAddress, setSellerPickupAddress] = useState(initial?.sellerPickupLocation?.address || "");
  const [sellerLat, setSellerLat] = useState(initial?.sellerPickupLocation?.geo?.coordinates?.[1] || "");
  const [sellerLng, setSellerLng] = useState(initial?.sellerPickupLocation?.geo?.coordinates?.[0] || "");
  const [specialRequest, setSpecialRequest] = useState(initial?.specialRequest || "");
  const [remarks, setRemarks] = useState(initial?.remarks || "");
  const [documents, setDocuments] = useState([]);
  const [retainDocuments, setRetainDocuments] = useState(initial?.documents || []);

  useEffect(() => {
    if (!isOpen) {
      setDocuments([]);
    }
  }, [isOpen]);

  // Sync form state when a different lead is opened or when the modal opens
  useEffect(() => {
    if (!isOpen) return;
    setLeadType(initial?.type || "buy");
    setHscode(initial?.hscode || "");
    setDescription(initial?.description || "");
    setQuantity(initial?.quantity || "");
    setPacking(initial?.packing || "");
    setTargetPrice(initial?.targetPrice || "");
    setNegotiable(Boolean(initial?.negotiable));
    setBuyerDeliveryAddress(initial?.buyerDeliveryLocation?.address || "");
    setBuyerLat(initial?.buyerDeliveryLocation?.geo?.coordinates?.[1] || "");
    setBuyerLng(initial?.buyerDeliveryLocation?.geo?.coordinates?.[0] || "");
    setSellerPickupAddress(initial?.sellerPickupLocation?.address || "");
    setSellerLat(initial?.sellerPickupLocation?.geo?.coordinates?.[1] || "");
    setSellerLng(initial?.sellerPickupLocation?.geo?.coordinates?.[0] || "");
    setSpecialRequest(initial?.specialRequest || "");
    setRemarks(initial?.remarks || "");
    setRetainDocuments(initial?.documents || []);
  }, [initial, isOpen]);

  const appendDocuments = (fileList) => {
    const incoming = Array.from(fileList || []);
    setDocuments((prev) => {
      const dedupeMap = new Map((prev || []).map((f) => [`${f.name}-${f.size}-${f.lastModified}`, f]));
      incoming.forEach((f) => dedupeMap.set(`${f.name}-${f.size}-${f.lastModified}`, f));
      return Array.from(dedupeMap.values());
    });
  };

  const removeRetained = (idx) => {
    setRetainDocuments((prev) => prev.filter((_, i) => i !== idx));
  };

  const submitHandler = (e) => {
    e.preventDefault();
    onSubmit({
      leadType,
      hscode,
      description,
      quantity,
      packing,
      targetPrice,
      negotiable,
      buyerDeliveryAddress,
      buyerLat,
      buyerLng,
      sellerPickupAddress,
      sellerLat,
      sellerLng,
      specialRequest,
      remarks,
      documents,
      retainDocuments,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/50 animate-fade-in-overlay" onClick={onClose} />
      <div className="relative bg-white w-full md:w-[900px] h-1/2 md:h-auto rounded-t-xl md:rounded animate-slide-up-modal">
        <div className="flex items-center justify-between px-8 py-4 border-b border-gray-200">
          <div className="font-semibold text-xl">{initial ? "Edit & Resend Lead" : "Create Lead"}</div>
          <button className="text-sm text-gray-600" onClick={onClose}>Close</button>
        </div>
        <form onSubmit={submitHandler} className="p-4 px-8 space-y-3 text-gray-600 text-sm">
          {/* Type toggle */}
          <div>
            <div className="text-xs text-gray-500 mb-1">Select lead type</div>
            <div className="inline-flex rounded border border-gray-300 overflow-hidden">
              <button type="button" onClick={()=>setLeadType("buy")} className={`px-4 py-1.5 text-sm ${leadType==='buy' ? 'bg-sky-500 text-white' : 'bg-white text-gray-700'}`}>Buy</button>
              <button type="button" onClick={()=>setLeadType("sell")} className={`px-4 py-1.5 text-sm border-l border-gray-300 ${leadType==='sell' ? 'bg-green-500 text-white' : 'bg-white text-gray-700'}`}>Sell</button>
            </div>
          </div>

          {/* HS + Description */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-1">
              <label className="text-[.8em] font-medium">HS Code<span className="text-red-500">*</span></label>
              <input className="mt-1 w-full border border-gray-200 p-2 outline-none focus:ring-1 focus:ring-gray-700 rounded text-sm" placeholder="e.g. 7099900" value={hscode} onChange={(e)=>setHscode(e.target.value)} required />
              <p className="text-[11px] text-gray-500 mt-1">HS code helps categorize your product.</p>
            </div>
            <div className="md:col-span-2">
              <label className="text-[.8em] font-medium">Product / Item Description<span className="text-red-500">*</span></label>
              <textarea className="mt-1 w-full border border-gray-200 p-2 outline-none focus:ring-1 focus:ring-gray-700 rounded text-sm" rows={2} placeholder="Brief details" value={description} onChange={(e)=>setDescription(e.target.value)} required />
            </div>
          </div>

          {/* Qty, packing, price */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="text-[.8em] font-medium">Quantity<span className="text-red-500">*</span></label>
              <input className="mt-1 w-full border border-gray-200 p-2 outline-none focus:ring-1 focus:ring-gray-700 rounded text-sm" value={quantity} onChange={(e)=>setQuantity(e.target.value)} required />
            </div>
            <div>
              <label className="text-[.8em] font-medium">Packing<span className="text-red-500">*</span></label>
              <input className="mt-1 w-full border border-gray-200 p-2 outline-none focus:ring-1 focus:ring-gray-700 rounded text-sm" value={packing} onChange={(e)=>setPacking(e.target.value)} required />
            </div>
            <div>
              <label className="text-[.8em] font-medium">Target / Expected Price<span className="text-red-500">*</span></label>
              <input className="mt-1 w-full border border-gray-200 p-2 outline-none focus:ring-1 focus:ring-gray-700 rounded text-sm" value={targetPrice} onChange={(e)=>setTargetPrice(e.target.value)} required />
            </div>
            <div className="">
              <label className="text-[.8em] font-medium">Price Negotiable</label>
              <label className="mt-1 inline-flex border-gray-200 items-center gap-2 text-sm w-full border rounded p-2 justify-center cursor-pointer select-none">
                <input type="checkbox" checked={negotiable} onChange={(e)=>setNegotiable(e.target.checked)} />
                Negotiable
              </label>
            </div>
          </div>

          {/* Address */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {leadType === 'buy' ? (
              <div className="md:col-span-2">
                <label className="text-[.8em] font-medium">Delivery address<span className="text-red-500">*</span></label>
                <input className="mt-1 w-full border border-gray-200 p-2 outline-none focus:ring-1 focus:ring-gray-700 rounded text-sm" value={buyerDeliveryAddress} onChange={(e)=>setBuyerDeliveryAddress(e.target.value)} required/>
              </div>
            ) : (
              <div className="md:col-span-2">
                <label className="text-[.8em] font-medium">Pickup address <span className="text-red-500">*</span></label>
                <input className="mt-1 w-full border border-gray-200 p-2 outline-none focus:ring-1 focus:ring-gray-700 rounded text-sm" value={sellerPickupAddress} onChange={(e)=>setSellerPickupAddress(e.target.value)} required/>
              </div>
            )}
          </div>

          {/* Requests + Remarks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-[.8em] font-medium">Any special request</label>
              <textarea className="mt-1 w-full border border-gray-200 p-2 outline-none focus:ring-1 focus:ring-gray-700 rounded text-sm" rows={2} value={specialRequest} onChange={(e)=>setSpecialRequest(e.target.value)} />
            </div>
            <div>
              <label className="text-[.8em] font-medium">Remarks / Notes</label>
              <textarea className="mt-1 w-full border border-gray-200 p-2 outline-none focus:ring-1 focus:ring-gray-700 rounded text-sm" rows={2} value={remarks} onChange={(e)=>setRemarks(e.target.value)} />
            </div>
          </div>

          {/* Documents */}
          <div>
            <label className="text-[.8em] font-medium">Documents</label>
            <div className="mt-1 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-1">
                <input key={documents.length} type="file" multiple accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt" onChange={(e)=> appendDocuments(e.target.files)} className="w-fit border border-gray-200 p-2 outline-none focus:ring-1 focus:ring-gray-700 file:bg-gray-600 file:text-white file:px-2 file:rounded-md file:py-1 rounded text-sm" />
                {!!retainDocuments?.length && (
                  <p className="text-[11px] text-gray-500 mt-2">Existing files listed below will be kept unless you remove them.</p>
                )}
              </div>
              <div className="border border-gray-200 rounded p-2 max-h-28 overflow-auto text-xs grid grid-cols-4 gap-2 md:col-span-2">
                {retainDocuments?.map((name, idx) => (
                  <div key={`r-${idx}`} className="border border-gray-300 rounded p-1 flex items-center justify-between gap-2">
                    <span className="truncate" title={name}>{name}</span>
                    <button type="button" className="text-red-600" onClick={()=>removeRetained(idx)}>×</button>
                  </div>
                ))}
                {documents?.map((file, idx) => (
                  <div key={`n-${idx}`} className="border border-gray-300 rounded p-1 flex items-center justify-between gap-2">
                    <span className="truncate" title={file.name}>{file.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={sending} className="px-4 py-2 bg-gray-900 text-white rounded-lg disabled:opacity-50">{sending? 'Submitting...' : (initial? 'Resend for approval' : 'Submit for approval')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeadFormModal;


