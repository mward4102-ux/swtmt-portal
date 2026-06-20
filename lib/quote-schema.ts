// Field schemas for the quote intake (BUILD_SPEC §8). The wizard renders these
// generically, so adding a field is a one-line change here.

import type { QuoteLineType } from "./types";

export type FieldType = "text" | "date" | "select" | "textarea" | "multiselect" | "array";

export interface FieldDef {
  key: string;
  label: string;
  type?: FieldType;
  options?: string[];
  itemFields?: { key: string; label: string; type?: FieldType }[];
  placeholder?: string;
  full?: boolean;
}

export const LINE_SCHEMA: Record<QuoteLineType, FieldDef[]> = {
  personal_auto: [
    {
      key: "drivers", label: "Drivers", type: "array",
      itemFields: [
        { key: "name", label: "Full name" },
        { key: "dob", label: "Date of birth", type: "date" },
        { key: "license_number", label: "License #" },
      ],
    },
    {
      key: "vehicles", label: "Vehicles", type: "array",
      itemFields: [
        { key: "year", label: "Year" },
        { key: "make", label: "Make" },
        { key: "model", label: "Model" },
        { key: "vin", label: "VIN" },
        { key: "use", label: "Primary use" },
      ],
    },
    { key: "current_carrier", label: "Current carrier", type: "text" },
    { key: "current_expiry", label: "Current policy expires", type: "date" },
    { key: "desired_bi_limit", label: "Desired bodily injury limit", type: "select", options: ["$50,000 / $100,000", "$100,000 / $300,000", "$250,000 / $500,000", "$500,000 / $500,000"] },
    { key: "desired_pd_limit", label: "Desired property damage limit", type: "select", options: ["$50,000", "$100,000", "$250,000"] },
    { key: "desired_comp_deductible", label: "Comprehensive deductible", type: "select", options: ["$250", "$500", "$1,000"] },
    { key: "desired_coll_deductible", label: "Collision deductible", type: "select", options: ["$250", "$500", "$1,000"] },
  ],
  homeowners: [
    { key: "property_address", label: "Property address", type: "text", full: true },
    { key: "year_built", label: "Year built", type: "text" },
    { key: "construction", label: "Construction", type: "select", options: ["Frame", "Masonry", "Masonry Veneer", "Other"] },
    { key: "sq_ft", label: "Square feet", type: "text" },
    { key: "roof_age", label: "Roof age / last reroof", type: "text" },
    { key: "current_cov_a", label: "Current Coverage A", type: "text" },
    { key: "mortgagee", label: "Mortgagee", type: "text", full: true },
    { key: "prior_claims", label: "Prior claims (last 5 years)", type: "text", full: true },
    { key: "current_carrier", label: "Current carrier", type: "text" },
  ],
  commercial: [
    { key: "business_name", label: "Business name", type: "text", full: true },
    { key: "entity_type", label: "Entity type", type: "select", options: ["Sole Proprietor", "LLC", "Limited Liability Company", "S-Corp", "C-Corp", "Partnership"] },
    { key: "description", label: "Industry / operations", type: "text", full: true },
    { key: "revenue", label: "Annual revenue", type: "text" },
    { key: "payroll", label: "Annual payroll", type: "text" },
    { key: "employees", label: "Number of employees", type: "text" },
    { key: "lines_wanted", label: "Lines wanted", type: "multiselect", options: ["General Liability", "Commercial Auto", "Workers Comp", "Umbrella", "Property"] },
  ],
  life_health: [
    { key: "type", label: "Coverage type", type: "select", options: ["Term life", "Whole life", "Medicare Supplement", "Dental", "Vision"] },
    { key: "dob", label: "Date of birth", type: "date" },
    { key: "tobacco", label: "Tobacco use", type: "select", options: ["No", "Yes"] },
    { key: "coverage_amount", label: "Coverage amount / plan of interest", type: "text", full: true },
  ],
};
