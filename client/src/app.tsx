import React, { Component } from "react";
import { DraftCreator } from "./draft_creator";
import { DraftJoiner } from "./draft_joiner";
import { DraftViewer } from "./draft_viewer";

type page = 'landing' | 'creator' | 'joiner' | 'viewer'

export type DraftItem = {
  item: string        // Name of item
  index: number       // The index in which the item was drafted. Starts at 1
  drafter: string     // The name of the drafter who drafted this item
}

function isDraftItem(val: any): val is DraftItem {
  return typeof val === 'object' && 
          val !== null && 
          'item' in val && typeof val.item === 'string' &&
          'index' in val && typeof val.index === 'number' &&
          'drafter' in val && typeof val.drafter === 'string';
} 

interface AppState {
  /** 
   * RI: turn, drafter, draftID, draftedItems, undraftedItems, isOver == undefined if page != 'viewer'
   *     turn, drafter, draftID, draftedItems, undraftedItems, isOver != undefined if page = 'viewer'
   */
  page: page; // The page that is currently shown

  // All the following are about the current draft. They will be undefined if there is no current draft
  // (same as what the RI says)
  turn?: string; // The drafter whose turn it is currently 
  drafter?: string; // The drafter that is viewing the app
  draftID?: number; // ID of current draft
  draftedItems?: DraftItem[]; // List of drafted items
  undraftedItems?: string[]; // List of undraft items
  isOver?: boolean; // Boolean of if the game is over or not
}


export class App extends Component<{}, AppState> {

  constructor(props: any) {
    super(props);

    this.state = {page: 'landing'};
  }

  // Switches page to given page.
  swtichPage = (p: page) => {
    this.setState({page: p});
  } 

  // creates a draft with the given info.
  createDraft = (options: string[], drafters: string[], rounds: number, drafter: string) => {
    console.log(this);
    const url = "/api/createDraft";
    const body = {'items': options,'drafters': drafters,'rounds': rounds};
    const type = {method: 'POST', body: JSON.stringify(body), headers: {'Content-Type': 'application/json'}};
    console.log(type);

    fetch(url, type).then((res) => {
      if (res.status === 200) {
        console.log(res);
        return res.json();
      } else {
        this.handleClientError(res);
        throw new Error('Client Error');
      }
    }).then((val) => {
      if (typeof val === 'number') {
        this.refreshDraft(drafter, val);
      } else {
        console.log(val);
        throw new Error('Bad Data from Server');
      }
    }).catch((e: Error) => {
      console.error(e.message);
    })
  }

  // Updates state for all optional fields
  // Then sets the page to viewer
  refreshDraft = (drafter: string, draftID: number) => {
    const url = "/api/getDraft?ID=" + draftID;
    
    fetch(url).then((res) => {
      if (res.status === 200) {
        return res.json();
      } else {
        this.handleClientError(res);
        throw new Error('Client Error');
      }
    }).then((val) => {
      // val should be {draftedItems: DraftItem[], undraftedItems: string[], turn: string, over: boolean}
      const recievedDraftedItems = val.draftedItems;
      const recievedUndraftedItems = val.undraftedItems;
      const recievedTurn = val.turn;
      const recievedOver = val.over;
      if (Array.isArray(recievedDraftedItems) && Array.isArray(recievedUndraftedItems) &&
          typeof recievedTurn === 'string' && typeof recievedOver === 'boolean') {
        const draftedItems: DraftItem[] = [];
        recievedDraftedItems.forEach((item) => {
          if (isDraftItem(item)) {
            draftedItems.push(item);
          } else {
            throw new Error('Bad Data from Server')
          }
        });
        const undraftedItems: string[] = [];
        recievedUndraftedItems.forEach((item) => {
          if (typeof item === 'string') {
            undraftedItems.push(item);
          } else {
            throw new Error('Bad Data from Server')
          }
        });
        this.setState({drafter: drafter, draftID: draftID, draftedItems: draftedItems, undraftedItems: undraftedItems, 
                       turn: recievedTurn, isOver: recievedOver, page: 'viewer'});
      } else {
        throw new Error('Bad Data from Server')
      }
    }).catch((e: Error) => {
      console.error(e.message);
    });
  }

  // Only call if this.state.page === 'viewer'
  pickItem = (item: string) => {
    console.log(this);
    if (this.state.drafter === undefined || this.state.draftID === undefined ||
      this.state.draftedItems === undefined || this.state.turn === undefined ||
      this.state.isOver === undefined || this.state.undraftedItems === undefined) {
      throw new Error('No draft to pickItem for.')
    }

    const url = "/api/pickItem?" +
                "ID=" + this.state.draftID +
                "&drafter=" + this.state.drafter;
    const body = {'item': item};
    const type = {method: 'POST', body: JSON.stringify(body), headers: {'Content-Type': 'application/json'}}
    fetch(url, type).then((res) => {
      if (res.status === 200) {
        if (this.state.draftID === undefined || this.state.drafter === undefined) {
          throw new Error('State changed. draftID or drafter is undefined');
        }
        this.refreshDraft(this.state.drafter ,this.state.draftID);
        return;
      } else {
        this.handleClientError(res);
        throw new Error('Client Error');
      }
    }).catch((e: Error) => {
      console.error(e.message);
    });
  }

  // Method for case that res.status != 200
  // Alerts the user with releavant info
  handleClientError = (res: Response) => {
    switch (res.status) {
      case 400:
      case 409: // All these cases mean that I wrote some code wrong, user isn't at fault.
        alert(res.statusText);
        break;
      case 403: // This means that it is not the drafter's turn. If this is the case they either
                // clicked pick item multiple times or tried to send multiple pick requests at 
                // the same time.
        alert("Don't click so fast!");
        break;
      case 404: // ID not found. This is user's fault so we alert them so.
        alert('Draft with provided ID not found');
        break;
      default:
        alert(`Something went wrong. \nStatus: ${res.status} ${res.statusText}`);
    }
  }

  // renders app
  render = (): JSX.Element => {
    switch (this.state.page) {
      case 'landing':
        return <div>
          <h1> Landing Page! </h1>
          <button type='button' onClick={() => {this.swtichPage('creator')}}>Create Draft</button>
          <button type='button' onClick={() => {this.swtichPage('joiner')}}>Join Draft</button>
        </div>
      case 'creator':
        return <div>
          <DraftCreator createCallback={this.createDraft} backCallback={() => {this.swtichPage('landing')}}/>
        </div>;
      case 'joiner':
        return <div>
          <DraftJoiner joinCallback={this.refreshDraft} backCallback={() => {this.swtichPage('landing')}}/>
        </div>;
      case 'viewer':
        if (this.state.drafter === undefined || this.state.draftID === undefined ||
            this.state.draftedItems === undefined || this.state.turn === undefined ||
            this.state.isOver === undefined || this.state.undraftedItems === undefined) {
              throw new Error("Rep Invariant Broken: " +
              "draftID = undefined && draftedItems = undefined && drafter = undefined if page != 'viewer'")
            }
        const drafter = this.state.drafter
        const id = this.state.draftID
        return <div>
          <DraftViewer drafter={this.state.drafter} draftID={this.state.draftID} turn={this.state.turn} over={this.state.isOver}
                       draftedItems={this.state.draftedItems} options={this.state.undraftedItems} pickItemCallback={this.pickItem}
                       refresh={() => {this.refreshDraft(drafter, id)}} backCallback={() => {this.swtichPage('landing')}}/>
        </div>;
    }
  };

}
