import React from "react";
import ReactDOM from "react-dom";
import marked from "marked";
import Playground from "component-playground";

const makeArray = (obj) =>
  Object.keys(obj).map((key) =>
    Object.assign({name: key}, obj[key]));

const markdownEscape = (markdown) => {
  // based on markdown-escape by Kyle E. Mitchell, under the ISC license
  // https://github.com/kemitchell/markdown-escape.js
  const replacements = [
    [ /\*/g, '\\*' ],
    [ /#/g, '\\#' ],
    [ /\(/g, '\\(' ],
    [ /\)/g, '\\)' ],
    [ /\[/g, '\\[' ],
    [ /\]/g, '\\]' ],
    [ /\</g, '&lt;' ],
    [ /\>/g, '&gt;' ],
    [ /_/g, '\\_' ] ];
  return replacements.reduce((string, replacement) => {
    return string.replace(replacement[0], replacement[1]);
  }, markdown);
};

const sassify = (name, value) => {
  let options;
  if (value === 'true' || value === 'false') {
    options = [
      'The \'%1\' property? I\'m glad you asked.',
      'Don\'t mess with Texas (but do mess with the \'%1\' property)',
      'We can even set \'%1\' to %2:',
      'Try %1 = %2:',
      value === 'true'
        ? 'So you want to make your component \'%1\'?'
        : '\'%1\'? Oh heck nah!',
      value === 'true'
        ? 'A \'%1\' component? Treat yo self!'
        : 'Let\'s tone down the \'%1\'-iness',
    ];
  } else {
    options = [
      'Let\'s throw a %1 on this...',
      'Want a %1? The only limit is your imagination.',
      '%1 can be %2...',
      'Try %1 = %2:',
      'Try %1 = %2 on for size.',
    ];
  }
  const index = Math.floor(Math.random() * options.length);
  return options[index].replace(/%1/g, name).replace(/%2/g, value);
};

class Overview extends React.Component {
  constructor(...args) {
    super(...args);
    if (this.props.playgroundautogen &&
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
    const propMap = makeArray(this.props.source.props);
    const title = 'Interactive Docs for ' + this.props.compname +
      (this.props.sassy ? ' (sassy=true)' : '') + '\n===\n\n';
    const toc = propMap.map((prop) => {
      return '[' + this.props.compname + prop.name + '](#prop-' + prop.name + ')';
    }).join('  \n') + '[API](#api)\n\n';
    const header = title + toc;
    return header + propMap.map((prop) => {
      if ('description' in prop && prop.description.indexOf('@examples ') !== -1) {
        const anchor = '<a name="prop-' + prop.name + '"></a>';
        const examples = prop.description.split('@examples ')[1].split(', ');
        return anchor + examples.map((value) => {
          const desc = this.props.sassy
            ? sassify(prop.name, value)
            : prop.name + ' = ' + value;
          return markdownEscape(desc) + '\n' +
            '---\n' +
            '```playground\n' +
            '<' + this.props.compname + ' ' + prop.name + '={' + value + '}>' +
            '</' + this.props.compname + '>\n' +
            '```';
        }).join('\n\n');
      } else {
        return '';
      }
    }).join('\n\n');
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
  sassy: React.PropTypes.bool,
  source: React.PropTypes.object,
  scope: React.PropTypes.object
};
