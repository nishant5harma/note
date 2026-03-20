export declare function setTeamQuota(teamId: string, period: string, metric: string, target: number): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    teamId: string;
    target: number;
    active: boolean;
    metric: string;
    period: string;
}>;
export declare function getTeamQuotas(teamId: string): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    teamId: string;
    target: number;
    active: boolean;
    metric: string;
    period: string;
}[]>;
export declare function getTeamQuotaProgress(teamId: string, period?: string): Promise<{
    quota: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        teamId: string;
        target: number;
        active: boolean;
        metric: string;
        period: string;
    };
    conversions: number;
    percent: number;
} | {
    quota: {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        teamId: string;
        target: number;
        active: boolean;
        metric: string;
        period: string;
    };
    conversions?: undefined;
    percent?: undefined;
}>;
//# sourceMappingURL=quota.service.d.ts.map