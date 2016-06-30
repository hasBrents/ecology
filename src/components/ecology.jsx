import React from "react";
import API from "./api";
import Overview from "./overview";

export default class Ecology extends React.Component {
  renderAPI(source) {
    if (source) {
      return (
        <div className="Documentation">
          <API source={this.props.source}/>
        </div>
      );
    }
  }
  render() {
    return (
      <div className="Ecology">
        <div className="Overview">
          <Overview
            compname={this.props.compname}
            markdown={this.props.overview}
            scope={this.props.scope}
            playgroundautogen={this.props.playgroundautogen}
            playgroundtheme={this.props.playgroundtheme}
            sassy={this.props.sassy}
            source={this.props.source}/>
        </div>
        {this.renderAPI(this.props.source)}
      </div>
    );
  }
}

Ecology.propTypes = {
  compname: React.PropTypes.string,
  overview: React.PropTypes.string,
  playgroundautogen: React.PropTypes.bool,
  playgroundtheme: React.PropTypes.string,
  sassy: React.PropTypes.bool,
  source: React.PropTypes.object,
  scope: React.PropTypes.object
};

Ecology.defaultProps = {
  playgroundautogen: false,
  sassy: false
};
