"use client";
import React, { useState, useEffect } from "react";
import { LiaSearchSolid } from "react-icons/lia";

const SectionsList = ({ onSectionSelect, selectedSection }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  // Simple test data
  useEffect(() => {
    // Complete HS Code Sections with all chapters
    const completeSections = [
      {
        sectionNumber: "I",
        title: "Live Animals; Animal Products",
        chapters: [
          { chapterNumber: "01", chapterName: "Live Animals" },
          { chapterNumber: "02", chapterName: "Meat And Edible Meat Offal" },
          {
            chapterNumber: "03",
            chapterName: "Fish; Crustaceans & Aquatic Invertebrates",
          },
          {
            chapterNumber: "04",
            chapterName: "Dairy Products; Birds Eggs; Honey",
          },
          { chapterNumber: "05", chapterName: "Products Of Animal Origin" },
        ],
      },
      {
        sectionNumber: "II",
        title: "Vegetable Products",
        chapters: [
          {
            chapterNumber: "06",
            chapterName: "Live Trees; Plants; Bulbs; Cut Flowers",
          },
          { chapterNumber: "07", chapterName: "Edible Vegetables And Roots" },
          { chapterNumber: "08", chapterName: "Edible Fruit And Nuts" },
          { chapterNumber: "09", chapterName: "Coffee; Tea; Mate And Spices" },
          { chapterNumber: "10", chapterName: "Cereals" },
          {
            chapterNumber: "11",
            chapterName: "Milling Products; Malt; Starch",
          },
          { chapterNumber: "12", chapterName: "Oil Seeds; Misc Grain; Seeds" },
          {
            chapterNumber: "13",
            chapterName: "Lac; Gums; Resins; Vegetable Saps",
          },
          { chapterNumber: "14", chapterName: "Vegetable Plaiting Materials" },
        ],
      },
      {
        sectionNumber: "III",
        title: "Animal or Vegetable Fats and Oils",
        chapters: [
          {
            chapterNumber: "15",
            chapterName: "Animal Or Vegetable Fats; Oils; Waxes",
          },
        ],
      },
      {
        sectionNumber: "IV",
        title: "Prepared Foodstuffs; Beverages; Tobacco",
        chapters: [
          {
            chapterNumber: "16",
            chapterName: "Prepared Meat; Fish; Crustaceans",
          },
          {
            chapterNumber: "17",
            chapterName: "Sugars And Sugar Confectionery",
          },
          { chapterNumber: "18", chapterName: "Cocoa And Cocoa Preparations" },
          {
            chapterNumber: "19",
            chapterName: "Cereal Preparations; Bakers' Wares",
          },
          { chapterNumber: "20", chapterName: "Vegetable Preparations" },
          {
            chapterNumber: "21",
            chapterName: "Miscellaneous Edible Preparations",
          },
          {
            chapterNumber: "22",
            chapterName: "Beverages; Spirits And Vinegar",
          },
          {
            chapterNumber: "23",
            chapterName: "Food Industry Residues; Animal Feed",
          },
          {
            chapterNumber: "24",
            chapterName: "Tobacco And Manufactured Tobacco",
          },
        ],
      },
      {
        sectionNumber: "V",
        title: "Mineral Products",
        chapters: [
          {
            chapterNumber: "25",
            chapterName: "Salt; Sulfur; Earth & Stone; Lime & Cement",
          },
          { chapterNumber: "26", chapterName: "Ores; Slag And Ash" },
          {
            chapterNumber: "27",
            chapterName: "Mineral Fuel; Oil; Bituminous Substances",
          },
        ],
      },
      {
        sectionNumber: "VI",
        title: "Products of the Chemical or Allied Industries",
        chapters: [
          {
            chapterNumber: "28",
            chapterName: "Inorganic Chemicals; Compounds",
          },
          { chapterNumber: "29", chapterName: "Organic Chemicals" },
          { chapterNumber: "30", chapterName: "Pharmaceutical Products" },
          { chapterNumber: "31", chapterName: "Fertilizers" },
          {
            chapterNumber: "32",
            chapterName: "Tanning Extracts; Dyes; Paints",
          },
          {
            chapterNumber: "33",
            chapterName: "Essential Oils; Perfumery; Cosmetics",
          },
          { chapterNumber: "34", chapterName: "Soap; Waxes; Polishes" },
          {
            chapterNumber: "35",
            chapterName: "Albuminoidal Substances; Glues",
          },
          { chapterNumber: "36", chapterName: "Explosives; Pyrotechnics" },
          {
            chapterNumber: "37",
            chapterName: "Photographic Or Cinematographic Goods",
          },
          {
            chapterNumber: "38",
            chapterName: "Miscellaneous Chemical Products",
          },
        ],
      },
      {
        sectionNumber: "VII",
        title: "Plastics and Rubber and Articles Thereof",
        chapters: [
          { chapterNumber: "39", chapterName: "Plastics And Articles Thereof" },
          { chapterNumber: "40", chapterName: "Rubber And Articles Thereof" },
        ],
      },
      {
        sectionNumber: "VIII",
        title: "Raw Hides and Skins, Leather, Furskins and Articles Thereof",
        chapters: [
          { chapterNumber: "41", chapterName: "Raw Hides And Skins; Leather" },
          { chapterNumber: "42", chapterName: "Articles Of Leather; Saddlery" },
          { chapterNumber: "43", chapterName: "Furskins And Artificial Fur" },
        ],
      },
      {
        sectionNumber: "IX",
        title: "Wood and Articles of Wood; Wood Charcoal",
        chapters: [
          { chapterNumber: "44", chapterName: "Wood And Articles Of Wood" },
          { chapterNumber: "45", chapterName: "Cork And Articles Of Cork" },
          {
            chapterNumber: "46",
            chapterName: "Manufactures Of Straw; Basketware",
          },
        ],
      },
      {
        sectionNumber: "X",
        title: "Pulp of Wood or of Other Fibrous Cellulosic Material",
        chapters: [
          { chapterNumber: "47", chapterName: "Pulp Of Wood; Waste Paper" },
          { chapterNumber: "48", chapterName: "Paper; Paperboard; Articles" },
          { chapterNumber: "49", chapterName: "Printed Books; Newspapers" },
        ],
      },
      {
        sectionNumber: "XI",
        title: "Textiles and Textile Articles",
        chapters: [
          { chapterNumber: "50", chapterName: "Silk" },
          {
            chapterNumber: "51",
            chapterName: "Wool; Fine Or Coarse Animal Hair",
          },
          { chapterNumber: "52", chapterName: "Cotton" },
          {
            chapterNumber: "53",
            chapterName: "Other Vegetable Textile Fibres",
          },
          { chapterNumber: "54", chapterName: "Man-Made Filaments" },
          { chapterNumber: "55", chapterName: "Man-Made Staple Fibres" },
          { chapterNumber: "56", chapterName: "Wadding; Felt; Nonwovens" },
          {
            chapterNumber: "57",
            chapterName: "Carpets And Other Textile Floor Coverings",
          },
          { chapterNumber: "58", chapterName: "Special Woven Fabrics; Lace" },
          {
            chapterNumber: "59",
            chapterName: "Impregnated; Coated Textile Fabrics",
          },
          { chapterNumber: "60", chapterName: "Knitted Or Crocheted Fabrics" },
          { chapterNumber: "61", chapterName: "Articles Of Apparel; Knitted" },
          {
            chapterNumber: "62",
            chapterName: "Articles Of Apparel; Not Knitted",
          },
          {
            chapterNumber: "63",
            chapterName: "Other Made Up Textile Articles",
          },
        ],
      },
      {
        sectionNumber: "XII",
        title: "Footwear, Headgear, Umbrellas, Walking Sticks",
        chapters: [
          {
            chapterNumber: "64",
            chapterName: "Footwear; Gaiters And The Like",
          },
          { chapterNumber: "65", chapterName: "Headgear And Parts Thereof" },
          {
            chapterNumber: "66",
            chapterName: "Umbrellas; Walking Sticks; Whips",
          },
          {
            chapterNumber: "67",
            chapterName: "Prepared Feathers; Artificial Flowers",
          },
        ],
      },
      {
        sectionNumber: "XIII",
        title: "Articles of Stone, Plaster, Cement, Asbestos, Mica",
        chapters: [
          {
            chapterNumber: "68",
            chapterName: "Articles Of Stone; Plaster; Cement",
          },
          { chapterNumber: "69", chapterName: "Ceramic Products" },
          { chapterNumber: "70", chapterName: "Glass And Glassware" },
        ],
      },
      {
        sectionNumber: "XIV",
        title: "Natural or Cultured Pearls, Precious or Semi-Precious Stones",
        chapters: [
          {
            chapterNumber: "71",
            chapterName: "Natural Or Cultured Pearls; Precious Stones",
          },
        ],
      },
      {
        sectionNumber: "XV",
        title: "Base Metals and Articles of Base Metal",
        chapters: [
          { chapterNumber: "72", chapterName: "Iron And Steel" },
          { chapterNumber: "73", chapterName: "Articles Of Iron Or Steel" },
          { chapterNumber: "74", chapterName: "Copper And Articles Thereof" },
          { chapterNumber: "75", chapterName: "Nickel And Articles Thereof" },
          {
            chapterNumber: "76",
            chapterName: "Aluminium And Articles Thereof",
          },
          { chapterNumber: "77", chapterName: "Magnesium; Beryllium; Cadmium" },
          { chapterNumber: "78", chapterName: "Lead And Articles Thereof" },
          { chapterNumber: "79", chapterName: "Zinc And Articles Thereof" },
          { chapterNumber: "80", chapterName: "Tin And Articles Thereof" },
          { chapterNumber: "81", chapterName: "Other Base Metals; Cermets" },
          { chapterNumber: "82", chapterName: "Tools; Implements; Cutlery" },
          {
            chapterNumber: "83",
            chapterName: "Miscellaneous Articles Of Base Metal",
          },
        ],
      },
      {
        sectionNumber: "XVI",
        title: "Machinery and Mechanical Appliances; Electrical Equipment",
        chapters: [
          {
            chapterNumber: "84",
            chapterName: "Nuclear Reactors; Boilers; Machinery",
          },
          {
            chapterNumber: "85",
            chapterName: "Electrical Machinery And Equipment",
          },
        ],
      },
      {
        sectionNumber: "XVII",
        title: "Vehicles, Aircraft, Vessels and Associated Transport Equipment",
        chapters: [
          {
            chapterNumber: "86",
            chapterName: "Railway Or Tramway Locomotives; Rolling Stock",
          },
          {
            chapterNumber: "87",
            chapterName: "Vehicles Other Than Railway Rolling Stock",
          },
          {
            chapterNumber: "88",
            chapterName: "Aircraft; Spacecraft; Parts Thereof",
          },
          {
            chapterNumber: "89",
            chapterName: "Ships; Boats And Floating Structures",
          },
        ],
      },
      {
        sectionNumber: "XVIII",
        title: "Optical, Photographic, Cinematographic, Measuring, Checking",
        chapters: [
          {
            chapterNumber: "90",
            chapterName: "Optical; Photographic; Cinematographic Instruments",
          },
          {
            chapterNumber: "91",
            chapterName: "Clocks And Watches And Parts Thereof",
          },
          {
            chapterNumber: "92",
            chapterName: "Musical Instruments; Parts And Accessories",
          },
        ],
      },
      {
        sectionNumber: "XIX",
        title: "Arms and Ammunition; Parts and Accessories Thereof",
        chapters: [
          {
            chapterNumber: "93",
            chapterName: "Arms And Ammunition; Parts Thereof",
          },
        ],
      },
      {
        sectionNumber: "XX",
        title: "Miscellaneous Manufactured Articles",
        chapters: [
          {
            chapterNumber: "94",
            chapterName: "Furniture; Bedding; Mattresses",
          },
          {
            chapterNumber: "95",
            chapterName: "Toys; Games And Sports Requisites",
          },
          {
            chapterNumber: "96",
            chapterName: "Miscellaneous Manufactured Articles",
          },
        ],
      },
    ];

    setSections(completeSections);
    setLoading(false);
  }, []);

  const handleSectionSelect = (section) => {
    if (onSectionSelect) {
      onSectionSelect(section);
    }
  };

  const filteredSections = sections.filter(
    (section) =>
      section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.sectionNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full px-3">
      {/* Search Bar */}
      <div className="flex-shrink-0 flex items-center gap-3 p-2 py-[.35em] border border-gray-200 rounded-md text-gray-600 mb-4">
        <LiaSearchSolid />
        <input
          type="text"
          placeholder="Search sections..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="text-[.88em] w-full outline-none placeholder:text-gray-500"
        />
      </div>

      {/* Sections List */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2 text-sm">Loading sections...</p>
          </div>
        ) : filteredSections.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">No sections found</p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredSections.map((section) => (
              <div
                key={section.sectionNumber}
                className={`section-item p-3 rounded cursor-pointer transition-all ${
                  selectedSection?.sectionNumber === section.sectionNumber
                    ? "bg-[#eaeaea] text-gray-800"
                    : "bg-white hover:bg-[#f4f4f4] text-gray-600"
                }`}
                onClick={() => handleSectionSelect(section)}
              >
                <div className="text-sm font-medium">
                  Section {section.sectionNumber}
                </div>
                <div className="text-[.7em] text-gray-400 font-medium">
                  {section.title}
                </div>
                <div className="text-[.6em] text-gray-300 mt-1">
                  {section.chapters.length} chapters
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SectionsList;
