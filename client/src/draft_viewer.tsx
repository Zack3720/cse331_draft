import React, { ChangeEvent, MouseEvent, Component } from "react";
import { DraftItem } from "./app";
import './draft_viewer.css';

const REFRESH_INT = 2000;

interface draftViewerProps {
    drafter: string; // The drafter that is viewing the component
    draftID: number; // ID of current draft
    turn: string; // The drafter whose turn it is currently 
    options: string[]; // List of undraft items
    draftedItems: DraftItem[]; // List of drafted items
    over: boolean; // Boolean of if the game is over or not

    pickItemCallback: (item: string) => void; // Function to pick an item
    refresh: () => void; // Function to refresh the draft (get new drafted items and player turn)
    backCallback: () => void; // Function to go back (change page to landing)
  }

interface draftViewerState {
  selectValue: string; // value of the pick item select
  timer: NodeJS.Timeout; // The current timer for refreshing
  // (this is used to clear it in the case of the back button)
}

// A component used to view and pick items from a draft.
export class DraftViewer extends Component<draftViewerProps, draftViewerState> {

  constructor(props: any) {
    super(props);

    
    this.state = {selectValue: '', timer: setTimeout(this.timedRefresh, REFRESH_INT)};
  }

  // Calls the refresh and sets another timer to call it again in REFRESH_INT milliseconds
  timedRefresh = () => {
    this.props.refresh();
    const timer = setTimeout(this.timedRefresh, REFRESH_INT);
    this.setState({timer: timer});
  }

  // Updates the selectValue to what is current shown on the screen
  onSelectChange = (evt: ChangeEvent<HTMLSelectElement>) => {
    this.setState({selectValue: evt.target.value});
  }

  // Picks an item if a value is selected
  onPickItem = (_: MouseEvent<HTMLButtonElement>) => {
    if (this.state.selectValue === '') {
      alert('Pick an item!');
    } else {
      this.props.pickItemCallback(this.state.selectValue);
    }
  }

  // onChange function for back to clear timer and call the backCallback
  onBack = () => {
    clearTimeout(this.state.timer);
    this.props.backCallback();
  }
  
  // Renders draftViewer
  render = (): JSX.Element => {
    const itemsList: JSX.Element[] = []
    this.props.draftedItems.forEach((item, index) => {
      itemsList.push(<li key={index}>
        <div className="draftedItem">
          <span>{item.index}</span>
          <span>{item.item}</span>
          <span>{item.drafter}</span>
        </div>
      </li>)
    })
    const top = <div>
      <h1>Draft Veiwer</h1>
      <p>ID: {this.props.draftID}</p>
      <div className="draftedItem">
        <span><b>Num</b></span>
        <span><b>Pick</b></span>
        <span><b>Drafter</b></span>
      </div>
      <ul>{itemsList}</ul>
    </div>

    if (this.props.over) {
      return <div>
        {top}
        <p>Draft is over!</p>
        <button onClick={this.onBack}>Back</button>
      </div>;

    } else if (this.props.drafter === this.props.turn) {
      const optionsList: JSX.Element[] = [<option value="">Select Item</option>]
      this.props.options.forEach((val, index) => {
        optionsList.push(<option value={val} key={index}>
          {val}
        </option>)
      });

      return <div> 
        {top}
        <p>Its your turn to pick.</p>
        <select value={this.state.selectValue} onChange={this.onSelectChange}>{optionsList}</select>
        <button onClick={this.onPickItem}>Pick Item</button>
        <button onClick={this.onBack}>Back</button>
      </div>;

    } else {
      return <div>
        {top}
        <p>Waiting on {this.props.turn} to pick... Gosh they take forever..</p>
        <button onClick={this.props.refresh}>Refresh</button>
        <button onClick={this.onBack}>Back</button>
      </div>;

    }
  };

}