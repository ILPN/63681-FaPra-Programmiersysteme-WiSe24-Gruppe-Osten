import { CutType } from 'src/app/components/cut-execution/cut-execution.component';
import { Activities } from './activities';
import { Arcs } from './arcs';
import { Dfg, DfgBuilder } from './dfg';
import { Arc } from 'src/app/components/drawing-area';

describe('Partition a Dfg by cutted arcs', () => {
    it('with all activities in one partition (a1 is empty)', () => {
        const sut: Dfg = new DfgBuilder()
            .createActivity('A')
            .createActivity('B')
            .addFromPlayArc('A')
            .addFromPlayArc('B')
            .addToStopArc('A')
            .addToStopArc('B')
            .build();
        const cuttedArcs: Arcs = new Arcs()
            .addArc(sut.getArc('play', 'A'))
            .addArc(sut.getArc('play', 'B'));

        const result: Activities[] = sut.calculatePartitions(cuttedArcs);

        const a1: Activities = new Activities();
        const a2: Activities = new Activities()
            .createActivity('A')
            .createActivity('B');

        expect(result).toEqual([a1, a2]);
    });

    it('with all activities in one partition (a2 is empty)', () => {
        const sut: Dfg = new DfgBuilder()
            .createActivity('A')
            .createActivity('B')
            .addFromPlayArc('A')
            .addFromPlayArc('B')
            .addToStopArc('A')
            .addToStopArc('B')
            .build();
        const cuttedArcs: Arcs = new Arcs()
            .addArc(sut.getArc('A', 'stop'))
            .addArc(sut.getArc('B', 'stop'));

        const result: Activities[] = sut.calculatePartitions(cuttedArcs);

        const a1: Activities = new Activities()
            .createActivity('A')
            .createActivity('B');
        const a2: Activities = new Activities();

        expect(result).toEqual([a1, a2]);
    });

    it('without any cutted arc', () => {
        const sut: Dfg = new DfgBuilder()
            .createActivity('A')
            .createActivity('B')
            .addFromPlayArc('A')
            .addFromPlayArc('B')
            .addToStopArc('A')
            .addToStopArc('B')
            .build();
        const cuttedArcs: Arcs = new Arcs();

        const result: Activities[] = sut.calculatePartitions(cuttedArcs);

        const a1: Activities = new Activities()
            .createActivity('A')
            .createActivity('B');
        const a2: Activities = new Activities();
        const expectedPartitions: Activities[] = [a1, a2];

        expect(result).toEqual(expectedPartitions);
    });

    it('without having all activities from Dfg contained in partitions', () => {
        const sut: Dfg = new DfgBuilder()
            .createActivity('A')
            .createActivity('B')
            .createActivity('C')
            .createActivity('D')
            .addFromPlayArc('A')
            .addToStopArc('D')
            .addArc('A', 'B')
            .addArc('B', 'C')
            .addArc('C', 'D')
            .build();
        const cuttedArcs: Arcs = new Arcs()
            .addArc(sut.getArc('A', 'B'))
            .addArc(sut.getArc('C', 'D'));

        const result: Activities[] = sut.calculatePartitions(cuttedArcs);

        const expectedA1: Activities = new Activities().createActivity('A');
        const expectedA2: Activities = new Activities().createActivity('D');

        expect(result).toEqual([expectedA1, expectedA2]);
    });

    it('with cutted arcs like invalid exclusive cut (with two partitions)', () => {
        const sut: Dfg = new DfgBuilder()
            .createActivity('A')
            .createActivity('B')
            .addFromPlayArc('A')
            .addFromPlayArc('B')
            .addToStopArc('A')
            .addToStopArc('B')
            .build();
        const cuttedArcs: Arcs = new Arcs()
            .addArc(sut.getArc('B', 'stop'))
            .addArc(sut.getArc('play', 'A'));

        const result: Activities[] = sut.calculatePartitions(cuttedArcs);

        const expectedA1: Activities = new Activities().createActivity('B');
        const expectedA2: Activities = new Activities().createActivity('A');

        expect(result).toEqual([expectedA1, expectedA2]);
    });

    it('with cutted arcs like invalid exclusive cut (with one partition)', () => {
        const sut: Dfg = new DfgBuilder()
            .createActivity('A')
            .createActivity('B')
            .createActivity('C')
            .addFromPlayArc('A')
            .addArc('A', 'B')
            .addToStopArc('B')
            .addFromPlayArc('C')
            .addArc('C', 'B')
            .build();
        const cuttedArcs: Arcs = new Arcs()
            .addArc(sut.getArc('B', 'stop'))
            .addArc(sut.getArc('play', 'A'));

        const result: Activities[] = sut.calculatePartitions(cuttedArcs);

        const expectedA1: Activities = new Activities()
            .createActivity('C')
            .createActivity('B')
            .createActivity('A');
        const expectedA2: Activities = new Activities();

        expect(result).toEqual([expectedA1, expectedA2]);
    });

    it('with cutted arcs like invalid sequence cut', () => {
        const sut: Dfg = new DfgBuilder()
            .createActivity('A')
            .createActivity('B')
            .createActivity('C')
            .addFromPlayArc('A')
            .addFromPlayArc('C')
            .addToStopArc('B')
            .addToStopArc('C')
            .addArc('A', 'B')
            .addArc('A', 'C')
            .addArc('C', 'A')
            .addArc('C', 'B')
            .addArc('B', 'C')
            .build();
        const cuttedArcs: Arcs = new Arcs()
            .addArc(sut.getArc('A', 'B'))
            .addArc(sut.getArc('C', 'stop'))
            .addArc(sut.getArc('C', 'B'))
            .addArc(sut.getArc('B', 'C'));

        const result: Activities[] = sut.calculatePartitions(cuttedArcs);

        const expectedA1: Activities = new Activities()
            .createActivity('A')
            .createActivity('C');
        const expectedA2: Activities = new Activities().createActivity('B');

        expect(result).toEqual([expectedA1, expectedA2]);
    });

    it('with cutted arcs like invalid parallel cut', () => {
        const sut: Dfg = new DfgBuilder()
            .createActivity('A')
            .createActivity('B')
            .createActivity('C')
            .addFromPlayArc('A')
            .addFromPlayArc('C')
            .addToStopArc('B')
            .addToStopArc('C')
            .addArc('A', 'B')
            .addArc('A', 'C')
            .addArc('C', 'A')
            .addArc('C', 'B')
            .addArc('B', 'C')
            .build();
        const cuttedArcs: Arcs = new Arcs()
            .addArc(sut.getArc('A', 'C'))
            .addArc(sut.getArc('C', 'A'))
            .addArc(sut.getArc('C', 'B'))
            .addArc(sut.getArc('B', 'C'));

        const result: Activities[] = sut.calculatePartitions(cuttedArcs);

        const expectedA1: Activities = new Activities()
            .createActivity('A')
            .createActivity('C')
            .createActivity('B');
        const expectedA2: Activities = new Activities();

        expect(result).toEqual([expectedA1, expectedA2]);
    });

    it('with cutted arcs like invalid loop cut', () => {
        const sut: Dfg = new DfgBuilder()
            .createActivity('A')
            .createActivity('B')
            .createActivity('C')
            .addFromPlayArc('A')
            .addToStopArc('B')
            .addArc('A', 'B')
            .addArc('B', 'C')
            .addArc('C', 'A')
            .build();
        const cuttedArcs: Arcs = new Arcs()
            .addArc(sut.getArc('A', 'B'))
            .addArc(sut.getArc('C', 'A'))
            .addArc(sut.getArc('B', 'C'));

        const result: Activities[] = sut.calculatePartitions(cuttedArcs);

        const expectedA1: Activities = new Activities().createActivity('A');
        const expectedA2: Activities = new Activities().createActivity('B');

        expect(result).toEqual([expectedA1, expectedA2]);
    });
});

