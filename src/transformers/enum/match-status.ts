import { Status } from 'brackets-model';
import type { MatchStatus as DrizzleMatchStatus } from '../../db/schema/enums';

export const MatchStatusTransformer = {
    to(status: Status): DrizzleMatchStatus {
        switch (status) {
            case Status.Locked:
                return 'LOCKED';
            case Status.Waiting:
                return 'WAITING';
            case Status.Ready:
                return 'READY';
            case Status.Running:
                return 'RUNNING';
            case Status.Completed:
                return 'COMPLETED';
            case Status.Archived:
                return 'ARCHIVED';
        }
    },
    from(status: DrizzleMatchStatus): Status {
        switch (status) {
            case 'LOCKED':
                return Status.Locked;
            case 'WAITING':
                return Status.Waiting;
            case 'READY':
                return Status.Ready;
            case 'RUNNING':
                return Status.Running;
            case 'COMPLETED':
                return Status.Completed;
            case 'ARCHIVED':
                return Status.Archived;
        }
    },
};
