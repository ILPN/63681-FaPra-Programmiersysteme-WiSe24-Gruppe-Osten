import { Injectable } from '@angular/core';
import { PetriNet } from '../classes/petrinet/petri-net';
import { BehaviorSubject, Observable } from 'rxjs';
import { Dfg } from '../classes/dfg/dfg';
import { ShowFeedbackService } from './show-feedback.service';

@Injectable({
    providedIn: 'root',
})
export class PetriNetManagementService {
    private _petriNet: PetriNet = new PetriNet();

    private _petriNet$: BehaviorSubject<PetriNet> =
        new BehaviorSubject<PetriNet>(this._petriNet);

    get petriNet$(): Observable<PetriNet> {
        return this._petriNet$.asObservable();
    }

    constructor(private _showFeedbackService: ShowFeedbackService) {}

    public initialize(dfg: Dfg): void {
        this._petriNet = new PetriNet(dfg);
        this._petriNet$.next(this._petriNet);
        if (this._petriNet.isBasicPetriNet()) {
            this._showFeedbackService.showMessage(
                'There is nothing to split on this event log.',
                false,
            );
        }
    }

    public updatePnByExclusiveCut(
        originDFG: Dfg,
        subDFG1: Dfg,
        subDFG2: Dfg,
    ): void {
        this._petriNet.updateByExclusiveCut(originDFG, subDFG1, subDFG2);
        this.updatePn();
    }

    public updatePnBySequenceCut(
        originDFG: Dfg,
        subDFG1: Dfg,
        subDFG2: Dfg,
    ): void {
        this._petriNet.updateBySequenceCut(originDFG, subDFG1, subDFG2);
        this.updatePn();
    }

    public updatePnByParallelCut(
        originDFG: Dfg,
        subDFG1: Dfg,
        subDFG2: Dfg,
    ): void {
        this._petriNet.updateByParallelCut(originDFG, subDFG1, subDFG2);
        this.updatePn();
    }

    public updatePnByLoopCut(originDFG: Dfg, subDFG1: Dfg, subDFG2: Dfg): void {
        this._petriNet.updateByLoopCut(originDFG, subDFG1, subDFG2);
        this.updatePn();
    }

    private updatePn(): void {
        this._petriNet$.next(this._petriNet);
        if (this._petriNet.isBasicPetriNet()) {
            this._showFeedbackService.showMessage(
                'The input event log is completely splitted.',
                false,
            );
        }
    }
}
