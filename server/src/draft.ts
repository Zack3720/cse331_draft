
/** 
 * An ADT that represents a draft. Each draft stores a list of drafters and a list of options that 
 * are either drafted or not. Drafts can be mutated by picking an items which assigns it to a 
 * drafter.
 * obj = { drafters, options }
 * */  
export interface Draft {

    /**
     * gets the current turn of the draft
     * @returns The name of the drafter whose turn it is
     */
    getTurn(): string;

    /**
     * gets the current undrafted items
     * @returns a list of undrafted items
     */
    getUndraftedItems(): string[];

    /**
     * gets the current drafted items
     * @returns a list of drafted items as DraftItems
     */
    getDraftedItems(): DraftItem[];

    /**
     * gets the drafters of the draft
     * @returns a list of drafter names
     */
    getDrafters(): string[];

    /**
     * Drafts an undrafted item to the current drafter's whose turn it is
     * @param item Item to be drafted
     * @requires item is contained within the current undraft items
     * @requires !this.isOver the draft cannot be over
     */
    pickItem(item: string): void;

    /**
     * determines if the draft is over
     * @returns the boolean value of wether the draft is over or not
     */
    isOver(): boolean;
}

/**
 * Represents an item that has been drafted.
 * Stores information about the items drafting.
*/
export type DraftItem = {
    item: string        // Name of item
    index: number       // The index in which the item was drafted. Starts at 1
    drafter: string     // The name of the drafter who drafted this item
}

export function makeDraftItem(item: string, index: number, drafter: string): DraftItem {
    return {item: item, index: index, drafter:drafter};
}

// Implementation of Draft that uses two list to store drafted and undraft items.
class simpleDraft implements Draft {
    /**
     * AF:  obj.drafters = drafters
     *      obj.options = options ++ draftedItems.item
     *      That is that the options are the current options plus the items inside the DraftItems 
     *      stored in draftedItems.
     * 
     * RI:  options.length + draftedItems.length = m
     * 
     *      rounds * n <= m
     * 
     *      rounds is a positive integer
     * 
     *      draftedItems[i].drafter = drafters[i % n] for any 0 < i < n
     * 
     *      drafters[i] !== drafters[j] for all 0 <= i, j < n when i != j
     *      (there are no duplicate values in drafters)
     * 
     *      obj.options[i] !== obj.options[j] for all 0 <= i, j < m when i != j
     *      (there are no duplicate values in obj.options)
     * 
     *      m > 0
     * 
     *      n > 0
     * 
     *      where   n = drafters.length
     *              m = obj.options.length
     */

    drafters: string[];
    options: string[];
    draftedItems: DraftItem[];
    rounds: number;

    /**
     * Constructor for simpleDraft
     * @param drafters list of drafters
     * @requires drafters[i] !== drafters[j] for all 0 <= i, j < drafters.length when i != j 
     * @requires drafters to be non-empty
     * @param options list of options available in draft
     * @requires options[i] !== options[j] for all 0 <= i, j < options.length when i != j 
     * @requires options to be non-empty
     * @param rounds number of rounds in draft.
     * @requires rounds * drafters.length <= options.length
     */
    constructor(drafters: string[], options: string[], rounds: number) {
        this.drafters = drafters.slice(0);
        this.options = options.slice(0);
        this.draftedItems = [];
        this.rounds = rounds;
    }

    getTurn = (): string => { return this.drafters[this.draftedItems.length % this.drafters.length] }
    getUndraftedItems = (): string[] => { return this.options.slice(0) }
    getDraftedItems = (): DraftItem[] => { return this.draftedItems.slice(0) }
    getDrafters = (): string[] => { return this.drafters.slice(0) }
    isOver = (): boolean => { return this.draftedItems.length === this.rounds * this.drafters.length }
    pickItem = (item: string): void => {
        if (this.isOver()) {
            throw new Error('Draft is over');
        }
        const optionsIndex = this.options.indexOf(item);
        if (optionsIndex === undefined) {
            throw new Error(`${item} is not in the remaining list of options for this draft`);
        }

        const drafter = this.getTurn();
        const index = this.draftedItems.length + 1; // Add one since the index of draftedItems starts at 1
        const draftedItem = makeDraftItem(item, index, drafter);
        this.options.splice(optionsIndex, 1);
        this.draftedItems.push(draftedItem);
    }
}

/**
 * Factory function for creating a draft
 * @param drafters list of drafters
 * @requires drafters[i] !== drafters[j] for all 0 <= i, j < drafters.length when i != j 
 * @requires drafters to be non-empty
 * @param options list of options available in draft
 * @requires options[i] !== options[j] for all 0 <= i, j < options.length when i != j 
 * @requires options to be non-empty
 * @param rounds number of rounds in draft.
 * @requires rounds * drafters.length <= options.length
 * @returns new Draft with given values and no draftedItems
 */
export function makeDraft(drafters: string[], options: string[], rounds: number): Draft {
    if (rounds * drafters.length > options.length) {
        throw new Error('rounds * drafters.length was not less than or equal to options.length');
    } else if (options.length === 0) {
        throw new Error('options must be a non-empty arrray');
    } else if (drafters.length === 0) {
        throw new Error('options must be a non-empty arrray');
    }

    return new simpleDraft(drafters, options, rounds);
}