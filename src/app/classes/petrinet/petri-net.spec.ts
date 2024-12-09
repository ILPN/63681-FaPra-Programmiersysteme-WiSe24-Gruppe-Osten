import { Dfg, DfgBuilder } from '../dfg/dfg';
import { PetriNet } from './petri-net';
import { PetriNetArcs } from './petri-net-arcs';
import { PetriNetTransitions } from './petri-net-transitions';
import { Places } from './places';

describe('Petrinet', () => {
    it('DFG is a base case', () => {
        const sut: Dfg = new DfgBuilder()
            .createActivity('A')
            .addFromPlayArc('A')
            .addToStopArc('A')
            .build();

        const result: boolean = sut.isBaseCase();

        expect(result).toBeTrue();
    });

    it('DFG is not a base case', () => {
        const sut: Dfg = new DfgBuilder()
            .createActivity('A')
            .createActivity('B')
            .addFromPlayArc('A')
            .addToStopArc('B')
            .addArc('A', 'B')
            .build();

        const result: boolean = sut.isBaseCase();

        expect(result).toBeFalse();
    });

    it('DFG is a base case and base activity name is', () => {
        const sut: Dfg = new DfgBuilder()
            .createActivity('A')
            .addFromPlayArc('A')
            .addToStopArc('A')
            .build();

        const sutIsBaseCase: boolean = sut.isBaseCase();
        const result: string = sut.getBaseActivityName();

        expect(sutIsBaseCase).toBeTrue();
        expect(result).toEqual('A');
    });

    it('update by exclusive cut', () => {
        const originDFG: Dfg = new DfgBuilder()
            .createActivity('A')
            .createActivity('B')
            .createActivity('Z')
            .createActivity('Y')
            .addFromPlayArc('A')
            .addFromPlayArc('Z')
            .addToStopArc('B')
            .addToStopArc('Y')
            .addArc('A', 'B')
            .addArc('Z', 'Y')
            .build();
        const subDFG1: Dfg = new DfgBuilder()
            .createActivity('A')
            .createActivity('B')
            .addFromPlayArc('A')
            .addToStopArc('B')
            .addArc('A', 'B')
            .build();
        const subDFG2: Dfg = new DfgBuilder()
            .createActivity('Z')
            .createActivity('Y')
            .addFromPlayArc('Z')
            .addToStopArc('Y')
            .addArc('Z', 'Y')
            .build();

        const sut: PetriNet = new PetriNet(originDFG);
        const result: PetriNet = sut.updateByExclusiveCut(
            originDFG,
            subDFG1,
            subDFG2,
        );

        const expectedPlaces: Places = new Places();
        const expectedTransitions: PetriNetTransitions =
            new PetriNetTransitions()
                .createTransition('play')
                .createTransition('stop');
        const expectedArcs: PetriNetArcs = new PetriNetArcs()
            .addPlaceToTransitionArc(
                expectedPlaces.addPlace().getLastPlace(),
                expectedTransitions.getTransitionByID('t1'),
            )
            .addTransitionToPlaceArc(
                expectedTransitions.getTransitionByID('t1'),
                expectedPlaces.addPlace().getLastPlace(),
            )
            .addPlaceToTransitionArc(
                expectedPlaces.getLastPlace(),
                expectedTransitions.addDFG(subDFG1).getLastTransition(),
            )
            .addTransitionToPlaceArc(
                expectedTransitions.getLastTransition(),
                expectedPlaces.addPlace().getLastPlace(),
            )
            .addPlaceToTransitionArc(
                expectedPlaces.getLastPlace(),
                expectedTransitions.getTransitionByID('t2'),
            )
            .addTransitionToPlaceArc(
                expectedTransitions.getTransitionByID('t2'),
                expectedPlaces.addPlace().getLastPlace(),
            )
            .addPlaceToTransitionArc(
                expectedPlaces.getPlaceByID('p2'),
                expectedTransitions.addDFG(subDFG2).getLastTransition(),
            )
            .addTransitionToPlaceArc(
                expectedTransitions.getLastTransition(),
                expectedPlaces.getPlaceByID('p3'),
            );

        expect(result.getAllArcs()).toEqual(expectedArcs);
        expect(result.getAllTransitions()).toEqual(expectedTransitions);
        expect(result.getAllPlaces()).toEqual(expectedPlaces);
    });

    it('update by sequence cut', () => {
        const originDFG: Dfg = new DfgBuilder()
            .createActivity('A')
            .createActivity('B')
            .createActivity('Z')
            .createActivity('Y')
            .addFromPlayArc('A')
            .addToStopArc('Y')
            .addArc('A', 'B')
            .addArc('B', 'Z')
            .addArc('Z', 'Y')
            .build();
        const subDFG1: Dfg = new DfgBuilder()
            .createActivity('A')
            .createActivity('B')
            .addFromPlayArc('A')
            .addToStopArc('B')
            .addArc('A', 'B')
            .build();
        const subDFG2: Dfg = new DfgBuilder()
            .createActivity('Z')
            .createActivity('Y')
            .addFromPlayArc('Z')
            .addToStopArc('Y')
            .addArc('Z', 'Y')
            .build();

        const sut: PetriNet = new PetriNet(originDFG);
        const result: PetriNet = sut.updateBySequenceCut(
            originDFG,
            subDFG1,
            subDFG2,
        );

        const expectedPlaces: Places = new Places();
        const expectedTransitions: PetriNetTransitions =
            new PetriNetTransitions()
                .createTransition('play')
                .createTransition('stop');
        const expectedArcs: PetriNetArcs = new PetriNetArcs()
            .addPlaceToTransitionArc(
                expectedPlaces.addPlace().getPlaceByID('p1'),
                expectedTransitions.getTransitionByID('t1'),
            )
            .addTransitionToPlaceArc(
                expectedTransitions.getTransitionByID('t1'),
                expectedPlaces.addPlace().getPlaceByID('p2'),
            )
            .addPlaceToTransitionArc(
                expectedPlaces.getPlaceByID('p2'),
                expectedTransitions.addDFG(subDFG1).getLastTransition(),
            )
            .addTransitionToPlaceArc(
                expectedTransitions.addDFG(subDFG2).getLastTransition(),
                expectedPlaces.addPlace().getPlaceByID('p3'),
            )
            .addPlaceToTransitionArc(
                expectedPlaces.getPlaceByID('p3'),
                expectedTransitions.getTransitionByID('t2'),
            )
            .addTransitionToPlaceArc(
                expectedTransitions.getTransitionByID('t2'),
                expectedPlaces.addPlace().getPlaceByID('p4'),
            );
        expectedArcs
            .addTransitionToPlaceArc(
                expectedArcs.getNextTransition(
                    expectedPlaces.getPlaceByID('p2'),
                ),
                expectedPlaces.addPlace().getPlaceByID('p5'),
            )
            .addPlaceToTransitionArc(
                expectedPlaces.getPlaceByID('p5'),
                expectedTransitions.getLastTransition(),
            );

        expect(result.getAllArcs()).toEqual(expectedArcs);
        expect(result.getAllTransitions()).toEqual(expectedTransitions);
        expect(result.getAllPlaces()).toEqual(expectedPlaces);
    });

    it('update by parallel cut', () => {
        const originDFG: Dfg = new DfgBuilder()
            .createActivity('A')
            .createActivity('B')
            .createActivity('Z')
            .createActivity('Y')
            .addFromPlayArc('A')
            .addFromPlayArc('Z')
            .addToStopArc('B')
            .addToStopArc('Y')
            .addArc('A', 'B')
            .addArc('A', 'Z')
            .addArc('A', 'Y')
            .addArc('B', 'Z')
            .addArc('B', 'Y')
            .addArc('Z', 'Y')
            .addArc('Z', 'A')
            .addArc('Z', 'B')
            .addArc('Y', 'A')
            .addArc('Y', 'B')
            .build();
        const subDFG1: Dfg = new DfgBuilder()
            .createActivity('A')
            .createActivity('B')
            .addFromPlayArc('A')
            .addToStopArc('B')
            .addArc('A', 'B')
            .build();
        const subDFG2: Dfg = new DfgBuilder()
            .createActivity('Z')
            .createActivity('Y')
            .addFromPlayArc('Z')
            .addToStopArc('Y')
            .addArc('Z', 'Y')
            .build();

        const sut: PetriNet = new PetriNet(originDFG);
        const result: PetriNet = sut.updateByParallelCut(
            originDFG,
            subDFG1,
            subDFG2,
        );

        const expectedPlaces: Places = new Places();
        const expectedTransitions: PetriNetTransitions =
            new PetriNetTransitions()
                .createTransition('play')
                .createTransition('stop');
        const expectedArcs: PetriNetArcs = new PetriNetArcs()
            .addPlaceToTransitionArc(
                expectedPlaces.addPlace().getPlaceByID('p1'),
                expectedTransitions.getTransitionByID('t1'),
            )
            .addTransitionToPlaceArc(
                expectedTransitions.getTransitionByID('t1'),
                expectedPlaces.addPlace().getPlaceByID('p2'),
            )
            .addPlaceToTransitionArc(
                expectedPlaces.getPlaceByID('p2'),
                expectedTransitions.addDFG(subDFG1).getLastTransition(),
            )
            .addTransitionToPlaceArc(
                expectedTransitions.getLastTransition(),
                expectedPlaces.addPlace().getPlaceByID('p3'),
            )
            .addPlaceToTransitionArc(
                expectedPlaces.getPlaceByID('p3'),
                expectedTransitions.getTransitionByID('t2'),
            )
            .addTransitionToPlaceArc(
                expectedTransitions.getTransitionByID('t2'),
                expectedPlaces.addPlace().getPlaceByID('p4'),
            );
        expectedArcs
            .addTransitionToPlaceArc(
                expectedTransitions.getTransitionByID('t1'),
                expectedPlaces.addPlace().getPlaceByID('p5'),
            )
            .addPlaceToTransitionArc(
                expectedPlaces.getPlaceByID('p5'),
                expectedTransitions.addDFG(subDFG2).getLastTransition(),
            )
            .addTransitionToPlaceArc(
                expectedTransitions.getLastTransition(),
                expectedPlaces.addPlace().getPlaceByID('p6'),
            )
            .addPlaceToTransitionArc(
                expectedPlaces.getPlaceByID('p6'),
                expectedTransitions.getTransitionByID('t2'),
            );

        expect(result.getAllArcs()).toEqual(expectedArcs);
        expect(result.getAllTransitions()).toEqual(expectedTransitions);
        expect(result.getAllPlaces()).toEqual(expectedPlaces);
    });

    it('update by loop cut', () => {
        const originDFG: Dfg = new DfgBuilder()
            .createActivity('A')
            .createActivity('B')
            .createActivity('Z')
            .addFromPlayArc('A')
            .addToStopArc('B')
            .addArc('A', 'B')
            .addArc('A', 'Z')
            .addArc('Z', 'B')
            .build();
        const subDFG1: Dfg = new DfgBuilder()
            .createActivity('A')
            .createActivity('B')
            .addFromPlayArc('A')
            .addToStopArc('B')
            .addArc('A', 'B')
            .build();
        const subDFG2: Dfg = new DfgBuilder()
            .createActivity('Z')
            .addFromPlayArc('Z')
            .addToStopArc('Z')
            .build();

        const sut: PetriNet = new PetriNet(originDFG);
        const result: PetriNet = sut.updateByLoopCut(
            originDFG,
            subDFG1,
            subDFG2,
        );

        const expectedPlaces: Places = new Places();
        const expectedTransitions: PetriNetTransitions =
            new PetriNetTransitions()
                .createTransition('play')
                .createTransition('stop');
        const expectedArcs: PetriNetArcs = new PetriNetArcs()
            .addPlaceToTransitionArc(
                expectedPlaces.addPlace().getPlaceByID('p1'),
                expectedTransitions.getTransitionByID('t1'),
            )
            .addTransitionToPlaceArc(
                expectedTransitions.getTransitionByID('t1'),
                expectedPlaces.addPlace().getPlaceByID('p2'),
            )
            .addPlaceToTransitionArc(
                expectedPlaces.getPlaceByID('p2'),
                expectedTransitions.addDFG(subDFG1).getLastTransition(),
            )
            .addTransitionToPlaceArc(
                expectedTransitions.getLastTransition(),
                expectedPlaces.addPlace().getPlaceByID('p3'),
            )
            .addPlaceToTransitionArc(
                expectedPlaces.getPlaceByID('p3'),
                expectedTransitions.getTransitionByID('t2'),
            )
            .addTransitionToPlaceArc(
                expectedTransitions.getTransitionByID('t2'),
                expectedPlaces.addPlace().getPlaceByID('p4'),
            )
            .addPlaceToTransitionArc(
                expectedPlaces.getPlaceByID('p3'),
                expectedTransitions.addDFG(subDFG2).getLastTransition(),
            )
            .addTransitionToPlaceArc(
                expectedTransitions.getLastTransition(),
                expectedPlaces.getPlaceByID('p2'),
            );

        expect(result.getAllArcs()).toEqual(expectedArcs);
        expect(result.getAllTransitions()).toEqual(expectedTransitions);
        expect(result.getAllPlaces()).toEqual(expectedPlaces);
    });
});
