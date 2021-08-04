import React, { Component } from 'react';
import './visWidgetConfig.css';
import { FontAwesomeIcon as Icon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { getComparisonById } from 'network/networkRequests';
import { Table } from 'reactstrap';

class SearchBar extends React.Component {
  constructor(props) {
    super(props);
    this.handleFilterTextChange = this.handleFilterTextChange.bind(this);
  }
  
  handleFilterTextChange(e) {
    this.props.onFilterTextChange(e.target.value);
  }
  
  
  render() {
    return (
      <form>
        <input
          type="text"
          placeholder="Search..."
          value={this.props.filterText}
          onChange={this.handleFilterTextChange}
        />
      </form>
    );
  }
}

class ExampleA extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            requestedData: null,
			filterText : ''
        };
		this.handleFilterTextChange = this.handleFilterTextChange.bind(this);
    }
	
	handleFilterTextChange(filterText) {
		this.setState({
			filterText: filterText
		});
	}

    componentDidMount() {
        // fetch data
        this.getData();
    }

    getData = () => {
        getComparisonById('R44930').then(dataFrame => {
            this.setState({ requestedData: dataFrame, loading: false });
        });
    };

    renderData = () => {
        // create an authors array;
        const authorStatements = this.state.requestedData.statementsData.content.filter(item => item.predicate.id === 'P27');

        if (!this.state.requestedData) {
            return <div>Some error</div>;
        } else {
            return (
                <div>
                    <div>
                        Title: <b>{this.state.requestedData.resourceMetaData.label}</b>; Number of contributions:{' '}
                        <b>{this.state.requestedData.comparisonData.contributions.length}</b>
                    </div>
                    <div>
                        Authors:{' '}
                        {authorStatements.map(item => {
                            return item.object.label + '; ';
                        })}
                    </div>
                    <div>Comparison Data:</div>
					<SearchBar
						filterText={this.state.filterText}
						onFilterTextChange={this.handleFilterTextChange}
					/>
                    {this.renderComparisonTable()}
                </div>
            );
        }
    };

    renderComparisonTable = () => {
        const dataFrame = this.state.requestedData.comparisonData;
        return (
            <Table dark striped>
                {/*  define headers*/}
                <thead style={{ borderTop: '1px solid black', borderBottom: '1px solid black' }}>
                    <tr>
                        <th
                            style={{
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                borderRight: '1px solid black',
                                borderLeft: '1px solid black',
                                padding: '3px'
                            }}
                        >
                            Contribution
                        </th>
                        {dataFrame.properties
                            .filter(property => property.active === true)
                            .map(property => {
                                return (
                                    <th
                                        key={property.label}
                                        style={{
                                            whiteSpace: 'nowrap',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            borderRight: '1px solid black',
                                            padding: '3px'
                                        }}
                                    >
                                        {property.label}
                                    </th>
                                );
                            })}
                    </tr>
                </thead>
                <tbody>
                    {Object.keys(dataFrame.data).map((data, id) => {
						var willRender = this.createRows(id);
						if (willRender)
							return (
								<tr key={'tr_id' + id} style={{ border: '1px solid black', borderTop: 'none' }}>
									<td
										key={'td_id_' + id}
										style={{
											whiteSpace: 'nowrap',
											overflow: 'hidden',
											textOverflow: 'ellipsis',
											borderRight: '1px solid black',
											borderLeft: '1px solid black',
											padding: '3px',
											maxWidth: '200px'
										}}
									>
										{dataFrame.contributions[id].contributionLabel +
											'(' +
											dataFrame.contributions[id].id +
											'/' +
											dataFrame.contributions[id].paperId +
											')'}
									</td>
									{willRender}
								</tr>
							);
                    })}
                </tbody>
            </Table>
        );
    };
    createRows = rowId => {
        // property filtering
        const dataFrame = this.state.requestedData.comparisonData;
        const activeProperties = dataFrame.properties.filter(property => property.active === true);
		var willRender=false; // the row may or may not render depending if filterText is found in some cell.
        var tentativeReturn =  activeProperties.map(property => {
            const dataValues = dataFrame.data[property.id][rowId];
            return (
                <td
                    key={'td_id' + rowId + '_' + property.id}
                    style={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        borderRight: '1px solid black',
                        padding: '3px',
                        maxWidth: '200px'
                    }}
                >
					{ (property.id === "SAME_AS") ?  // only wikipedia links should be clickable
						dataValues.map(val => {
							willRender = val.label ? (willRender || (val.label.indexOf(this.state.filterText) !== -1)) : willRender;
							return <a href={val.label}> {val.label} </a>;
						})
					: //else part
						dataValues.map(val => {
							willRender = val.label ? (willRender || (val.label.indexOf(this.state.filterText) !== -1)) : willRender;
							return val.label + ' ';
						})}
                </td>
            );
        });
		return willRender ? tentativeReturn : null;
    };

    /** Component Rendering Function **/
    render() {
        return (
            <div>
                <div className={'headerStyle'}>
                    Example A: Comparisons{' '}
                    <a style={{ color: '#e86161' }} href="https://www.orkg.org/orkg/comparison/R44930">
                        COVID-19 Reproductive Number Estimates
                    </a>
                </div>
                <div className={'bodyStyle'}>
                    {this.state.loading && (
                        <h2 className="h5">
                            <span>
                                <Icon icon={faSpinner} spin />
                            </span>{' '}
                            Loading ...
                        </h2>
                    )}
                    {!this.state.loading && this.renderData()}
                </div>
            </div>
        );
    }
}

export default ExampleA;
