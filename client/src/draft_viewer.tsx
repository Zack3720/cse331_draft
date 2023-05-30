import React, { ChangeEvent, Component } from "react";
import { DraftItem } from "./app";
import './draft_viewer.css';

interface draftViewerProps {
    // will probably need something here
    drafter: string;
    draftID: number;
    turn: string;
    options: string[];
    draftedItems: DraftItem[];
    over: boolean;

    pickItem: (item: string) => void;
  }

interface draftViewerState {
  // will probably need something here
  selectValue: string;
}


export class DraftViewer extends Component<draftViewerProps, draftViewerState> {

  constructor(props: any) {
    super(props);

    this.state = {selectValue: ''};
  }

  onSelectChange = (evt: ChangeEvent<HTMLSelectElement>) => {
    this.setState({selectValue: evt.target.value});
  }
  
  render = (): JSX.Element => {
    const itemsList: JSX.Element[] = []
    this.props.draftedItems.forEach((item) => {
      itemsList.push(<li key={item.item}>
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

    if (this.props.drafter === this.props.turn) {
      const optionsList: JSX.Element[] = [<option value="">Select Item</option>]
      this.props.options.forEach((val) => {
        optionsList.push(<option value={val}>
          {val}
        </option>)
      });

      return <div> 
        {top}
        <p>Its your turn to pick.</p>
        <select value={this.state.selectValue} onChange={this.onSelectChange}>{optionsList}</select>
      </div>;

    } else if (this.props.over) {
      return <div>
        {top}
        <p>Draft is over!</p>
      </div>;

    } else {
      return <div>
        {top}
        <p>Waiting on {this.props.turn} to pick... Gosh they take forever..</p>
        <button>Refresh</button>
      </div>;

    }
  };

}