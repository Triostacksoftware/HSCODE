"use client";
import React, { useEffect, useState } from "react";
import { useHSCode } from "../../contexts/HSCodeContext";
import useCountryCode from "../../utilities/useCountryCode";

const LeadFormModal = ({
  isOpen,
  onClose,
  initial,
  onSubmit,
  sending,
  groupHSCode = "", // Add group HS code prop
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

  // HS Code autocomplete states
  const [showHSCodeDropdown, setShowHSCodeDropdown] = useState(false);
  const [hscodeSearchTerm, setHscodeSearchTerm] = useState("");
  const [selectedHSCode, setSelectedHSCode] = useState(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [userHSCodeInput, setUserHSCodeInput] = useState(""); // User's additional input after group HS code

  // Description autocomplete states
  const [showDescriptionDropdown, setShowDescriptionDropdown] = useState(false);
  const [descriptionSearchTerm, setDescriptionSearchTerm] = useState("");
  const [selectedDescription, setSelectedDescription] = useState(null);
  const [highlightedDescriptionIndex, setHighlightedDescriptionIndex] = useState(-1);
  const [descriptionSearchResults, setDescriptionSearchResults] = useState([]);

  // Get HS code context and country info
  const { hscodes, loading: hscodeLoading, searchHSCodes, loadHSCodes, hasData } = useHSCode();
  const { countryInfo } = useCountryCode();

  // Get max HS code length from the data or default to 8
  const maxHSLength = 8; // Default length, can be overridden by actual data

  // Validate HS code length
  const isHSCodeValid = () => {
    if (!groupHSCode) return true; // No group restriction
    return hscode.length === maxHSLength;
  };

  const getHSLengthMessage = () => {
    if (!groupHSCode) return null;
    const currentLength = hscode.length;
    const remaining = maxHSLength - currentLength;
    
    if (remaining > 0) {
      return `Add ${remaining} more digit${remaining !== 1 ? 's' : ''} to complete the HS code`;
    } else if (remaining === 0) {
      return `HS code complete (${currentLength}/${maxHSLength} digits)`;
    } else {
      return `HS code exceeds maximum length (${maxHSLength} digits)`;
    }
  };

  // Load HS codes when component mounts
  useEffect(() => {
    if (countryInfo?.code && !hasData) {
      loadHSCodes(countryInfo.code);
    }
  }, [countryInfo?.code, hasData, loadHSCodes]);

  // Initialize group HS code when component mounts
  useEffect(() => {
    if (groupHSCode && !hscode.startsWith(groupHSCode)) {
      setHscode(groupHSCode);
      setUserHSCodeInput("");
    }
  }, [groupHSCode]);

  // Search HS codes when user types
  const [hscodeSearchResults, setHscodeSearchResults] = useState([]);
  
  useEffect(() => {
    if (hscodeSearchTerm.trim()) {
      let results = [];
      
      // Check if input is numeric (starts with number)
      if (/^\d+$/.test(hscodeSearchTerm)) {
        // Numeric input: use starts-with search with group HS code prefix
        const searchPrefix = groupHSCode + hscodeSearchTerm;
        results = searchHSCodes(searchPrefix).filter(item => {
          const itemCode = item.tl || item.hs6 || item.chapter;
          return itemCode && itemCode.startsWith(searchPrefix);
        });
      } else {
        // Text input: search in descriptions (contains search)
        results = searchHSCodes(hscodeSearchTerm).filter(item => {
          const searchText = hscodeSearchTerm.toLowerCase();
          const description = (item.tldesc || item.hs6Description || item.chapterDescription || "").toLowerCase();
          return description.includes(searchText);
        });
      }
      
      setHscodeSearchResults(results);
      setShowHSCodeDropdown(results.length > 0);
      setHighlightedIndex(-1); // Reset highlighted index when search changes
    } else {
      setHscodeSearchResults([]);
      setShowHSCodeDropdown(false);
      setHighlightedIndex(-1);
    }
  }, [hscodeSearchTerm, searchHSCodes, groupHSCode]);

  // Search descriptions when user types
  useEffect(() => {
    if (descriptionSearchTerm.trim()) {
      let results = [];
      
      // Search in descriptions (contains search)
      results = searchHSCodes(descriptionSearchTerm).filter(item => {
        const searchText = descriptionSearchTerm.toLowerCase();
        const description = (item.tldesc || item.hs6Description || item.chapterDescription || "").toLowerCase();
        return description.includes(searchText);
      });
      
      setDescriptionSearchResults(results);
      setShowDescriptionDropdown(results.length > 0);
      setHighlightedDescriptionIndex(-1); // Reset highlighted index when search changes
    } else {
      setDescriptionSearchResults([]);
      setShowDescriptionDropdown(false);
      setHighlightedDescriptionIndex(-1);
    }
  }, [descriptionSearchTerm, searchHSCodes]);

  // Handle HS code selection
  const handleHSCodeSelect = (selectedCode) => {
    setSelectedHSCode(selectedCode);
    const selectedHSCodeValue = selectedCode.tl || selectedCode.hs6 || selectedCode.chapter;
    setHscode(selectedHSCodeValue);
    setDescription(selectedCode.tldesc || selectedCode.hs6Description || selectedCode.chapterDescription);
    
    // Extract user input part (remove group HS code prefix)
    if (groupHSCode && selectedHSCodeValue.startsWith(groupHSCode)) {
      const userInput = selectedHSCodeValue.substring(groupHSCode.length);
      setUserHSCodeInput(userInput);
      setHscodeSearchTerm(userInput);
    } else {
      setUserHSCodeInput("");
      setHscodeSearchTerm(selectedHSCodeValue);
    }
    
    setShowHSCodeDropdown(false);
    setHighlightedIndex(-1); // Reset highlighted index
  };

  // Handle description selection
  const handleDescriptionSelect = (selectedCode) => {
    setSelectedDescription(selectedCode);
    setDescription(selectedCode.tldesc || selectedCode.hs6Description || selectedCode.chapterDescription);
    setHscode(selectedCode.tl || selectedCode.hs6 || selectedCode.chapter);
    
    setShowDescriptionDropdown(false);
    setHighlightedDescriptionIndex(-1); // Reset highlighted index
  };

  // Handle HS code input change
  const handleHSCodeInputChange = (e) => {
    const value = e.target.value;
    
    // Check if input exceeds maximum length for the country
    if (value.length > maxHSLength) {
      return; // Don't allow input beyond country limit
    }
    
    // If group HS code exists, ensure the input starts with it
    if (groupHSCode) {
      if (!value.startsWith(groupHSCode)) {
        // If user tries to delete the group HS code, prevent it
        if (value.length < groupHSCode.length) {
          return;
        }
        // If user types something that doesn't start with group HS code, prepend it
        const userInput = value.substring(groupHSCode.length);
        setUserHSCodeInput(userInput);
        setHscode(value);
        setHscodeSearchTerm(userInput);
      } else {
        // Input starts with group HS code, extract user part
        const userInput = value.substring(groupHSCode.length);
        setUserHSCodeInput(userInput);
        setHscode(value);
        setHscodeSearchTerm(userInput);
      }
    } else {
      // No group HS code, use input as is
      setUserHSCodeInput(value);
      setHscode(value);
      setHscodeSearchTerm(value);
    }
    
    // Clear selection when user types
    setSelectedHSCode(null);
    setHighlightedIndex(-1);
  };

  // Handle description input change
  const handleDescriptionInputChange = (e) => {
    const value = e.target.value;
    setDescription(value);
    setDescriptionSearchTerm(value);
    
    // Clear selection when user types
    setSelectedDescription(null);
    setHighlightedDescriptionIndex(-1);
  };

  // Handle keyboard navigation for HS Code
  const handleHSCodeKeyDown = (e) => {
    if (!showHSCodeDropdown || hscodeSearchResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < hscodeSearchResults.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : hscodeSearchResults.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < hscodeSearchResults.length) {
          handleHSCodeSelect(hscodeSearchResults[highlightedIndex]);
        }
        break;
      case 'Escape':
        setShowHSCodeDropdown(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  // Handle keyboard navigation for Description
  const handleDescriptionKeyDown = (e) => {
    if (!showDescriptionDropdown || descriptionSearchResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedDescriptionIndex(prev => 
          prev < descriptionSearchResults.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedDescriptionIndex(prev => 
          prev > 0 ? prev - 1 : descriptionSearchResults.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedDescriptionIndex >= 0 && highlightedDescriptionIndex < descriptionSearchResults.length) {
          handleDescriptionSelect(descriptionSearchResults[highlightedDescriptionIndex]);
        }
        break;
      case 'Escape':
        setShowDescriptionDropdown(false);
        setHighlightedDescriptionIndex(-1);
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showHSCodeDropdown && !event.target.closest('.hs-code-container')) {
        setShowHSCodeDropdown(false);
      }
      if (showDescriptionDropdown && !event.target.closest('.description-container')) {
        setShowDescriptionDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showHSCodeDropdown, showDescriptionDropdown]);

  useEffect(() => {
    if (!isOpen) {
      setDocuments([]);
      // Reset HS code autocomplete states when modal closes
      setSelectedHSCode(null);
      setHscodeSearchTerm("");
      setShowHSCodeDropdown(false);
      setHighlightedIndex(-1);
      // Reset description autocomplete states when modal closes
      setSelectedDescription(null);
      setDescriptionSearchTerm("");
      setShowDescriptionDropdown(false);
      setHighlightedDescriptionIndex(-1);
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
    
         // Reset HS code autocomplete states
     setSelectedHSCode(null);
     setHscodeSearchTerm("");
     setShowHSCodeDropdown(false);
     setHighlightedIndex(-1);
     
     // Reset description autocomplete states
     setSelectedDescription(null);
     setDescriptionSearchTerm("");
     setShowDescriptionDropdown(false);
     setHighlightedDescriptionIndex(-1);
    
         // Handle HS code initialization
     if (initial?.hscode && groupHSCode) {
       if (initial.hscode.startsWith(groupHSCode)) {
         const userInput = initial.hscode.substring(groupHSCode.length);
         setUserHSCodeInput(userInput);
         setHscode(initial.hscode); // Set the complete HS code
       } else {
         setUserHSCodeInput("");
         setHscode(groupHSCode); // Set just the group HS code
       }
     } else if (groupHSCode) {
       setUserHSCodeInput("");
       setHscode(groupHSCode); // Set just the group HS code
     } else {
       setUserHSCodeInput("");
       setHscode(initial?.hscode || "");
     }
  }, [initial, isOpen, groupHSCode]);

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
    
    // Validate HS code length if group HS code is provided
    if (groupHSCode && !isHSCodeValid()) {
      alert(`Please complete the HS code. Current length: ${hscode.length}/${maxHSLength} digits`);
      return;
    }
    
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
            <div className="md:col-span-1 relative hs-code-container">
              <label className="text-[.8em] font-medium">HS Code<span className="text-red-500">*</span></label>
              
              {/* Instructions */}
              {groupHSCode && (
                <p className="text-[11px] text-blue-600 mt-1 mb-2">
                  💡 Type additional digits after the group HS code. You can also search by product description (e.g., "rice").
                </p>
              )}
              
              {/* Group HS Code Display (Fixed) */}
              {groupHSCode && (
                <div className="mt-1 mb-2">
                  <div className="text-xs text-gray-500 mb-1">Group HS Code (Fixed):</div>
                  <div className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-700">
                    {groupHSCode}
                  </div>
                </div>
              )}
              
              {/* User Input Field */}
              <div className="relative">
                {groupHSCode && (
                  <div className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 font-mono text-sm">
                    {groupHSCode}
                  </div>
                )}
                                 <input 
                   className={`mt-1 w-full border border-gray-200 p-2 outline-none focus:ring-1 focus:ring-gray-700 rounded text-sm ${
                     groupHSCode ? 'pl-16' : ''
                   }`}
                   placeholder={groupHSCode ? "Type additional digits after 1010" : "e.g. 10101000"} 
                   value={hscode} 
                   onChange={handleHSCodeInputChange}
                   onKeyDown={handleHSCodeKeyDown}
                   onFocus={() => {
                     if (hscodeSearchTerm.trim()) {
                       setShowHSCodeDropdown(true);
                     }
                   }}
                   maxLength={maxHSLength}
                   required 
                 />
              </div>
              
              <p className="text-[11px] text-gray-500 mt-1">
                {groupHSCode ? 
                  `Complete HS Code: ${hscode} (${hscode.length}/${maxHSLength} digits)` :
                  'HS code helps categorize your product.'
                }
              </p>
              
              {/* HS Code Length Validation Message */}
              {groupHSCode && getHSLengthMessage() && (
                <p className={`text-[11px] mt-1 ${
                  isHSCodeValid() ? 'text-green-600' : 'text-orange-500'
                }`}>
                  {getHSLengthMessage()}
                </p>
              )}
              {hscodeLoading && !hasData && (
                <p className="text-[11px] text-blue-500 mt-1">Loading HS codes for your country...</p>
              )}
              {!hscodeLoading && !hasData && countryInfo?.code && (
                <p className="text-[11px] text-orange-500 mt-1">HS codes not available for {countryInfo.code}</p>
              )}
              
                             {/* HS Code Dropdown */}
               {showHSCodeDropdown && hscodeSearchResults.length > 0 && (
                 <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                   <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-700">
                     {hscodeSearchResults.length} result{hscodeSearchResults.length !== 1 ? 's' : ''} found
                   </div>
                   {hscodeSearchResults.map((item, index) => (
                     <div
                       key={item.id}
                       className={`px-3 py-2 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                         index === highlightedIndex 
                           ? 'bg-blue-100 border-blue-300' 
                           : 'hover:bg-gray-100'
                       }`}
                       onClick={() => handleHSCodeSelect(item)}
                     >
                       <div className="flex items-center justify-between">
                         <div className="flex-1">
                           <div className="font-medium text-sm text-gray-900">
                             {item.tl || item.hs6 || item.chapter}
                           </div>
                           <div className="text-xs text-gray-600 truncate">
                             {item.tldesc || item.hs6Description || item.chapterDescription}
                           </div>
                         </div>
                         {groupHSCode && (
                           <div className="text-xs text-gray-500 ml-2">
                             <span className="text-gray-400">{groupHSCode}</span>
                             <span className="text-gray-600">
                               {item.tl ? item.tl.substring(groupHSCode.length) : ''}
                             </span>
                           </div>
                         )}
                       </div>
                     </div>
                   ))}
                 </div>
               )}

              {/* Loading indicator */}
              {hscodeLoading && hscodeSearchTerm && (
                <div className="absolute right-2 top-8 text-gray-400">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                </div>
              )}
            </div>
                         <div className="md:col-span-2 relative description-container">
               <label className="text-[.8em] font-medium">Product / Item Description<span className="text-red-500">*</span></label>
               <textarea 
                 className="mt-1 w-full border border-gray-200 p-2 outline-none focus:ring-1 focus:ring-gray-700 rounded text-sm" 
                 rows={2} 
                 placeholder="Type to search for product descriptions or enter your own" 
                 value={description} 
                 onChange={handleDescriptionInputChange}
                 onKeyDown={handleDescriptionKeyDown}
                 onFocus={() => {
                   if (descriptionSearchTerm.trim()) {
                     setShowDescriptionDropdown(true);
                   }
                 }}
                 required 
               />
               
               {/* Description Search Dropdown */}
               {showDescriptionDropdown && descriptionSearchResults.length > 0 && (
                 <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                   <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-700">
                     {descriptionSearchResults.length} result{descriptionSearchResults.length !== 1 ? 's' : ''} found
                   </div>
                   {descriptionSearchResults.map((item, index) => (
                     <div
                       key={item.id}
                       className={`px-3 py-2 cursor-pointer border-b border-gray-100 last:border-b-0 ${
                         index === highlightedDescriptionIndex 
                           ? 'bg-blue-100 border-blue-300' 
                           : 'hover:bg-gray-100'
                       }`}
                       onClick={() => handleDescriptionSelect(item)}
                     >
                       <div className="flex items-center justify-between">
                         <div className="flex-1">
                           <div className="font-medium text-sm text-gray-900">
                             {item.tldesc || item.hs6Description || item.chapterDescription}
                           </div>
                           <div className="text-xs text-gray-600 truncate">
                             HS Code: {item.tl || item.hs6 || item.chapter}
                           </div>
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
               )}
               
               {/* Loading indicator for description search */}
               {hscodeLoading && descriptionSearchTerm && (
                 <div className="absolute right-2 top-8 text-gray-400">
                   <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                 </div>
               )}
             </div>
          </div>

          {/* HS Code Additional Information */}
          {selectedHSCode && (
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <div className="text-xs font-medium text-gray-700 mb-2">HS Code Details:</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="font-medium text-gray-600">Original HS6: </span>
                  <span className="text-gray-800">{selectedHSCode.hs6 || 'N/A'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">HS4 Group: </span>
                  <span className="text-gray-800">{selectedHSCode.hs4 || 'N/A'}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Chapter: </span>
                  <span className="text-gray-800">{selectedHSCode.chapter || 'N/A'}</span>
                </div>
                {selectedHSCode.hs4Description && (
                  <div className="md:col-span-3">
                    <span className="font-medium text-gray-600">Group Description: </span>
                    <span className="text-gray-800">{selectedHSCode.hs4Description}</span>
                  </div>
                )}
                {selectedHSCode.hs6Description && (
                  <div className="md:col-span-3">
                    <span className="font-medium text-gray-600">HS6 Description: </span>
                    <span className="text-gray-800">{selectedHSCode.hs6Description}</span>
                  </div>
                )}
              </div>
            </div>
          )}

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


