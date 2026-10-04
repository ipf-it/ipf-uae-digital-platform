/**
 * Temporary organisational display figures for the homepage statistics strip.
 *
 * IMPORTANT:
 *   5,000+ (Members) and 1,000+ (IPF Yuva) are the figures the organisation
 *   publishes externally — NOT counts of registered website accounts. The
 *   events and chapters values are the current actual counts.
 *
 * CMS readiness:
 *   This file is the compile-time contract and default. When the CMS gains a
 *   HomeStats model it should emit the same shape (one entry per key, with
 *   `value` as the numeric target and `suffix` as the trailing character set
 *   displayed verbatim). A future hook can then merge the CMS payload over
 *   `homeStats` without any component redesign — only the data source
 *   changes.
 */

export type HomeStatKey = "members" | "yuva" | "events" | "chapters";

export type HomeStat = {
  readonly key: HomeStatKey;
  readonly label: string;
  readonly value: number;
  readonly suffix: string;
};

export const homeStats: readonly HomeStat[] = [
  { key: "members",  label: "Members",      value: 5000, suffix: "+" },
  { key: "yuva",     label: "IPF Yuva",     value: 1000, suffix: "+" },
  { key: "events",   label: "Events",       value: 25,   suffix: ""  },
  { key: "chapters", label: "UAE Chapters", value: 8,    suffix: ""  },
];
