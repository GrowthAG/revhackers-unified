import React from 'react';
import { MeetingIntelligenceTimeline } from '@/components/admin/MeetingIntelligenceTimeline';

export const MeetingVaultTab = ({ projectId }: { projectId: string }) => {
    return <MeetingIntelligenceTimeline projectId={projectId} />;
};
