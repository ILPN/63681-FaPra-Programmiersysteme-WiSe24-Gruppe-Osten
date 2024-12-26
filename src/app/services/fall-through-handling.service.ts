import { Injectable } from '@angular/core';
import { EventLog } from '../classes/event-log';
import { PetriNet } from '../classes/petrinet/petri-net';
import { PetriNetManagementService } from './petri-net-management.service';
import { ShowFeedbackService } from './show-feedback.service';
import { Dfg } from '../classes/dfg/dfg';
import { CalculateDfgService } from './calculate-dfg.service';
import { Activity } from '../classes/dfg/activities';

@Injectable({
    providedIn: 'root',
})
export class FallThroughHandlingService {
    private _petriNet!: PetriNet;
    private _resolvePromise: (value: string) => void = () => {};

    constructor(
        private _petriNetManagementService: PetriNetManagementService,
        private _showFeedbackService: ShowFeedbackService,
        private _calculateDfgService: CalculateDfgService,
    ) {
        this._petriNetManagementService.petriNet$.subscribe((pn) => {
            this._petriNet = pn;
        });
    }

    executeActivityOncePerTraceFallThrough(): void {
        if (this._petriNet.cutCanBeExecuted()) {
            this._showFeedbackService.showMessage(
                'Another Cut can be performed on this PetriNet',
                true,
            );
            return;
        }
        this._showFeedbackService.showMessage(
            'Choose the activity you want to detach',
            false,
        );
        this.startWaitingForActivityClick();
    }

    private continueAOPTExecution(activityName: string) {
        for (const dfg of this._petriNet.getDFGs()) {
            try {
                const activity: Activity =
                    dfg.activities.getActivityByName(activityName);
                if (dfg.eventLog.activityOncePerTraceIsPossibleBy(activity)) {
                    const eventLogs: [EventLog, EventLog] =
                        dfg.eventLog.splitByActivityOncePerTrace(activity);
                    const subDFGs: [Dfg, Dfg] = [
                        this._calculateDfgService.calculate(eventLogs[0]),
                        this._calculateDfgService.calculate(eventLogs[1]),
                    ];
                    this._petriNetManagementService.updatePnByParallelCut(
                        dfg,
                        subDFGs[0],
                        subDFGs[1],
                    );
                    return;
                }
            } catch {
                continue;
            }
        }
        this._showFeedbackService.showMessage(
            'Activity Once Per Trace Fall Through is not possible for the choosen activity',
            true,
        );
    }

    private async startWaitingForActivityClick() {
        const response = await this.waitForActivityClick();
        this.continueAOPTExecution(response);
    }

    private waitForActivityClick(): Promise<string> {
        return new Promise((resolve) => {
            this._resolvePromise = resolve;
        });
    }

    processActivityClick(activityName: string) {
        if (this._resolvePromise) {
            this._resolvePromise(activityName);
        }
    }

    executeFlowerFallThrough(): void {
        if (
            this._petriNet.cutCanBeExecuted() ||
            this._petriNet.acitivityOncePerTraceIsFeasible()
        ) {
            this._showFeedbackService.showMessage(
                'Another Cut or Fall-Through is possible and need to be performed before Flower Fall-Through can be performed',
                true,
            );
            return;
        }
        for (const dfg of this._petriNet.getDFGs()) {
            const eventLog: EventLog = dfg.eventLog;
            const eventLogs: EventLog[] = eventLog.splitByFlowerFallThrough();
            const subDFGs: Dfg[] = [];
            for (const log of eventLogs) {
                subDFGs.push(this._calculateDfgService.calculate(log));
            }
            this._petriNetManagementService.updatePnByFlowerFallThrough(
                dfg,
                subDFGs,
            );
            return;
        }
    }
}
