import * as assert from 'assert';
import { makeDraft, DraftItem, makeDraftItem } from './draft';

describe('draft', function() {

    it('makeDraft', function() {
        const drafters = ['Billy', 'Bob', 'Mike'];
        const options = ['Snickers', 'Butterfinger', 'Skittles', 'M&Ms', 'SweetTarts', 'Dots', 'Milky Way'];
        const rounds = 2;
        const draft = makeDraft(drafters, options, rounds);
        assert.deepStrictEqual(draft.getDrafters(), drafters);
        assert.deepStrictEqual(draft.getUndraftedItems(), options);
        assert.deepStrictEqual(draft.getDraftedItems(), []);
        assert.deepStrictEqual(draft.getTurn(), drafters[0]);
    });
    
    it('getTurn', function() {
        const drafters = ['Billy', 'Bob', 'Mike'];
        const options = ['Snickers', 'Butterfinger', 'Skittles', 'M&Ms', 'SweetTarts', 'Dots', 'Milky Way'];
        const rounds = 2;
        const draft = makeDraft(drafters, options, rounds);
        assert.strictEqual(draft.getTurn(), 'Billy');
        draft.pickItem(options[0]);
        assert.strictEqual(draft.getTurn(), 'Bob');
        draft.pickItem(options[1]);
        assert.strictEqual(draft.getTurn(), 'Mike');
        draft.pickItem(options[2]);
        assert.strictEqual(draft.getTurn(), 'Billy');
    });

    it('getUndraftedItems', function() {
        const drafters = ['Billy', 'Bob', 'Mike'];
        const options = ['Snickers', 'Butterfinger', 'Skittles', 'M&Ms', 'SweetTarts', 'Dots', 'Milky Way'];
        const rounds = 2;
        const draft = makeDraft(drafters, options, rounds)
        assert.deepStrictEqual(draft.getUndraftedItems(), options);
        draft.pickItem(options[0])
        assert.deepStrictEqual(draft.getUndraftedItems(), options.slice(1));
        draft.pickItem(options[1])
        assert.deepStrictEqual(draft.getUndraftedItems(), options.slice(2));
        draft.pickItem(options[2])
        assert.deepStrictEqual(draft.getUndraftedItems(), options.slice(3));
        draft.pickItem(options[3])
        assert.deepStrictEqual(draft.getUndraftedItems(), options.slice(4));
    });

    it('getDraftedItems', function() {
        const drafters = ['Billy', 'Bob', 'Mike'];
        const options = ['Snickers', 'Butterfinger', 'Skittles', 'M&Ms', 'SweetTarts', 'Dots', 'Milky Way'];
        const rounds = 2;
        const draft = makeDraft(drafters, options, rounds)
        let items: DraftItem[] = [];
        draft.pickItem(options[0]);
        items.push(makeDraftItem(options[0], 1, drafters[0]));
        assert.deepStrictEqual(draft.getDraftedItems(), items);
        draft.pickItem(options[1]);
        items.push(makeDraftItem(options[1], 2, drafters[1]));
        assert.deepStrictEqual(draft.getDraftedItems(), items);
        draft.pickItem(options[2]);
        items.push(makeDraftItem(options[2], 3, drafters[2]));
        assert.deepStrictEqual(draft.getDraftedItems(), items);
        draft.pickItem(options[3]);
        items.push(makeDraftItem(options[3], 4, drafters[0]));
        assert.deepStrictEqual(draft.getDraftedItems(), items);
    });

    it('getDrafters', function() {
        const drafters1 = ['Billy', 'Bob', 'Mike'];
        const drafters2 = ['First', 'Second', 'Third'];
        const drafters3 = ['Team 1', 'Team 2', 'Team 3'];
        const options = ['Snickers', 'Butterfinger', 'Skittles', 'M&Ms', 'SweetTarts', 'Dots', 'Milky Way'];
        const rounds = 2;
        assert.deepStrictEqual(makeDraft(drafters1, options, rounds).getDrafters(), drafters1);
        assert.deepStrictEqual(makeDraft(drafters2, options, rounds).getDrafters(), drafters2);
        assert.deepStrictEqual(makeDraft(drafters3, options, rounds).getDrafters(), drafters3);
    });

    it('pickItem', function() {
        const drafters = ['Billy', 'Bob', 'Mike'];
        const options = ['Snickers', 'Butterfinger', 'Skittles', 'M&Ms', 'SweetTarts', 'Dots', 'Milky Way'];
        const rounds = 2;
        const draft = makeDraft(drafters, options, rounds);
        draft.pickItem(options[0]);
        assert.deepStrictEqual(draft.getDraftedItems()[0], makeDraftItem(options[0], 1, drafters[0]));

        draft.pickItem(options[4]);
        assert.deepStrictEqual(draft.getDraftedItems()[1], makeDraftItem(options[4], 2, drafters[1]));

        draft.pickItem(options[6]);
        assert.deepStrictEqual(draft.getDraftedItems()[2], makeDraftItem(options[6], 3, drafters[2]));

        draft.pickItem(options[5]);
        assert.deepStrictEqual(draft.getDraftedItems()[3], makeDraftItem(options[5], 4, drafters[0]));
    });

    it('isOver', function() {
        const draft1 = makeDraft(['Frank'], ['Hersheys'], 1);
        assert.strictEqual(draft1.isOver(), false);
        draft1.pickItem('Hersheys');
        assert.strictEqual(draft1.isOver(), true);

        const drafters = ['Billy', 'Bob', 'Mike'];
        const options = ['Snickers', 'Butterfinger', 'Skittles', 'M&Ms', 'SweetTarts', 'Dots', 'Milky Way'];
        const rounds = 2;
        const draft2 = makeDraft(drafters, options, rounds);
        assert.strictEqual(draft2.isOver(), false);
        draft2.pickItem(options[0]);
        assert.strictEqual(draft2.isOver(), false);
        draft2.pickItem(options[1]);
        assert.strictEqual(draft2.isOver(), false);
        draft2.pickItem(options[2]);
        draft2.pickItem(options[3]);
        assert.strictEqual(draft2.isOver(), false);
        draft2.pickItem(options[4]);
        draft2.pickItem(options[5]);
        assert.strictEqual(draft2.isOver(), true);
        
    });
  
  });