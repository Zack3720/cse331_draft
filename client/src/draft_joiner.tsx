import React, { ChangeEvent, Component } from "react";
import './draft_creator.css';

interface draftJoinerProps {
    // will probably need something here
  }

interface draftJoinerState {
  // will probably need something here
  drafterValue: string;
  IDValue: number;
}


export class DraftJoiner extends Component<draftJoinerProps, draftJoinerState> {

  constructor(props: any) {
    super(props);

    this.state = {drafterValue:'', IDValue:0};
  }

  onInputChange = (evt : ChangeEvent<HTMLInputElement>) => {
    if (evt.target.type === 'number') {
      const num = parseInt(evt.target.value);
      this.setState({IDValue: num});
    } else {
      this.setState({drafterValue: evt.target.value});
    }
  }
  
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
      <button>Join</button>
    </div>;
  };

}