import { Request, Response } from "express";
import { Draft, makeDraft } from "./draft";

let DRAFTS: Draft[] = [];

/** Returns a list of all the named save files. */
export function Dummy(req: Request, res: Response) {
  const name = first(req.query.name);
  if (name === undefined) {
    res.status(400).send('missing "name" parameter');
  } else {
    res.json(`Hi, ${name}`);
  }
}

/**
 * Creates a new draft with given values. Returns ID of draft.
 * @param req HTTP request
 * @requires req.body.rounds number of rounds
 * @requires req.body.items array of (string) items/options
 * @requires req.body.drafters array of (string) drafters
 * @param res HTTP response
 * @modifies res
 * @effects res contains ID or
 *          if an error occurs, res.statusCode && res.statusMessage will be changed accordingly
 */
export function createDraft(req: Request, res: Response) {
  const rounds = req.body.rounds;
  const recievedItems = req.body.items;
  const recievedDrafters = req.body.drafters;
  if (typeof rounds !== 'number') {
    res.status(400).statusMessage = "Bad Request: rounds not number";
    res.end();
    return;
  } else if (!Array.isArray(recievedItems)) {
    res.status(400).statusMessage = "Bad Request: items not array";
    res.end();
    return;
  } else if (!Array.isArray(recievedDrafters)) {
    res.status(400).statusMessage = "Bad Request: drafters not array";
    res.end();
    return;
  }

  const items: string[] = [];
  recievedItems.forEach((val) => {
    if (typeof val !== 'string') {
      res.status(400).statusMessage = "Bad Request: items not array of strings";
      res.end();
    } else {
      items.push(val);
    }
  });
  const drafters: string[] = [];
  recievedDrafters.forEach((val) => {
    if (typeof val !== 'string') {
      res.status(400).statusMessage = "Bad Request: items not array of strings";
      res.end();
    } else {
      drafters.push(val);
    }
  });

  if (res.statusCode === 400) {
    return;
  } else if (rounds * drafters.length > items.length) {
    res.status(400).statusMessage = "Bad Request: rounds * drafters.lengths must be greater than items.length";
    res.end();
    return;
  } else if (drafters.length === 0) {
    res.status(400).statusMessage = "Bad Request: drafters.length cannot be 0";
    res.end();
    return;
  } else if (items.length === 0) {
    res.status(400).statusMessage = "Bad Request: items.length cannot be 0";
    res.end();
    return;
  }

  
  const newDraft: Draft = makeDraft(drafters, items, rounds);
  const ID = DRAFTS.length; // Making ID equal to the index of the draft
  DRAFTS.push(newDraft);
  res.json(ID);
}

/**
 * Picks an item for the current drafter.
 * @param req HTTP request
 * @requires req.query.ID ID of draft
 * @requires req.query.drafter name of drafter
 * @requires req.body.item item to be drafted (string)
 * @requires !draft.isOver Draft cannot be over
 * @param res HTTP response
 * @modifies res
 * @effects if an error occurs, res.statusCode && res.statusMessage will be changed accordingly
 */
export function pickItem(req: Request, res: Response) {
  const drafter = first(req.query.drafter);
  const item = first(req.body.item);

  if (drafter === undefined) {
    res.status(400).statusMessage = "Bad Request: drafter not provided in query";
    res.end();
    return;
  } else if (item === undefined) {
    res.status(400).statusMessage = "Bad Request: item not provided in body";
    res.end();
    return;
  }

  const draft = findDraft(req, res);

  if (draft === undefined) {
    return;
  } else if (draft.getTurn() !== drafter) {
    res.status(403).statusMessage = "Forbidden: Not drafter's turn";
    res.end();
    return;
  } else if (draft.isOver()) {
    res.status(409).statusMessage = "Conflict: Draft is over";
    res.end();
    return;
  } else if (!draft.getUndraftedItems().includes(item)) {
    res.status(400).statusMessage = "Bad Request: Draft does not contain item";
    res.end();
    return;
  }

  draft.pickItem(item);
  res.json();

}

/**
 * Returns drafted items of draft with given ID.
 * @param req HTTP request
 * @requires req.query.ID ID of draft
 * @param res HTTP response
 * @modifies res
 * @effects res.json() = {draftedItems: DraftItem[], undraftedItems: string[], turn: string, over: boolean}
 *          if an error occurs, res.statusCode && res.statusMessage will be changed accordingly
 */
export function getDraft(req: Request, res: Response) {
  const draft = findDraft(req, res);

  if (draft !== undefined) {
    res.json({draftedItems: draft.getDraftedItems(), undraftedItems: draft.getUndraftedItems(), turn: draft.getTurn(), over: draft.isOver()});
  }
}

/**
 * Test function to reset DRAFTS
 * @modifies DRAFTS
 * @effects DRAFTS = []
 */
export function TEST_RESET() {
  DRAFTS = [];
}

/**
 * Adds a draft to DRAFTS
 * @param draft draft to add to DRAFTS
 * @modifies DRAFTS
 * @effects DRAFTS = DRAFTS.push(draft)
 * @returns ID of draft
 */
export function TEST_ADD_DRAFT(draft: Draft): number {
  const ID = DRAFTS.length;
  DRAFTS.push(draft);
  return ID;
}

/**
 * Returns a draft with given ID
 * @param ID ID of draft to return
 */
export function TEST_GET_DRAFT(ID: number): Draft {
  return DRAFTS[ID];
}

/**
 * Gets a draft from an request with an ID or returns undefined if not possible
 * @param req HTTP request
 * @param res HTTP response
 * @modifies res
 * @effects if an error occurs, res.statusCode && res.statusMessage will be changed accordingly
 * @returns Draft from DRAFTS with given ID or
 *          undefined if an error occured
 */
function findDraft(req: Request, res: Response): Draft | undefined {
  const recievedID = first(req.query.ID);

  if (recievedID === undefined) {
    res.status(400).statusMessage = "Bad Request: ID not provided in query";
    res.end();
    return;
  }

  const ID = parseInt(recievedID);

  if (isNaN(ID)) {
    res.status(400).statusMessage = "Bad Request: ID is NaN";
    res.end();
    return;
  } else if (ID < 0 || ID > DRAFTS.length) {
    res.status(404).statusMessage = "ID Not Found";
    res.end();
    return;
  }

  return DRAFTS[ID];
}

// Helper to return the (first) value of the parameter if any was given.
// (This is mildly annoying because the client can also give mutiple values,
// in which case, express puts them into an array.)
function first(param: any): string|undefined {
  if (Array.isArray(param)) {
    return first(param[0]);
  } else if (typeof param === 'string') {
    return param;
  } else {
    return undefined;
  }
}
