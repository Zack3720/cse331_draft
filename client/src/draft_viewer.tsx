import React, { ChangeEvent, MouseEvent, Component } from "react";
import { DraftItem } from "./app";
import './draft_viewer.css';

const REFRESH_INT = 2000;

interface draftViewerProps {
    // will probably need something here
    drafter: string;
    draftID: number;
    turn: string;
    options: string[];
    draftedItems: DraftItem[];
    over: boolean;

    pickItemCallback: (item: string) => void;
    refresh: () => void;
    backCallback: () => void;
  }

interface draftViewerState {
  // will probably need something here
  selectValue: string;
  timer: NodeJS.Timeout;
}


export class DraftViewer extends Component<draftViewerProps, draftViewerState> {

  constructor(props: any) {
    super(props);

    
    this.state = {selectValue: '', timer: setTimeout(this.timedRefresh, REFRESH_INT)};
  }

  timedRefresh = () => {
    this.props.refresh();
    const timer = setTimeout(this.timedRefresh, REFRESH_INT);
    this.setState({timer: timer});
  }

  onSelectChange = (evt: ChangeEvent<HTMLSelectElement>) => {
    this.setState({selectValue: evt.target.value});
  }

  onPickItem = (_: MouseEvent<HTMLButtonElement>) => {
    if (this.state.selectValue === '') {
      alert('Pick an item!');
    } else {
      this.props.pickItemCallback(this.state.selectValue);
    }
  }

  onBack = () => {
    clearTimeout(this.state.timer);
    this.props.backCallback();
  }
  
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