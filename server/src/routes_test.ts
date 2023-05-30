import * as assert from 'assert';
import * as httpMocks from 'node-mocks-http';
import { Dummy, createDraft, pickItem, getDraft, TEST_ADD_DRAFT, 
         TEST_GET_DRAFT, TEST_RESET } from './routes';
import { makeDraft, makeDraftItem } from './draft';


describe('routes', function() {

  it('Dummy', function() {
    const req1 = httpMocks.createRequest(
        {method: 'GET', url: '/api/dummy', query: {name: 'Kevin'}});
    const res1 = httpMocks.createResponse();
    Dummy(req1, res1);
    assert.strictEqual(res1._getStatusCode(), 200);
    assert.deepEqual(res1._getJSONData(), 'Hi, Kevin');
  });

  it('createDraft', function() {
    const drafters1 = ['Billy', 'Bob', 'Mike'];
    const options1 = ['Snickers', 'Butterfinger', 'Skittles', 'M&Ms', 'SweetTarts', 'Dots', 'Milky Way'];
    const rounds1 = 2;

    const req1 = httpMocks.createRequest(
      {method: 'POST', url: '/api/createDraft', body: {rounds: rounds1, items: options1, drafters: drafters1}});
    const res1 = httpMocks.createResponse();

    createDraft(req1, res1);

    assert.strictEqual(res1._getStatusCode(), 200);

    const ID1 = res1._getJSONData();
    const responseDraft1 = TEST_GET_DRAFT(ID1);
    const draft1 = makeDraft(drafters1, options1, rounds1);
    
    assert.deepStrictEqual(responseDraft1.getDraftedItems(), draft1.getDraftedItems());
    assert.deepStrictEqual(responseDraft1.getDrafters(), draft1.getDrafters());
    assert.deepStrictEqual(responseDraft1.getUndraftedItems(), draft1.getUndraftedItems());

    const drafters2 = ['Team 1', 'Team 2'];
    const options2 = ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5', 'Item 6', 'Item 7'];
    const rounds2 = 3;

    const req2 = httpMocks.createRequest(
      {method: 'POST', url: '/api/createDraft', body: {rounds: rounds2, items: options2, drafters: drafters2}});
    const res2 = httpMocks.createResponse();

    createDraft(req2, res2);

    assert.strictEqual(res2._getStatusCode(), 200);

    const ID2 = res2._getJSONData();
    const responseDraft2 = TEST_GET_DRAFT(ID2);
    const draft2 = makeDraft(drafters2, options2, rounds2);
    
    assert.deepStrictEqual(responseDraft2.getDraftedItems(), draft2.getDraftedItems());
    assert.deepStrictEqual(responseDraft2.getDrafters(), draft2.getDrafters());
    assert.deepStrictEqual(responseDraft2.getUndraftedItems(), draft2.getUndraftedItems());
    
    TEST_RESET();
  });

  it('pickItem', function() {
    const drafters1 = ['Billy', 'Bob', 'Mike'];
    const options1 = ['Snickers', 'Butterfinger', 'Skittles', 'M&Ms', 'SweetTarts', 'Dots', 'Milky Way'];
    const rounds1 = 2;

    const draft1 = makeDraft(drafters1, options1, rounds1);

    const ID1 = TEST_ADD_DRAFT(draft1);

    const req1 = httpMocks.createRequest(
      {method: 'POST', url: '/api/pickItem', query: {ID: "" + ID1, drafter: drafters1[0]}, body: {item: options1[0]}});
    const res1 = httpMocks.createResponse();

    pickItem(req1, res1);

    assert.deepEqual(res1._getStatusCode(), 200);
    assert.deepStrictEqual(draft1.getDraftedItems()[0], makeDraftItem(options1[0], 1, drafters1[0]));

    const drafters2 = ['Team 1', 'Team 2'];
    const options2 = ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5', 'Item 6', 'Item 7'];
    const rounds2 = 3;

    const draft2 = makeDraft(drafters2, options2, rounds2);

    const ID2 = TEST_ADD_DRAFT(draft2);

    const req2 = httpMocks.createRequest(
      {method: 'POST', url: '/api/pickItem', query: {ID: "" + ID2, drafter: drafters2[0]}, body: {item: options2[0]}});
    const res2 = httpMocks.createResponse();

    pickItem(req2, res2);

    assert.deepEqual(res2._getStatusCode(), 200);
    assert.deepStrictEqual(draft2.getDraftedItems()[0], makeDraftItem(options2[0], 1, drafters2[0]));

    TEST_RESET();
  });

  it('getDraft', function() {
    const drafters1 = ['Billy', 'Bob', 'Mike'];
    const options1 = ['Snickers', 'Butterfinger', 'Skittles', 'M&Ms', 'SweetTarts', 'Dots', 'Milky Way'];
    const rounds1 = 2;

    const draft1 = makeDraft(drafters1, options1, rounds1);

    const ID1 = TEST_ADD_DRAFT(draft1);

    const req1 = httpMocks.createRequest(
      {method: 'GET', url: '/api/getDraft', query: {ID: "" + ID1}});
    const res11 = httpMocks.createResponse();
    getDraft(req1, res11);

    assert.strictEqual(res11._getStatusCode(), 200);
    assert.deepStrictEqual(res11._getJSONData().draftedItems, draft1.getDraftedItems());
    assert.deepStrictEqual(res11._getJSONData().undraftedItems, draft1.getUndraftedItems());
    assert.deepStrictEqual(res11._getJSONData().turn, draft1.getTurn());
    assert.deepStrictEqual(res11._getJSONData().over, draft1.isOver());

    draft1.pickItem(options1[0]); // round 1 pick 1
    
    const res12 = httpMocks.createResponse();
    getDraft(req1, res12);

    assert.strictEqual(res12._getStatusCode(), 200);
    assert.deepStrictEqual(res12._getJSONData().draftedItems, draft1.getDraftedItems());
    assert.deepStrictEqual(res12._getJSONData().undraftedItems, draft1.getUndraftedItems());
    assert.deepStrictEqual(res12._getJSONData().turn, draft1.getTurn());
    assert.deepStrictEqual(res12._getJSONData().over, draft1.isOver());

    draft1.pickItem(options1[1]); // round 1 pick 2
    draft1.pickItem(options1[2]); // round 1 pick 3
    draft1.pickItem(options1[3]); // round 2 pick 1
    draft1.pickItem(options1[4]); // round 2 pick 2
    draft1.pickItem(options1[5]); // round 2 pick 3
    // draft is over

    const res13 = httpMocks.createResponse();
    getDraft(req1, res13);

    assert.strictEqual(res13._getStatusCode(), 200);
    assert.deepStrictEqual(res13._getJSONData().draftedItems, draft1.getDraftedItems());
    assert.deepStrictEqual(res13._getJSONData().undraftedItems, draft1.getUndraftedItems());
    assert.deepStrictEqual(res13._getJSONData().turn, draft1.getTurn());
    assert.deepStrictEqual(res13._getJSONData().over, draft1.isOver());


    const drafters2 = ['Team 1', 'Team 2'];
    const options2 = ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5', 'Item 6', 'Item 7'];
    const rounds2 = 3;

    const draft2 = makeDraft(drafters2, options2, rounds2);

    const ID2 = TEST_ADD_DRAFT(draft2);

    const req2 = httpMocks.createRequest(
      {method: 'POST', url: '/api/getDraft', query: {ID: "" + ID2}});
    const res21 = httpMocks.createResponse();
    getDraft(req2, res21);

    assert.strictEqual(res21._getStatusCode(), 200);
    assert.deepStrictEqual(res21._getJSONData().draftedItems, draft2.getDraftedItems());
    assert.deepStrictEqual(res21._getJSONData().undraftedItems, draft2.getUndraftedItems());
    assert.deepStrictEqual(res21._getJSONData().turn, draft2.getTurn());
    assert.deepStrictEqual(res21._getJSONData().over, draft2.isOver());

    draft2.pickItem(options1[0]); // round 1 pick 1
    
    const res22 = httpMocks.createResponse();
    getDraft(req2, res22);

    assert.strictEqual(res22._getStatusCode(), 200);
    assert.deepStrictEqual(res22._getJSONData().draftedItems, draft2.getDraftedItems());
    assert.deepStrictEqual(res22._getJSONData().undraftedItems, draft2.getUndraftedItems());
    assert.deepStrictEqual(res22._getJSONData().turn, draft2.getTurn());
    assert.deepStrictEqual(res22._getJSONData().over, draft2.isOver());

    draft2.pickItem(options1[1]); // round 1 pick 2
    draft2.pickItem(options1[2]); // round 1 pick 3
    draft2.pickItem(options1[3]); // round 2 pick 1
    draft2.pickItem(options1[4]); // round 2 pick 2
    draft2.pickItem(options1[5]); // round 2 pick 3
    // draft is over

    const res23 = httpMocks.createResponse();
    getDraft(req2, res23);

    assert.strictEqual(res23._getStatusCode(), 200);
    assert.deepStrictEqual(res23._getJSONData().draftedItems, draft2.getDraftedItems());
    assert.deepStrictEqual(res23._getJSONData().undraftedItems, draft2.getUndraftedItems());
    assert.deepStrictEqual(res23._getJSONData().turn, draft2.getTurn());
    assert.deepStrictEqual(res23._getJSONData().over, draft2.isOver());

    TEST_RESET();
  });

});
