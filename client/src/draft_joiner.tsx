import React, { ChangeEvent, Component } from "react";
import './draft_creator.css';

interface draftJoinerProps {
    joinCallback: (drafter: string, id: number) => void; // Function to join/view a draft
    backCallback: () => void; // Function to go back (change page to landing)
  }

interface draftJoinerState {
  drafterValue: string; // Value of drafter input
  IDValue: number; // Value of ID input
}

// Component used to join drafts.
export class DraftJoiner extends Component<draftJoinerProps, draftJoinerState> {

  constructor(props: any) {
    super(props);

    this.state = {drafterValue:'', IDValue:0};
  }

  // Updates either IDValue or drafterValue to current value dependent on which one was changed.
  onInputChange = (evt : ChangeEvent<HTMLInputElement>) => {
    if (evt.target.type === 'number') {
      const num = parseInt(evt.target.value);
      this.setState({IDValue: num});
    } else {
      this.setState({drafterValue: evt.target.value});
    }
  }

  // Checks to make sure fields are not empty and then tries to join the draft.
  // (The fetch request will determine if the draft exists)
  joinDraft = () => {
    if (this.state.drafterValue === '') {
      alert('Drafter field cannot be empty');
    } else {
      this.props.joinCallback(this.state.drafterValue, this.state.IDValue);
    }
  }
  
  // Renders the DraftJoiner
  render = (): JSX.Element => {
    return <div>
      <h1>Join Draft</h1>
      <div>
        <p className="inline">Drafter: </p>
        <input className="inline" value={this.state.drafterValue} onChange={this.onInputChange}></input>
      </div>
      <div>
        <p className="inline">ID: </p>
        <input className="inline round" type='number' value={this.state.IDValue} onChange={this.onInputChange}></input>
      </div>
      <button onClick={this.joinDraft}>Join</button>
      <button onClick={this.props.backCallback}>Back</button>
    </div>;
  };

}