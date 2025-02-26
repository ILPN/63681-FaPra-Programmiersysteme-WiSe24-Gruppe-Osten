import { Place } from './places';
import { PetriNetTransition } from './petri-net-transitions';

export interface PlaceToTransitionArc {
    start: Place;
    end: PetriNetTransition;
}

export interface TransitionToPlaceArc {
    start: PetriNetTransition;
    end: Place;
}

export class PetriNetArcs {
    private readonly _arcs: Array<PlaceToTransitionArc | TransitionToPlaceArc> =
        new Array();
    constructor() {}

    get arcs(): Array<PlaceToTransitionArc | TransitionToPlaceArc> {
        return this._arcs;
    }

    redirectArcStart(
        currentStart: PetriNetTransition,
        newStart: PetriNetTransition,
    ): PetriNetArcs {
        for (const arc of this._arcs.values()) {
            if (arc.start === currentStart) {
                arc.start = newStart;
            }
        }
        return this;
    }

    redirectArcEnd(
        currentEnd: PetriNetTransition,
        newEnd: PetriNetTransition,
    ): PetriNetArcs {
        for (const arc of this._arcs.values()) {
            if (arc.end === currentEnd) {
                arc.end = newEnd;
            }
        }
        return this;
    }

    addPlaceToTransitionArc(
        startPlace: Place,
        endTransition: PetriNetTransition,
    ): PetriNetArcs {
        this._arcs.push({ start: startPlace, end: endTransition });
        return this;
    }

    addTransitionToPlaceArc(
        startTransition: PetriNetTransition,
        endPlace: Place,
    ): PetriNetArcs {
        this._arcs.push({ start: startTransition, end: endPlace });
        return this;
    }

    removeArc(
        start: PetriNetTransition | Place,
        end: PetriNetTransition | Place,
    ): PetriNetArcs {
        for (const [index, arc] of this.arcs.entries()) {
            if (arc.start === start && arc.end === end) {
                this.arcs.splice(index, 1);
                return this;
            }
        }
        throw new Error('Arc not found');
    }

    getNextTransition(place: Place): PetriNetTransition {
        for (const arc of this._arcs) {
            if (arc.start === place) {
                return arc.end;
            }
        }
        throw new Error('This place is not reaching a transition');
    }

    getNextTransitions(place: Place): Array<PetriNetTransition> {
        const petriNetTransitions: Array<PetriNetTransition> =
            new Array<PetriNetTransition>();

        for (const arc of this._arcs) {
            if (arc.start === place) {
                petriNetTransitions.push(arc.end);
            }
        }

        return petriNetTransitions;
    }

    getPrevTransition(place: Place): PetriNetTransition {
        for (const arc of this._arcs) {
            if (arc.end === place) {
                return arc.start;
            }
        }
        throw new Error('This place is not reached by a transition');
    }

    getNextPlace(transition: PetriNetTransition): Place {
        for (const arc of this._arcs) {
            if (arc.start === transition) {
                return arc.end;
            }
        }
        throw new Error('This transition is not reaching a place');
    }

    getNextPlaces(transition: PetriNetTransition): Array<Place> {
        const places: Array<Place> = new Array<Place>();

        for (const arc of this._arcs) {
            if (arc.start === transition) {
                places.push(arc.end);
            }
        }

        return places;
    }

    getPrevPlace(transition: PetriNetTransition): Place {
        for (const arc of this._arcs) {
            if (arc.end === transition) {
                return arc.start;
            }
        }
        throw new Error('This transition is not reached by a place');
    }
}
