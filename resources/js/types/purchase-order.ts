export type PurchaseOrderStatus = 'open' | 'invoiced' | 'paid';
export type PurchaseOrderSource = 'manual' | 'import';

export type PurchaseOrderLabourLine = {
    id?: number;
    line_no: number;
    description: string;
    hsn_sac: string | null;
    quantity: string;
    unit: string;
    rate: string;
    freight_and_insurance: string;
    amount: string;
    master_labour_id: number | null;
    master_description?: string | null;
    in_master?: boolean;
};

export type PurchaseOrderListItem = {
    id: number;
    po_number: string;
    po_date: string;
    order_type: number;
    ccc: string;
    description: string;
    po_amount: string;
    source: PurchaseOrderSource;
    memo_number: string | null;
    status: PurchaseOrderStatus;
    has_materials: boolean;
};

export type PurchaseOrderIndexProps = {
    orders: PurchaseOrderListItem[];
    order: PurchaseOrderProfile | null;
    can_create: boolean;
};

export type PurchaseOrderProfile = {
    id: number;
    po_number: string;
    po_date: string;
    order_type: number;
    ccc: string;
    description: string;
    po_amount: string;
    source: PurchaseOrderSource;
    status: PurchaseOrderStatus;
    has_pdf: boolean;
    has_materials: boolean;
    pdf_original_name: string | null;
    memo_number: string | null;
    memo_date: string | null;
    project_id: string | null;
    order_no: string | null;
    reference_no: string | null;
    subject: string | null;
    service_acceptance_no: string | null;
    service_acceptance_date: string | null;
    service_acceptance_amount: string | null;
    service_account_no: string | null;
    accepted_amount: string | null;
    requisition_copy_no: string | null;
    sirn_number: string | null;
    completion_letter: string | null;
    measurement_done: string | null;
    mb_no: string | null;
    mb_written: boolean;
    commenced_on: string | null;
    completed_on: string | null;
    measured_on: string | null;
    zmm_confirmation_no: string | null;
    ccc_issue_no: string | null;
    ccc_issue_date: string | null;
    ccc_receive_date: string | null;
    bill_issue_no: string | null;
    bill_issue_date: string | null;
    bill_receive_no: string | null;
    bill_receive_date: string | null;
    bill_signed: boolean;
    invoice_no: string | null;
    invoice_date: string | null;
    gross_bill_amount: string | null;
    cgst: string | null;
    sgst: string | null;
    total_gross_amount: string | null;
    security_deposit: string | null;
    income_tax: string | null;
    cess: string | null;
    wct: string | null;
    material_deduction: string | null;
    penalty: string | null;
    tax_deduction: string | null;
    net_amount_gst: string | null;
    net_amount: string | null;
    final_receipt_issue_no: string | null;
    final_receipt_issue_date: string | null;
    deposit_date: string | null;
    payment_date: string | null;
    payment_year: string | null;
    security_claimed_on: string | null;
    security_paid_on: string | null;
    srn_number: string | null;
    labours: PurchaseOrderLabourLine[];
};

export type PurchaseOrderShowProps = {
    order: PurchaseOrderProfile;
};

export type PurchaseOrderDraft = {
    memo_number: string | null;
    memo_date: string | null;
    po_number: string | null;
    po_date: string | null;
    project_id: string | null;
    order_no: string | null;
    reference_no: string | null;
    order_type: number | null;
    ccc: string | null;
    description: string | null;
    po_amount: string | null;
};

export type PurchaseOrderScanDuplicates = {
    po_number: boolean;
    pdf: boolean;
    existing_po_number: string | null;
    existing_pdf_po_number: string | null;
};

export type PurchaseOrderScanResponse = {
    draft: PurchaseOrderDraft;
    lines: PurchaseOrderLabourLine[];
    duplicates: PurchaseOrderScanDuplicates;
};
