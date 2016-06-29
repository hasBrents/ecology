import React from "react";
import ReactDOM from "react-dom";
import marked from "marked";
import Playground from "component-playground";

const makeArray = (obj) =>
  Object.keys(obj).map((key) =>
    Object.assign({name: key}, obj[key]));

class Overview extends React.Component {
  constructor(...args) {
    super(...args);
    if (typeof this.props.playgroundautogen !== 'undefined' &&
      typeof this.props.compname === 'undefined') {
      throw new Error('compname must be defined when playgroundautogen is set to true');
    }
  }
  componentDidMount() {
    this.renderPlaygrounds();
  }
  findPlayground(className) {
    return ReactDOM.findDOMNode(this.refs.overview).getElementsByClassName(className);
  }
  renderPlaygrounds() {
    const playgrounds = Array.prototype.slice.call(this.findPlayground("lang-playground"), 0);
    for (const p in playgrounds) {
      if (playgrounds.hasOwnProperty(p)) {
        const source = playgrounds[p].textContent;
        ReactDOM.render(
          <div className="Interactive">
            <Playground
              codeText={source}
              scope={this.props.scope}
              noRender={true}
              theme={this.props.playgroundtheme ? this.props.playgroundtheme : "monokai"}/>
          </div>,
          playgrounds[p].parentNode
        );
      }
    }
    const playgroundsNoRender =
      Array.prototype.slice.call(this.findPlayground("lang-playground_norender"), 0);
    for (const p in playgroundsNoRender) {
      if (playgroundsNoRender.hasOwnProperty(p)) {
        const source = playgroundsNoRender[p].textContent;
        ReactDOM.render(
          <div className="Interactive">
            <Playground
              codeText={source}
              scope={this.props.scope}
              noRender={false}
              theme={this.props.playgroundtheme ? this.props.playgroundtheme : "monokai"}/>
          </div>,
          playgroundsNoRender[p].parentNode
        );
      }
    }
  }
  autogenMarkdown() {
    const title = 'Interactive Docs for ' + this.props.compname;
    const propMap = makeArray(this.props.source.props);
    return propMap.map((prop) => {
      if ('description' in prop && prop.description.indexOf('@examples ') !== -1) {
        const examples = JSON.parse('[' + prop.description.split('@examples ')[1] + ']');
        console.log('DEBUG: for property "' + prop.name + '" examples = ' + examples);
        return examples.map((value) => {
          return prop.name + ' = ' + value + '\n' +
            '---\n' +
            '```playground\n' +
            '<' + this.props.compname + ' ' + prop.name + '={' + value'}></' + this.props.compname + '>\n' +
            '```';
        }).join('\n\n');
      } else {
        return '';
      }
    }).join('');
  }
  render() {
    const markdown = this.props.playgroundautogen
      ? marked(this.autogenMarkdown())
      : marked(this.props.markdown);
    return (
      <div ref="overview" dangerouslySetInnerHTML={{__html: markdown}}>
      </div>
    );
  }
}

export default Overview;

Overview.propTypes = {
  compname: React.PropTypes.string,
  markdown: React.PropTypes.string,
  playgroundtheme: React.PropTypes.string,
  playgroundautogen: React.PropTypes.bool,
  source: React.PropTypes.object,
  scope: React.PropTypes.object
};
