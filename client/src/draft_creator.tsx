import React, { ChangeEvent, Component } from "react";
import './draft_creator.css';

interface draftCreatorProps {
    // Function to create a new draft with given fields.
    createCallback: (options: string[], drafters: string[], rounds: number, drafter: string) => void;
    backCallback: () => void; // Function to go back (change page to landing)
  }

interface draftCreatorState {
  optionsValue: string; // Value of options textarea
  draftersValue: string; // Value of drafters textarea
  roundValue: number; // Value of round input
  drafterValue: string; // Value of drafter input
}

// A component used to create drafts.
export class DraftCreator extends Component<draftCreatorProps, draftCreatorState> {

  constructor(props: any) {
    super(props);

    this.state = {optionsValue: '', draftersValue: '', roundValue: 0, drafterValue: ''};
  }

  // Updates either optionsValue or draftersValue to current value dependent on which one was changed.
  onTextChange = (evt: ChangeEvent<HTMLTextAreaElement>) => {
    if (evt.target.id === 'options') {
      this.setState({optionsValue: evt.target.value});
    } else {
      this.setState({draftersValue: evt.target.value});
    }
  }

  // Updates either roundValue or drafterValue to current value dependent on which one was changed.
  onInputChange = (evt : ChangeEvent<HTMLInputElement>) => {
    if (evt.target.type === 'number') {
      const num = parseInt(evt.target.value);
      this.setState({roundValue: num});
    } else {
      this.setState({drafterValue: evt.target.value});
    }
  }

  // Checks preconditions for making a draft and either make a draft or alerts the user to what 
  // input was invalid.
  buildDraft = () => {
    const optionsArr = this.state.optionsValue.split('\n');
    const draftersArr = this.state.draftersValue.split('\n');
    if ((optionsArr.length === 1 && optionsArr[0] === '') || (draftersArr.length === 1 && draftersArr[0] === '')) {
      alert("Options and drafters fields cannot be empty!");
      return;
    } else if (!(noDuplicates(optionsArr) && noDuplicates(draftersArr))) {
      alert("Can't have duplicate options or drafters!");
      return;
    } else if (this.state.roundValue * draftersArr.length > optionsArr.length) {
      alert("Too many rounds/drafters for the amount of options!");
      return;
    } else if (this.state.roundValue <= 0) {
      alert('Rounds has to be greater than 0');
      return;
    } else if (this.state.drafterValue === '') {
      alert('Drafter field must cannot be empty');
      return;
    } else if (optionsArr.includes('') || draftersArr.includes('')) {
      alert('Cannot have blank lines in options and drafters fields');
      return;
    }

    this.props.createCallback(optionsArr, draftersArr, this.state.roundValue, this.state.drafterValue);

  }

  // Renders DraftCreator
  render = (): JSX.Element => {
    return <div>
      <h1><b>Create Draft</b></h1>
      <div>
        <p className="inline">Drafter: </p>
        <input className="inline" value={this.state.drafterValue} onChange={this.onInputChange}></input>
      </div>
      <div>
        <p className="inline">Rounds: </p>
        <input className="inline round" type='number' value={this.state.roundValue} onChange={this.onInputChange}></input>
      </div>
      <div>
        <div className="inputs">
          <h2>Options</h2>
          <textarea id='options' value={this.state.optionsValue} onChange={this.onTextChange}></textarea>
        </div>
        <div className="inputs boarded">
          <h2>Drafters</h2>
          <textarea id='drafters' value={this.state.draftersValue} onChange={this.onTextChange}></textarea>
        </div>
      </div>
      <button onClick={this.buildDraft}>Create Draft</button>
      <button onClick={this.props.backCallback}>Back</button>
    </div>
  };

}

/**
 * Determines if an array contains duplicate values.
 * @param arr array of type T to check for duplicates
 * @returns true if arr has not duplicates else returns false
 */
function noDuplicates<T>(arr: T[]): boolean {
  return arr.length === new Set(arr).size;
}