describe('Cut a DFG by any partitions', () => {
    it('is possible by exclusive cut ', () => {
        const sut: Dfg = new DfgBuilder()
            .createActivity('A')
            .createActivity('B')
            .addFromPlayArc('A')
            .addFromPlayArc('B')
            .addToStopArc('A')
            .addToStopArc('B')
            .build();

        const result: boolean = sut.canBeCutByAnyPartitions();

        expect(result).toBeTrue();
    });

    it('is possible by sequence cut', () => {
        const sut: Dfg = new DfgBuilder()
            .createActivity('A')
            .createActivity('B')
            .createActivity('C')
            .addFromPlayArc('A')
            .addArc('A', 'B')
            .addArc('A', 'C')
            .addToStopArc('B')
            .addToStopArc('C')
            .build();

        const result: boolean = sut.canBeCutByAnyPartitions();

        expect(result).toBeTrue();
    });

    it('is not possible by sequence cut if play is connected to a2', () => {
        const sut: Dfg = new DfgBuilder()
            .createActivity('A')
            .createActivity('B')
            .createActivity('C')
            .addFromPlayArc('A')
            .addFromPlayArc('C')
            .addArc('A', 'B')
            .addArc('A', 'C')
            .addToStopArc('B')
            .addToStopArc('C')
            .build();

        const result: boolean = sut.canBeCutByAnyPartitions();

        expect(result).toBeFalse();
    });

    it('is not possible by sequence cut if stop is connected to a1', () => {
        const sut: Dfg = new DfgBuilder()
            .createActivity('A')
            .createActivity('B')
            .createActivity('C')
            .addFromPlayArc('A')
            .addArc('A', 'B')
            .addArc('A', 'C')
            .addToStopArc('A')
            .addToStopArc('B')
            .addToStopArc('C')
            .build();

        const result: boolean = sut.canBeCutByAnyPartitions();

        expect(result).toBeFalse();
    });

    it('is possible by parallel cut', () => {
        const sut: Dfg = new DfgBuilder()
            .createActivity('A')
            .createActivity('B')
            .addFromPlayArc('A')
            .addFromPlayArc('B')
            .addArc('A', 'B')
            .addArc('B', 'A')
            .addToStopArc('A')
            .addToStopArc('B')
            .build();

        const result: boolean = sut.canBeCutByAnyPartitions();

        expect(result).toBeTrue();
    });

    it('is possible by loop cut', () => {
        const sut: Dfg = new DfgBuilder()
            .createActivity('A')
            .createActivity('B')
            .createActivity('C')
            .addFromPlayArc('A')
            .addArc('A', 'B')
            .addArc('B', 'C')
            .addArc('C', 'A')
            .addToStopArc('B')
            .build();

        const result: boolean = sut.canBeCutByAnyPartitions();

        expect(result).toBeTrue();
    });
});

