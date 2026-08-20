/*
 * Product identity for the chrome that surrounds every screen — wordmark,
 * version badge and developer credit. Organisation identity (company name,
 * vendor code) is shared from the server as the `organization` Inertia prop
 * and read through `useOrganization`.
 *
 * `licensedContractor` is preview-only mock data for the /template playground.
 */

export const appConfig = {
    name: 'ECOS',
    tagline: 'OS of Electrical Contractors',
    /* Fallback only — the server-shared `app.version` prop wins when present. */
    version: '1.0.0',
    developer: {
        name: 'Impace Technologies',
        url: 'https://impace.in',
    },
} as const;

export type LicensedContractor = {
    /** Registered trading name printed on the electrical licence. */
    name: string;
    /** Licence number as issued by the state electrical licensing board. */
    licenceNo: string;
    /** Licence class / grade — drives which works the firm may certify. */
    licenceClass: string;
    /** ISO date; the topbar turns amber inside the renewal window. */
    validTill: string;
    /** Issuing authority, shown in the licence popover. */
    authority: string;
};

/*
 * Mock licence record, shaped exactly like the future
 * `GET /api/session/contractor` response.
 */
export const licensedContractor: LicensedContractor = {
    name: 'Voltaic Power Systems Pvt Ltd',
    licenceNo: 'EC/HT/2024/8891',
    licenceClass: 'Class A — HT & LT',
    validTill: '2027-03-31',
    authority: 'State Electrical Licensing Board',
};