describe('Possible Cuts Tests', () => {
    it('get all cuts - loop cut possible', () => {
        const sut: Dfg = new DfgBuilder()
            .createActivity('A')
            .createActivity('B')
            .createActivity('C')
            .addFromPlayArc('A')
            .addArc('A', 'B')
            .addArc('B', 'C')
            .addArc('C', 'A')
            .addToStopArc('B')
            .build();

        const result: Array<
            [boolean, CutType, Arcs, Arcs, Activities, Activities]
        > = sut.calculateAllPossibleCuts();

        const a1: Activities = new Activities()
            .createActivity('A')
            .createActivity('B');
        const a2: Activities = new Activities().createActivity('C');

        const arcsForA1 = new Arcs().addArc(sut.getArc('A', 'B'));
        const arcsForA2 = new Arcs();
        // console.log('Result 1:', result);

        expect(result).toEqual([
            [true, CutType.LoopCut, arcsForA1, arcsForA2, a1, a2],
        ]);
    });

    it('get all cuts - parallel cut with 2 partition options possible', () => {
        const sut: Dfg = new DfgBuilder()
            .createActivity('A')
            .createActivity('B')
            .addFromPlayArc('A')
            .addFromPlayArc('B')
            .addArc('A', 'B')
            .addArc('B', 'A')
            .addToStopArc('A')
            .addToStopArc('B')
            .build();

        const result: Array<
            [boolean, CutType, Arcs, Arcs, Activities, Activities]
        > = sut.calculateAllPossibleCuts();

        const a1: Activities = new Activities().createActivity('A');
        const a2: Activities = new Activities().createActivity('B');

        const arcsForA1 = new Arcs();
        const arcsForA2 = new Arcs();
        // console.log('Result 2:', result);

        expect(result).toEqual([
            [true, CutType.ParallelCut, arcsForA1, arcsForA2, a1, a2],
            [true, CutType.ParallelCut, arcsForA2, arcsForA1, a2, a1],
        ]);
    });

    // it('get all cuts - 3 exclusive cuts with 2 partition options possible', () => {
    //     const sut: Dfg = new DfgBuilder()
    //         .createActivity('A')
    //         .createActivity('B')
    //         .createActivity('C')
    //         .createActivity('D')
    //         .addFromPlayArc('A')
    //         .addFromPlayArc('C')
    //         .addFromPlayArc('D')
    //         .addArc('A', 'B')
    //         .addToStopArc('B')
    //         .addToStopArc('C')
    //         .addToStopArc('D')
    //         .build();

    //     const result: Array<
    //         [boolean, CutType, Arcs, Arcs, Activities, Activities]
    //     > = sut.calculateAllPossibleCuts();

    //     const a1: Activities = new Activities().createActivity('A').createActivity('B');
    //     const a2: Activities = new Activities().createActivity('C').createActivity('D');

    //     const arcsForA1_1 = new Arcs().addArc(sut.getArc('A', 'B'));
    //     const arcsForA2_1 = new Arcs();
    //     const arcsForA1_2 = new Arcs();
    //     const arcsForA2_2 = new Arcs().addArc(sut.getArc('A', 'B'));
    //     const arcsForA1_3 = new Arcs().addArc(sut.getArc('A', 'B'));
    //     const arcsForA2_3 = new Arcs();
    //     // console.log('Result 3:', result);

    //     expect(result).toEqual([
    //         [true, CutType.ExclusiveCut, arcsForA1_1, arcsForA2_1, a1, a2],
    //         [true, CutType.ExclusiveCut, arcsForA1_2, arcsForA2_2, a1, a2],
    //         [true, CutType.ExclusiveCut, arcsForA1_3, arcsForA2_3, a1, a2],
    //         [true, CutType.ExclusiveCut, arcsForA2_1, arcsForA1_1, a1, a2],
    //         [true, CutType.ExclusiveCut, arcsForA2_2, arcsForA1_2, a1, a2],
    //         [true, CutType.ExclusiveCut, arcsForA2_3, arcsForA1_3, a1, a2],
    //     ]);
    // });

    // it('get all cuts - sequence cut possible and loop cut seems to be possible', () => {
    //     const sut: Dfg = new DfgBuilder()
    //         .createActivity('A')
    //         .createActivity('B')
    //         .createActivity('C')
    //         .createActivity('D')
    //         .addFromPlayArc('A')
    //         .addArc('A', 'B')
    //         .addArc('B', 'C')
    //         .addArc('C', 'D')
    //         .addArc('D', 'B')
    //         .addToStopArc('C')
    //         .build();

    //     const result: Array<
    //         [boolean, CutType, Arcs, Arcs, Activities, Activities]
    //     > = sut.calculateAllPossibleCuts();

    //     const a1: Activities = new Activities().createActivity('A');
    //     const a2: Activities = new Activities().createActivity('B');

    //     const arcsForA1 = new Arcs();
    //     const arcsForA2 = new Arcs()
    //         .addArc(sut.getArc('B', 'C'))
    //         .addArc(sut.getArc('C', 'D'))
    //         .addArc(sut.getArc('D', 'B'));

    //     // console.log('Result 4:', result);

    //     expect(result).toEqual([
    //         [true, CutType.SequenceCut, arcsForA1, arcsForA2, a1, a2],
    //     ]);
    // });

    // it('get all cuts - exclusive cut with 2 partition options possible and sequence cut + loop cut seems to be possible', () => {
    //     const sut: Dfg = new DfgBuilder()
    //         .createActivity('A')
    //         .createActivity('B')
    //         .createActivity('C')
    //         .createActivity('D')
    //         .createActivity('Z')
    //         .addFromPlayArc('A')
    //         .addFromPlayArc('Z')
    //         .addArc('A', 'B')
    //         .addArc('B', 'C')
    //         .addArc('C', 'D')
    //         .addArc('D', 'B')
    //         .addToStopArc('C')
    //         .addToStopArc('Z')
    //         .build();

    //     const result: Array<
    //         [boolean, CutType, Arcs, Arcs, Activities, Activities]
    //     > = sut.calculateAllPossibleCuts();

    //     const a1: Activities = new Activities().createActivity('A');
    //     const a2: Activities = new Activities().createActivity('B');

    //     const arcsForA1 = new Arcs()
    //         .addArc(sut.getArc('A', 'B'))
    //         .addArc(sut.getArc('B', 'C'))
    //         .addArc(sut.getArc('C', 'D'))
    //         .addArc(sut.getArc('D', 'B'));
    //     const arcsForA2 = new Arcs();

    //     // console.log('Result 5:', result);

    //     expect(result).toEqual([
    //         [true, CutType.ExclusiveCut, arcsForA1, arcsForA2, a1, a2],
    //         [true, CutType.ExclusiveCut, arcsForA2, arcsForA1, a1, a2],
    //     ]);
    // });

    // it('get all cuts - 3 exclusive cuts possible with 2 partition options each possible, sequence cut + loop cut seems to be possible', () => {
    //     const sut: Dfg = new DfgBuilder()
    //         .createActivity('A')
    //         .createActivity('B')
    //         .createActivity('C')
    //         .createActivity('D')
    //         .createActivity('X')
    //         .createActivity('Z')
    //         .createActivity('H')
    //         .createActivity('P')
    //         .addFromPlayArc('A')
    //         .addFromPlayArc('X')
    //         .addFromPlayArc('Z')
    //         .addArc('A', 'B')
    //         .addArc('B', 'C')
    //         .addArc('C', 'D')
    //         .addArc('D', 'B')
    //         .addArc('Z', 'H')
    //         .addArc('H', 'P')
    //         .addArc('P', 'Z')
    //         .addToStopArc('C')
    //         .addToStopArc('X')
    //         .addToStopArc('Z')
    //         .build();

    //     const result: Array<
    //         [boolean, CutType, Arcs, Arcs, Activities, Activities]
    //     > = sut.calculateAllPossibleCuts();

    //     const a1: Activities = new Activities().createActivity('A');
    //     const a2: Activities = new Activities().createActivity('B');

    //     const arcsForA1_1 = new Arcs()
    //         .addArc(sut.getArc('A', 'B'))
    //         .addArc(sut.getArc('B', 'C'))
    //         .addArc(sut.getArc('C', 'D'))
    //         .addArc(sut.getArc('D', 'B'));
    //     const arcsForA2_1 = new Arcs()
    //         .addArc(sut.getArc('Z', 'H'))
    //         .addArc(sut.getArc('H', 'P'))
    //         .addArc(sut.getArc('P', 'Z'));
    //     const arcsForA1_2 = new Arcs();
    //     const arcsForA2_2 = new Arcs()
    //         .addArc(sut.getArc('A', 'B'))
    //         .addArc(sut.getArc('B', 'C'))
    //         .addArc(sut.getArc('C', 'D'))
    //         .addArc(sut.getArc('D', 'B'))
    //         .addArc(sut.getArc('Z', 'H'))
    //         .addArc(sut.getArc('H', 'P'))
    //         .addArc(sut.getArc('P', 'Z'));
    //     const arcsForA1_3 = new Arcs()
    //         .addArc(sut.getArc('A', 'B'))
    //         .addArc(sut.getArc('B', 'C'))
    //         .addArc(sut.getArc('C', 'D'))
    //         .addArc(sut.getArc('D', 'B'));
    //     const arcsForA2_3 = new Arcs()
    //         .addArc(sut.getArc('Z', 'H'))
    //         .addArc(sut.getArc('H', 'P'))
    //         .addArc(sut.getArc('P', 'Z'));

    //     // console.log('Result 6:', result);

    //     expect(result).toEqual([
    //         [true, CutType.ExclusiveCut, arcsForA1_1, arcsForA2_1, a1, a2],
    //         [true, CutType.ExclusiveCut, arcsForA1_2, arcsForA2_2, a1, a2],
    //         [true, CutType.ExclusiveCut, arcsForA1_3, arcsForA2_3, a1, a2],
    //         [true, CutType.ExclusiveCut, arcsForA2_3, arcsForA1_3, a1, a2],
    //         [true, CutType.ExclusiveCut, arcsForA2_2, arcsForA1_2, a1, a2],
    //         [true, CutType.ExclusiveCut, arcsForA2_1, arcsForA1_1, a1, a2],
    //     ]);
    // });

    // it('get all cuts - 1 exclusive cut with 2 partition options possible and 1 parallel cut seems to be possible', () => {
    //     const sut: Dfg = new DfgBuilder()
    //         .createActivity('A')
    //         .createActivity('B')
    //         .createActivity('C')
    //         .createActivity('H')
    //         .createActivity('P')
    //         .createActivity('Z')
    //         .addFromPlayArc('A')
    //         .addFromPlayArc('H')
    //         .addFromPlayArc('Z')
    //         .addArc('A', 'B')
    //         .addArc('B', 'C')
    //         .addArc('H', 'P')
    //         .addArc('A', 'H')
    //         .addArc('H', 'A')
    //         .addArc('B', 'P')
    //         .addArc('P', 'B')
    //         .addArc('C', 'P')
    //         .addArc('P', 'C')
    //         .addToStopArc('C')
    //         .addToStopArc('P')
    //         .addToStopArc('Z')
    //         .build();

    //     const result: Array<
    //         [boolean, CutType, Arcs, Arcs, Activities, Activities]
    //     > = sut.calculateAllPossibleCuts();

    //     const a1: Activities = new Activities().createActivity('A');
    //     const a2: Activities = new Activities().createActivity('B');

    //     const arcsForA1 = new Arcs()
    //         .addArc(sut.getArc('A', 'B'))
    //         .addArc(sut.getArc('B', 'C'))
    //         .addArc(sut.getArc('H', 'P'))
    //         .addArc(sut.getArc('A', 'H'))
    //         .addArc(sut.getArc('H', 'A'))
    //         .addArc(sut.getArc('B', 'P'))
    //         .addArc(sut.getArc('P', 'B'))
    //         .addArc(sut.getArc('C', 'P'))
    //         .addArc(sut.getArc('P', 'C'));
    //     const arcsForA2 = new Arcs();

    //     // console.log('Result 7:', result);

    //     expect(result).toEqual([
    //         [true, CutType.ExclusiveCut, arcsForA1, arcsForA2, a1, a2],
    //         [true, CutType.ExclusiveCut, arcsForA2, arcsForA1, a1, a2],
    //     ]);
    // });

    // it('get all cuts - 3 sequence cuts possible', () => {
    //     const sut: Dfg = new DfgBuilder()
    //         .createActivity('A')
    //         .createActivity('B')
    //         .createActivity('C')
    //         .createActivity('D')
    //         .addFromPlayArc('A')
    //         .addArc('A', 'B')
    //         .addArc('B', 'C')
    //         .addArc('C', 'D')
    //         .addToStopArc('D')
    //         .build();

    //     const result: Array<
    //         [boolean, CutType, Arcs, Arcs, Activities, Activities]
    //     > = sut.calculateAllPossibleCuts();

    //     const a1: Activities = new Activities().createActivity('A');
    //     const a2: Activities = new Activities().createActivity('B');

    //     const arcsForA1_1 = new Arcs();
    //     const arcsForA2_1 = new Arcs()
    //         .addArc(sut.getArc('B', 'C'))
    //         .addArc(sut.getArc('C', 'D'));
    //     const arcsForA1_2 = new Arcs().addArc(sut.getArc('A', 'B'));
    //     const arcsForA2_2 = new Arcs().addArc(sut.getArc('C', 'D'));
    //     const arcsForA1_3 = new Arcs()
    //         .addArc(sut.getArc('A', 'B'))
    //         .addArc(sut.getArc('B', 'C'));
    //     const arcsForA2_3 = new Arcs();

    //     // console.log('Result 8:', result);

    //     expect(result).toEqual([
    //         [true, CutType.SequenceCut, arcsForA1_1, arcsForA2_1, a1, a2],
    //         [true, CutType.SequenceCut, arcsForA1_2, arcsForA2_2, a1, a2],
    //         [true, CutType.SequenceCut, arcsForA1_3, arcsForA2_3, a1, a2],
    //     ]);
    // });

    // it('get all cuts - 1 sequence cut possible', () => {
    //     const sut: Dfg = new DfgBuilder()
    //         .createActivity('A')
    //         .createActivity('B')
    //         .createActivity('C')
    //         .createActivity('H')
    //         .createActivity('P')
    //         .addFromPlayArc('A')
    //         .addFromPlayArc('H')
    //         .addArc('A', 'B')
    //         .addArc('B', 'C')
    //         .addArc('H', 'P')
    //         .addArc('A', 'H')
    //         .addArc('H', 'A')
    //         .addArc('B', 'P')
    //         .addArc('P', 'B')
    //         .addArc('C', 'P')
    //         .addArc('P', 'C')
    //         .addToStopArc('C')
    //         .addToStopArc('P')
    //         .build();

    //     const result: Array<
    //         [boolean, CutType, Arcs, Arcs, Activities, Activities]
    //     > = sut.calculateAllPossibleCuts();

    //     const a1: Activities = new Activities().createActivity('A');
    //     const a2: Activities = new Activities().createActivity('B');

    //     const arcsForA1 = new Arcs()
    //         .addArc(sut.getArc('A', 'H'))
    //         .addArc(sut.getArc('H', 'A'));
    //     const arcsForA2 = new Arcs()
    //         .addArc(sut.getArc('B', 'C'))
    //         .addArc(sut.getArc('B', 'P'))
    //         .addArc(sut.getArc('P', 'B'))
    //         .addArc(sut.getArc('C', 'P'))
    //         .addArc(sut.getArc('P', 'C'));

    //     // console.log('Result 9:', result);

    //     expect(result).toEqual([
    //         [true, CutType.SequenceCut, arcsForA1, arcsForA2, a1, a2],
    //     ]);
    // });

    // it('get all cuts - 1 parallel cut with 2 partition options possible', () => {
    //     const sut: Dfg = new DfgBuilder()
    //         .createActivity('A')
    //         .createActivity('B')
    //         .createActivity('C')
    //         .createActivity('P')
    //         .addFromPlayArc('A')
    //         .addFromPlayArc('P')
    //         .addArc('A', 'B')
    //         .addArc('B', 'C')
    //         .addArc('A', 'P')
    //         .addArc('P', 'A')
    //         .addArc('B', 'P')
    //         .addArc('P', 'B')
    //         .addArc('C', 'P')
    //         .addArc('P', 'C')
    //         .addToStopArc('C')
    //         .addToStopArc('P')
    //         .build();

    //     const result: Array<
    //         [boolean, CutType, Arcs, Arcs, Activities, Activities]
    //     > = sut.calculateAllPossibleCuts();

    //     const a1: Activities = new Activities().createActivity('A');
    //     const a2: Activities = new Activities().createActivity('B');

    //     const arcsForA1 = new Arcs()
    //         .addArc(sut.getArc('A', 'B'))
    //         .addArc(sut.getArc('B', 'C'));
    //     const arcsForA2 = new Arcs();

    //     // console.log('Result 10:', result);

    //     expect(result).toEqual([
    //         [true, CutType.ParallelCut, arcsForA1, arcsForA2, a1, a2],
    //         [true, CutType.ParallelCut, arcsForA2, arcsForA1, a1, a2],
    //     ]);
    // });

    // it('get all cuts - 1 parallel cut with 2 partition options possible', () => {
    //     const sut: Dfg = new DfgBuilder()
    //         .createActivity('A')
    //         .createActivity('B')
    //         .createActivity('C')
    //         .createActivity('H')
    //         .createActivity('P')
    //         .addFromPlayArc('A')
    //         .addFromPlayArc('H')
    //         .addArc('A', 'B')
    //         .addArc('B', 'C')
    //         .addArc('H', 'P')
    //         .addArc('A', 'H')
    //         .addArc('H', 'A')
    //         .addArc('B', 'H')
    //         .addArc('H', 'B')
    //         .addArc('C', 'H')
    //         .addArc('H', 'C')
    //         .addArc('A', 'P')
    //         .addArc('P', 'A')
    //         .addArc('B', 'P')
    //         .addArc('P', 'B')
    //         .addArc('C', 'P')
    //         .addArc('P', 'C')
    //         .addToStopArc('C')
    //         .addToStopArc('P')
    //         .build();

    //     const result: Array<
    //         [boolean, CutType, Arcs, Arcs, Activities, Activities]
    //     > = sut.calculateAllPossibleCuts();

    //     const a1: Activities = new Activities().createActivity('A');
    //     const a2: Activities = new Activities().createActivity('B');

    //     const arcsForA1 = new Arcs()
    //         .addArc(sut.getArc('A', 'B'))
    //         .addArc(sut.getArc('B', 'C'));
    //     const arcsForA2 = new Arcs().addArc(sut.getArc('H', 'P'));

    //     // console.log('Result 11:', result);

    //     expect(result).toEqual([
    //         [true, CutType.ParallelCut, arcsForA1, arcsForA2, a1, a2],
    //         [true, CutType.ParallelCut, arcsForA2, arcsForA1, a1, a2],
    //     ]);
    // });
});
